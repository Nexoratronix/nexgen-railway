import { connectToDatabase } from "@/lib/db";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import { authMiddleware } from "@/middleware/auth";
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = formidable({
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5 MB limit
  });

  let fields, files;
  try {
    ({ fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    }));

    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
    const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
    const message = Array.isArray(fields.message) ? fields.message[0] : fields.message;
    const jobId = Array.isArray(fields.jobId) ? fields.jobId[0] : fields.jobId;
    const resume = Array.isArray(files.resume) ? files.resume[0] : files.resume;

    if (!name || !email || !message || !jobId || !resume) {
      if (resume?.filepath) await fs.unlink(resume.filepath);
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = req.user;
    if (!user) {
      if (resume?.filepath) await fs.unlink(resume.filepath);
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate job exists
    const { db } = await connectToDatabase();
    const job = await db.collection("jobs").findOne({ jobId: jobId });
    if (!job) {
      if (resume?.filepath) await fs.unlink(resume.filepath);
      return res.status(400).json({ message: `Invalid Job ID: ${jobId} not found` });
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/jpg",
    ];
    
    if (!resume.mimetype || !allowedTypes.includes(resume.mimetype)) {
      if (resume?.filepath) await fs.unlink(resume.filepath);
      return res.status(400).json({ message: "Invalid file type" });
    }

    // Upload resume to Cloudinary
    let resumeUrl;
    try {
      const timestamp = Date.now();
      const originalFilename = resume.originalFilename || `resume_${timestamp}`;
      const extension = path.extname(originalFilename);
      const publicId = `resumes/${timestamp}-${user.id}${extension}`; // Include extension for clarity

      console.log("Uploading to Cloudinary with publicId:", publicId);
      const resourceType = resume.mimetype.startsWith("image/") ? "image" : "raw";
      const uploadResult = await cloudinary.uploader.upload(resume.filepath, {
        public_id: publicId,
        resource_type: resourceType,
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || "job_applications",
        access_mode: "public", // Ensure public access
        transformation: [{ fetch_format: "auto" }], 
      });

      console.log("Cloudinary upload result:", uploadResult);
      resumeUrl = uploadResult.secure_url;
      await fs.unlink(resume.filepath);
    } catch (uploadError) {
      if (resume?.filepath) await fs.unlink(resume.filepath);
      console.error("Cloudinary upload error:", uploadError);
      return res.status(500).json({ message: "Failed to upload resume to Cloudinary", error: uploadError.message });
    }

    // Save application with Cloudinary URL
    const application = {
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      jobId: jobId,
      name,
      email,
      message,
      resumeUrl: resumeUrl, // Store Cloudinary URL instead of local path
      createdAt: new Date(),
    };

    const result = await db.collection("jobApplications").insertOne(application);

    // User notification with jobId
    const userNotification = {
      message: `You have successfully applied for job (Job ID: ${jobId})`,
      type: "job-application",
      recipientId: user.id,
      relatedId: result.insertedId.toString(),
      jobId: jobId,
      isRead: false,
      createdAt: new Date(),
    };
    const userNotificationResult = await db.collection("notifications").insertOne(userNotification);
    await global.redisPublisher.publish(
      `notifications:${user.id}`,
      JSON.stringify({
        ...userNotification,
        _id: userNotificationResult.insertedId.toString(),
      })
    );

    // Admin notifications with jobId
    const admins = await db.collection("users").find({ role: { $in: ["admin", "superadmin"] } }).toArray();
    const adminNotifications = admins.map((admin) => ({
      message: `${name} has applied for job (Job ID: ${jobId})`,
      type: "job-application-admin",
      recipientId: admin._id.toString(),
      relatedId: result.insertedId.toString(),
      jobId: jobId,
      isRead: false,
      createdAt: new Date(),
    }));
    if (adminNotifications.length > 0) {
      const adminNotificationResults = await db.collection("notifications").insertMany(adminNotifications);
      const insertedIds = Object.values(adminNotificationResults.insertedIds);
      for (let i = 0; i < adminNotifications.length; i++) {
        const adminNotification = adminNotifications[i];
        await global.redisPublisher.publish(
          `notifications:${adminNotification.recipientId}`,
          JSON.stringify({
            ...adminNotification,
            _id: insertedIds[i].toString(),
          })
        );
      }
    }

    res.status(200).json({
      message: "Application submitted successfully",
      jobId: jobId,
    });
  } catch (error) {
    if (files?.resume?.[0]?.filepath) {
      await fs.unlink(files.resume[0].filepath);
    }
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export default authMiddleware(handler);