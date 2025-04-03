import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Col,
  Row,
  Container,
  Collapse,
  NavbarToggler,
  NavItem,
  NavLink,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  Spinner,
  Button,
} from "reactstrap";

import Link from "next/link";
import io from "socket.io-client";
import { useRouter } from "next/router";
import classname from "classnames";
import Image from "next/image";
import withRouter from "../../components/withRouter"; // This is the updated withRouter HOC for Next.js
import darkLogo from "../../assets/images/logo/logo.png";

import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify"; // For better error/success messages
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
let socket;

const NavBar = (props) => {
  const [message, setMessage] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const [home, setHome] = useState(false);
  const [company, setCompany] = useState(false);
  const [pages, setPages] = useState(false);
  const [blog, setBlog] = useState(false);
  const [userId, setUserId] = useState(null);
  const dropDownNotification = () => setNotificationOpen((prevState) => !prevState);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasBeenAuthenticated, setHasBeenAuthenticated] = useState(false);

  const [userProfile, setUserProfile] = useState(false);
  const dropDownuserprofile = () => setUserProfile((prevState) => !prevState);
  const socketInitialized = useRef(false);
  // Scroll navbar
  const [navClass, setnavClass] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", scrollNavigation, true);
    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("scroll", scrollNavigation, true);
    };
  }, []);

  function scrollNavigation() {
    var scrollup = window.pageYOffset;
    if (scrollup > 0) {
      setnavClass("nav-sticky");
    } else {
      setnavClass("");
    }
  }

  const removeActivation = (items) => {
    for (var i = 0; i < items.length; ++i) {
      var item = items[i];
      const parent = items[i].parentElement;
      if (item && item.classList.contains("active")) {
        item.classList.remove("active");
      }
      if (parent) {
        if (parent.classList.contains("active")) {
          parent.classList.remove("active");
        }
      }
    }
  };

  // Menu activation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Use router.pathname instead of props.router.location.pathname
    const pathName = router.pathname;
    var matchingMenuItem = null;
    var ul = document.getElementById("navbarCollapse");
    var items = ul.getElementsByTagName("a");

    removeActivation(items);
    for (var i = 0; i < items.length; ++i) {
      // Compare with the href attribute of the <a> tag
      const itemPath = new URL(items[i].href).pathname;
      if (pathName === itemPath) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }
  }, [router.pathname]); // Update dependency href router.pathname

  function activateParentDropdown(item) {
    item.classList.add("active");
    const parent = item.parentElement.parentElement.parentElement;

    if (parent) {
      parent.classList.add("active"); // li
      const parent2 = parent.parentElement;
      parent2.classList.add("active"); // li
      const parent3 = parent2.parentElement;
      if (parent3) {
        parent3.classList.add("active"); // li
        const parent4 = parent3.parentElement;
        if (parent4) {
          parent4.classList.add("active"); // li
          const parent5 = parent4.parentElement;
          if (parent5) {
            parent5.classList.add("active"); // li
            const parent6 = parent5.parentElement;
            if (parent6) {
              parent6.classList.add("active"); // li
            }
          }
        }
      }
    }
    return false;
  }

  // Handle sign-out
  const handleSignOut = async () => {
    setMessage("");
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUserData(null);
        setUserProfile(false);
        setIsAuthenticated(false);
        setUserId(null);
        setHasBeenAuthenticated(false); // Reset authentication tracking
        setMessage(data.message);
        setTimeout(() => {
          router.push("/signout");
        }, 1000);
      } else {
        setMessage(data.message || "Failed to sign out");
      }
    } catch (error) {
      setMessage("Failed to sign out. Please try again.");
    }
  };

  // Refresh token if access token is expired
  const refreshToken = async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Token refreshed successfully");
        return true;
      } else {
        console.error("Failed to refresh token:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  };

  // Notification logic
  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });
      console.log("Response from /api/auth/me:", response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log("User data:", data);
        setUserId(data.id);
        setIsAuthenticated(true);
        setHasBeenAuthenticated(true); // Mark that the user has been authenticated
      } else if (response.status === 401) {
        // Attempt to refresh the token
        const refreshed = await refreshToken();
        if (refreshed) {
          // Retry the auth check after refreshing the token
          const retryResponse = await fetch("/api/auth/me", {
            method: "GET",
            credentials: "include",
          });
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            setUserId(data.id);
            setIsAuthenticated(true);
            setHasBeenAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            // Only show toast if the user was previously authenticated
            if (hasBeenAuthenticated) {
              toast.error("Session expired. Please sign in again.");
              handleSignOut();
            }
          }
        } else {
          setIsAuthenticated(false);
          // Only show toast if the user was previously authenticated
          if (hasBeenAuthenticated) {
            toast.error("Session expired. Please sign in again.");
            handleSignOut();
          }
        }
      } else {
        setIsAuthenticated(false);
        // Only show toast if the user was previously authenticated
        if (hasBeenAuthenticated) {
          toast.error("Unauthorized: Please sign in to view notifications");
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setIsAuthenticated(false);
      // Only show toast if the user was previously authenticated
      if (hasBeenAuthenticated) {
        toast.error("Failed to authenticate. Please sign in again.");
      }
    }
  };

  const fetchUserId = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setUserId(data.id);
      }
    } catch (error) {
      console.error("Failed to fetch user ID:", error);
    }
  };

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !userId) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/notifications", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const retryResponse = await fetch("/api/notifications", {
            method: "GET",
            credentials: "include",
          });
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            setNotifications(retryData.notifications || []);
          } else {
            setError("Session expired. Please sign in again.");
            setIsAuthenticated(false);
            setUserData(null);
            setUserId(null);
            if (hasBeenAuthenticated) {
              toast.error("Session expired. Please sign in again.");
            }
            router.push("/signin");
          }
        } else {
          setError("Session expired. Please sign in again.");
          setIsAuthenticated(false);
          setUserData(null);
          setUserId(null);
          if (hasBeenAuthenticated) {
            toast.error("Session expired. Please sign in again.");
          }
          router.push("/signin");
        }
      } else {
        setError("Failed to fetch notifications");
        if (hasBeenAuthenticated) {
          toast.error("Failed to fetch notifications");
        }
      }
    } catch (err) {
      setError("Failed to fetch notifications. Please try again.");
      if (hasBeenAuthenticated) {
        toast.error("Failed to fetch notifications. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userId, router, hasBeenAuthenticated]);

  useEffect(() => {
    checkAuth();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      if (response.ok) {
        toast.success("Notification marked as read");
      } else {
        toast.error("Failed to mark notification as read");
      }
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (response.ok) {
        toast.success("All notifications marked as read");
      } else {
        toast.error("Failed to mark all notifications as read");
      }
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    }
  };

  const clearAllNotifications = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearAll: true }),
      });
      if (response.ok) {
        toast.success("All notifications cleared");
      } else {
        toast.error("Failed to clear notifications");
      }
    } catch (error) {
      toast.error("Failed to clear notifications");
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    if (notification.type === "job-application-admin" && notification.relatedId) {
      router.push(`/dashboard/job-applications?applicationId=${notification.relatedId}`);
    }
  };

  const unreadCount = notifications.filter((notif) => !notif.isRead).length;

  // Fetch user data on component mount and when route changes
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setUserData(data);
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData(null);
      } finally {
        // setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router.asPath]);

  // Handle sign-in button click
  const handleSignIn = () => {
    router.push("/signin");
  };

  // Initialize WebSocket
  useEffect(() => {
    fetchUserId();
    checkAuth();

    if (isAuthenticated && userId && !socketInitialized.current) {
      socket = io("http://localhost:3000", {
        path: "/socket.io",
        transports: ["websocket", "polling"],
      });

      socket.on("connect", () => {
        console.log("Connected to WebSocket server");
        socket.emit("join", userId);
      });

      socket.on("newNotification", (message) => {
        console.log("New notification received:", message);
        if (message.type === "update") {
          setNotifications(message.data || []);
        } else if (message.type === "clear") {
          setNotifications([]);
        } else {
          setNotifications((prev) => [message, ...prev]);
          toast.info("New notification received!");
        }
      });

      socket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error);
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from WebSocket server");
      });

      socketInitialized.current = true;

      return () => {
        socket.disconnect();
        socketInitialized.current = false;
      };
    }
  }, [isAuthenticated, userId]);

  // Fetch notifications when authenticated (consolidated into one useEffect)
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchNotifications();
    }
  }, [isAuthenticated, userId, fetchNotifications]);
  return (
    <React.Fragment>
      <nav
        className={"navbar navbar-expand-lg fixed-top sticky p-0 " + navClass}
        id="navigation"
      >
        <Container fluid className="custom-container">
          {/* Replace React Router Link with Next.js Link */}
          <Link href="/" className="navbar-brand text-dark fw-bold me-auto">
            <Image src={darkLogo} height="80" alt="" className="logo-dark" style={{ height: "6rem", width: "6rem" }} />
            {/* <img src={lightLogo} height="22" alt="" className="logo-light" /> */}
          </Link>
          <div>
            <NavbarToggler
              className="me-3"
              type="button"
              onClick={() => toggle()}
            >
              <i className="mdi mdi-menu"></i>
            </NavbarToggler>
          </div>
          <Collapse
            isOpen={isOpen}
            className="navbar-collapse"
            id="navbarCollapse"
          >
            <ul className="navbar-nav mx-auto navbar-center">
              <NavItem>
                {/* Replace React Router Link with Next.js Link */}
                <Link href="/" className="nav-link">
                  Home
                </Link>
              </NavItem>

              <NavItem>
                {/* Replace React Router Link with Next.js Link */}
                <Link href="/aboutus" className="nav-link">
                  About Us
                </Link>
              </NavItem>
              <NavItem>
                {/* Replace React Router Link with Next.js Link */}
                <Link href="/services" className="nav-link">
                  Services
                </Link>
              </NavItem>

              {/* Commented code remains unchanged */}
              {/* <NavItem className="dropdown dropdown-hover">
                <NavLink
                  href="/#"
                  id="jobsdropdown"
                  role="button"
                  onClick={() => setCompany(!company)}
                >
                  Company <div className="arrow-down"></div>
                </NavLink>
                <ul
                  className={classname("dropdown-menu dropdown-menu-center", {
                    show: company
                  })}
                  aria-labelledby="jobsdropdown"
                >
                  <li>
                    <Link className="dropdown-item" href="/aboutus">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" href="/services">
                      Services
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" href="/team">
                      Team
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" href="/pricing">
                      Pricing
                    </Link>
                  </li>
                  <Link className="dropdown-item" href="/privacyandpolicy">
                    Priacy & Policy
                  </Link>
                  <li>
                    <Link className="dropdown-item" href="/faqs">
                      Faqs
                    </Link>
                  </li>
                </ul>
              </NavItem> */}
              {/* <li className="nav-item dropdown dropdown-hover">
                <Link
                  href="/#"
                  id="pagesdoropdown"
                  className="nav-link dropdown-toggle arrow-none"
                  onClick={() => setPages(!pages)}
                >
                  Pages <div className="arrow-down"></div>
                </Link>
                <div
                  className={classname(
                    "dropdown-menu dropdown-menu-lg dropdown-menu-center",
                    { show: pages }
                  )}
                  aria-labelledby="pagesdoropdown"
                >
                  <Row>
                    <Col lg={4}>
                      <span className="dropdown-header">Jobs</span>
                      <div>
                        <Link className="dropdown-item" href="/joblist">
                          Job List
                        </Link>
                        <Link className="dropdown-item" href="/joblist2">
                          Job List-2
                        </Link>
                        <Link className="dropdown-item" href="/jobgrid">
                          Job Grid
                        </Link>
                        <Link className="dropdown-item" href="/jobgrid2">
                          Job Grid-2
                        </Link>
                        <Link className="dropdown-item" href="/jobdetails">
                          Job Details
                        </Link>
                        <Link className="dropdown-item" href="/jobscategories">
                          Jobs Categories
                        </Link>
                      </div>
                    </Col>
                    <Col lg={4}>
                      <span className="dropdown-header">
                        Candidates / Companys
                      </span>
                      <div>
                        <Link className="dropdown-item" href="/candidatelist">
                          Candidate List
                        </Link>
                        <Link className="dropdown-item" href="/candidategrid">
                          Candidate Grid
                        </Link>
                        <Link className="dropdown-item" href="/candidatedetails">
                          Candidate Details
                        </Link>
                        <Link className="dropdown-item" href="/companylist">
                          Company List
                        </Link>
                        <Link className="dropdown-item" href="/companydetails">
                          Company Details
                        </Link>
                      </div>
                    </Col>
                    <Col lg={4}>
                      <span className="dropdown-header">Extra Pages</span>
                      <div>
                        <Link className="dropdown-item" href="/signup">
                          Sign Up
                        </Link>
                        <Link className="dropdown-item" href="/signin">
                          Sign In
                        </Link>
                        <Link className="dropdown-item" href="/signout">
                          Sign Out
                        </Link>
                        <Link className="dropdown-item" href="/resetpassword">
                          Reset Password
                        </Link>
                        <Link className="dropdown-item" href="/comingsoon">
                          Coming Soon
                        </Link>
                        <Link className="dropdown-item" href="/error404">
                          404 Error
                        </Link>
                        <Link className="dropdown-item" href="/components">
                          Components
                        </Link>
                      </div>
                    </Col>
                  </Row>
                </div>
              </li> */}
              {/* <NavItem className="dropdown dropdown-hover">
                <NavLink
                  href="/#"
                  id="productdropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  onClick={() => setBlog(!blog)}
                >
                  Blog <div className="arrow-down"></div>
                </NavLink>
                <ul
                  className={classname("dropdown-menu dropdown-menu-center", {
                    show: blog
                  })}
                  aria-labelledby="productdropdown"
                >
                  <li>
                    <Link className="dropdown-item" href="/blog">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" href="/bloggrid">
                      Blog Grid
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" href="/blogmodern">
                      Blog Modern
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" href="/blogmasonary">
                      Blog Masonry
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" href="/blogdetails">
                      Blog details
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" href="/blogauther">
                      Blog Author
                    </Link>
                  </li>
                </ul>
              </NavItem> */}
              <NavItem>
                {/* Replace React Router Link with Next.js Link */}
                <Link href="/contact" className="nav-link">
                  Contact
                </Link>
              </NavItem>

              <NavItem className="dropdown dropdown-hover">
                <NavLink
                  href="/#" // Use href instead of href for NavLink
                  id="productdropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  onClick={() => setBlog(!blog)}
                >
                  More <div className="arrow-down"></div>
                </NavLink>
                <ul
                  className={classname("dropdown-menu dropdown-menu-center", {
                    show: blog
                  })}
                  aria-labelledby="productdropdown"
                >
                  {/* <li>
                    <Link className="dropdown-item" href="/blogmodern">
                      Blog
                    </Link>
                  </li> */}
                  <li>
                    {/* Replace React Router Link with Next.js Link */}
                    <Link href="/jobgrid2" className="dropdown-item">
                      Opportunity
                    </Link>
                  </li>
                  {/* <Link className="dropdown-item" href="/jobscategories">
                    Jobs Categories
                  </Link> */}

                  {/* <Link className="dropdown-item" href="/HireCandidate">
                    Hire Candidate
                  </Link> */}
                </ul>
              </NavItem>
            </ul>
          </Collapse>

          {/* Commented code remains unchanged */}
          <ul className="header-menu list-inline d-flex align-items-center mb-0">
            {isAuthenticated && userId && (
              <li className="list-inline-item me-4">
                <Dropdown isOpen={notificationOpen} toggle={dropDownNotification}>
                  <DropdownToggle
                    href="#"
                    className="header-item noti-icon position-relative"
                    id="notification"
                    type="button"
                    tag="a"
                    aria-label="Notifications"
                    style={{ paddingRight: "0px" }}
                  >
                    <i className="mdi mdi-bell fs-22"></i>
                    {unreadCount > 0 && (
                      <div
                        className="count position-absolute"
                        style={{
                          backgroundColor: "#ff4d4f",
                          color: "white",
                          borderRadius: "50%",
                          padding: "2px 6px",
                          fontSize: "12px",
                          top: "5px",
                          right: "-5px", // Adjusted right to keep badge visible
                        }}
                      >
                        {unreadCount}
                      </div>
                    )}
                  </DropdownToggle>
                  <DropdownMenu
                    className="dropdown-menu-sm dropdown-menu-end p-0"
                    aria-labelledby="notification"
                    end
                    style={{
                      minWidth: "300px",
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                    }}
                  >
                    <div className="notification-header border-bottom bg-light p-3 ">
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Notifications</h6>
                        {unreadCount > 0 && (
                          <Button
                            color="link"
                            size="sm"
                            className="p-0 text-primary"
                            onClick={markAllAsRead}
                            aria-label="Mark all notifications as read"
                          >
                            Mark all as read
                          </Button>
                        )}
                      </div>
                      <p className="text-muted fs-13 mb-0">
                        You have {unreadCount} unread notifications
                      </p>
                    </div>
                    <div
                      className="notification-wrapper dropdown-scroll "
                      style={{ maxHeight: "300px", overflowY: "auto" }}
                    >
                      {loading && (
                        <div className="text-center p-3">
                          <Spinner size="sm" color="primary" />
                        </div>
                      )}
                      {error && (
                        <p className="text-danger text-center p-2" role="alert">
                          {error}
                        </p>
                      )}
                      {!loading && notifications.length === 0 && !error && (
                        <p className="text-center p-2">No notifications</p>
                      )}
                      {!loading &&
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            className={`notification-item d-block p-3 ${!notif.isRead ? "bg-light" : ""
                              }`}
                            style={{ cursor: "pointer", borderBottom: "1px solid #f1f1f1" }}
                            onClick={() => handleNotificationClick(notif)}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") handleNotificationClick(notif);
                            }}
                            aria-label={`Notification: ${notif.message}`}
                          >
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0 me-3">
                                <div
                                  className={`avatar-xs ${!notif.isRead ? "bg-primary" : "bg-secondary"
                                    } text-white rounded-circle text-center`}
                                >
                                  <i
                                    className={
                                      notif.type === "sign-in"
                                        ? "uil uil-user-check"
                                        : "uil uil-briefcase"
                                    }
                                  ></i>
                                </div>
                              </div>
                              <div className="flex-grow-1">
                                <h6
                                  className={`mt-0 mb-1 fs-14 ${!notif.isRead ? "fw-bold" : ""
                                    }`}
                                >
                                  {notif.message}
                                </h6>
                                <p className="mb-0 fs-12 text-muted">
                                  <i className="mdi mdi-clock-outline"></i>{" "}
                                  <span>
                                    {formatDistanceToNow(new Date(notif.createdAt), {
                                      addSuffix: true,
                                    })}
                                  </span>
                                </p>
                              </div>
                              {!notif.isRead && (
                                <div className="flex-shrink-0">
                                  <Button
                                    color="link"
                                    size="sm"
                                    className="p-0 text-primary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notif._id);
                                    }}
                                    aria-label={`Mark notification as read: ${notif.message}`}
                                  >
                                    <i className="mdi mdi-check"></i>
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                    {notifications.length > 0 && (
                      <div className="notification-footer border-top text-center p-2">
                        <Button
                          color="link"
                          className="primary-link fs-13"
                          onClick={clearAllNotifications}
                          aria-label="Clear all notifications"
                        >
                          <i className="mdi mdi-trash-can me-1"></i>
                          <span>Clear All</span>
                        </Button>
                      </div>
                    )}
                  </DropdownMenu>
                </Dropdown>
              </li>
            )}
            <Dropdown className="list-inline mb-0">
              {userData ? (

                <Dropdown
                  onClick={() => setUserProfile(!userProfile)}
                  isOpen={userProfile}
                  toggle={dropDownuserprofile}
                  className="list-inline-item"
                >
                  <DropdownToggle
                    href="#"
                    className="header-item d-flex align-items-center"
                    id="userdropdown"
                    type="button"
                    tag="a"
                    aria-expanded="false"
                  >
                    <div
                      className="rounded-circle me-1 d-flex align-items-center justify-content-center"
                      style={{
                        width: "30px",
                        height: "30px",
                        backgroundColor: "rgb(45 229 14)",
                        color: "#fff",
                        fontSize: "18px",
                        fontWeight: "bold",
                      }}
                    >
                      {userData.username ? userData.username.charAt(0).toUpperCase() : ""}
                    </div>
                    <span className="d-none d-md-inline-block fw-medium align-items-center justify-content-center">
                      Hi, {userData.username}
                    </span>
                  </DropdownToggle>
                  <DropdownMenu
                    className="dropdown-menu-end"
                    aria-labelledby="userdropdown"
                    end
                  >
                    {/* <li>
                      <Link className="dropdown-item" href="/managejobs">
                        Manage Jobs
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" href="/bookmarkjobs">
                        Bookmarks Jobs
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" href="/myprofile">
                        My Profile
                      </Link>
                    </li> */}
                    <li>
                      <Link className="dropdown-item" href="/signout"
                        onClick={handleSignOut}
                      >

                        Sign Out
                      </Link>
                    </li>
                  </DropdownMenu>
                </Dropdown>
              ) : (
                // Show Sign In button if user is not signed in
                <li className="list-inline-item">
                  <button className="btn btn-primary" onClick={handleSignIn}>
                    Sign In
                  </button>
                </li>
              )}
            </Dropdown>
          </ul>
        </Container>
      </nav>
    </React.Fragment>
  );
};

export default withRouter(NavBar);

// import React, { useState, useEffect, useCallback, useRef } from "react";
// import {
//   Container,
//   Collapse,
//   NavbarToggler,
//   Dropdown,
//   DropdownToggle,
//   DropdownMenu,
//   Spinner,
//   Button,
// } from "reactstrap";
// import Link from "next/link";
// import io from "socket.io-client";
// import { useRouter } from "next/router";
// import classname from "classnames";
// import Image from "next/image";
// import withRouter from "../../components/withRouter";
// import darkLogo from "../../assets/images/logo/logo.png";
// import { formatDistanceToNow } from "date-fns";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// let socket;

// const NavBar = () => {
//   const router = useRouter();
//   const [isOpen, setIsOpen] = useState(false);
//   const [navClass, setNavClass] = useState("");
//   const [notificationOpen, setNotificationOpen] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [userData, setUserData] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [activeMenu, setActiveMenu] = useState("");
//   const [blogDropdown, setBlogDropdown] = useState(false);

//   const toggle = () => setIsOpen(!isOpen);
//   const dropDownNotification = () => setNotificationOpen((prev) => !prev);

//   // Ref to track WebSocket initialization
//   const socketInitialized = useRef(false);

//   // Scroll navigation
//   useEffect(() => {
//     const handleScroll = () => {
//       const scrollup = window.pageYOffset;
//       setNavClass(scrollup > 0 ? "nav-sticky" : "");
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // Menu activation using React state
//   useEffect(() => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//     setActiveMenu(router.pathname);
//   }, [router.pathname]);

//   // Check authentication status
//   const checkAuth = async () => {
//     try {
//       const response = await fetch("/api/auth/me", {
//         method: "GET",
//         credentials: "include",
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setUserId(data.id);
//         setIsAuthenticated(true);
//         setUserData(data);
//       } else if (response.status === 401) {
//         const refreshed = await refreshToken();
//         if (refreshed) {
//           const retryResponse = await fetch("/api/auth/me", {
//             method: "GET",
//             credentials: "include",
//           });
//           if (retryResponse.ok) {
//             const data = await retryResponse.json();
//             setUserId(data.id);
//             setIsAuthenticated(true);
//             setUserData(data);
//           } else {
//             setIsAuthenticated(false);
//             setUserData(null);
//           }
//         } else {
//           setIsAuthenticated(false);
//           setUserData(null);
//         }
//       } else {
//         setIsAuthenticated(false);
//         setUserData(null);
//       }
//     } catch (error) {
//       console.error("Error checking auth:", error);
//       setIsAuthenticated(false);
//       setUserData(null);
//     }
//   };

//   // Refresh token if access token is expired
//   const refreshToken = async () => {
//     try {
//       const response = await fetch("/api/auth/refresh", {
//         method: "POST",
//         credentials: "include",
//       });
//       if (response.ok) {
//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.error("Error refreshing token:", error);
//       return false;
//     }
//   };

//   // Fetch notifications
//   const fetchNotifications = useCallback(async () => {
//     if (!isAuthenticated || !userId) return;

//     setLoading(true);
//     setError("");
//     try {
//       const response = await fetch("/api/notifications", {
//         method: "GET",
//         credentials: "include",
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setNotifications(data.notifications || []);
//       } else if (response.status === 401) {
//         const refreshed = await refreshToken();
//         if (refreshed) {
//           const retryResponse = await fetch("/api/notifications", {
//             method: "GET",
//             credentials: "include",
//           });
//           if (retryResponse.ok) {
//             const retryData = await retryResponse.json();
//             setNotifications(retryData.notifications || []);
//           } else {
//             setError("Session expired. Please sign in again.");
//             setIsAuthenticated(false);
//             setUserData(null);
//             setUserId(null);
//             router.push("/signin");
//           }
//         } else {
//           setError("Session expired. Please sign in again.");
//           setIsAuthenticated(false);
//           setUserData(null);
//           setUserId(null);
//           router.push("/signin");
//         }
//       } else {
//         setError("Failed to fetch notifications");
//       }
//     } catch (err) {
//       setError("Failed to fetch notifications. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }, [isAuthenticated, userId, router]);

//   // Initialize WebSocket
//   useEffect(() => {
//     checkAuth();

//     if (isAuthenticated && userId && !socketInitialized.current) {
//       socket = io("http://localhost:3000", {
//         path: "/socket.io",
//         transports: ["websocket", "polling"],
//       });

//       socket.on("connect", () => {
//         console.log("Connected to WebSocket server");
//         socket.emit("join", userId);
//       });

//       socket.on("newNotification", (message) => {
//         console.log("New notification received:", message);
//         if (message.type === "update") {
//           setNotifications(message.data || []);
//         } else if (message.type === "clear") {
//           setNotifications([]);
//         } else {
//           setNotifications((prev) => [message, ...prev]);
//           toast.info("New notification received!");
//         }
//       });

//       socket.on("connect_error", (error) => {
//         console.error("WebSocket connection error:", error);
//       });

//       socket.on("disconnect", () => {
//         console.log("Disconnected from WebSocket server");
//       });

//       socketInitialized.current = true;

//       return () => {
//         socket.disconnect();
//         socketInitialized.current = false;
//       };
//     }
//   }, [isAuthenticated, userId]);

//   // Fetch notifications when authenticated
//   useEffect(() => {
//     if (isAuthenticated && userId) {
//       fetchNotifications();
//     }
//   }, [isAuthenticated, userId, fetchNotifications]);

//   // Handle sign-in button click
//   const handleSignIn = () => {
//     router.push("/signin");
//   };

//   // Handle sign-out
//   const handleSignOut = async () => {
//     try {
//       const response = await fetch("/api/auth/signout", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.ok) {
//         setUserData(null);
//         setIsAuthenticated(false);
//         setUserId(null);
//         setNotifications([]);
//         router.push("/signout");
//       } else {
//         toast.error("Failed to sign out");
//       }
//     } catch (error) {
//       toast.error("Failed to sign out. Please try again.");
//     }
//   };

//   // Notification actions
//   const markAsRead = async (notificationId) => {
//     try {
//       const response = await fetch("/api/notifications", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ notificationId }),
//       });
//       if (response.ok) {
//         fetchNotifications();
//       } else {
//         toast.error("Failed to mark notification as read");
//       }
//     } catch (error) {
//       toast.error("Failed to mark notification as read");
//     }
//   };

//   const markAllAsRead = async () => {
//     try {
//       const response = await fetch("/api/notifications", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ markAll: true }),
//       });
//       if (response.ok) {
//         fetchNotifications();
//       } else {
//         toast.error("Failed to mark all notifications as read");
//       }
//     } catch (error) {
//       toast.error("Failed to mark all notifications as read");
//     }
//   };

//   const clearAllNotifications = async () => {
//     try {
//       const response = await fetch("/api/notifications", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ clearAll: true }),
//       });
//       if (response.ok) {
//         setNotifications([]);
//       } else {
//         toast.error("Failed to clear notifications");
//       }
//     } catch (error) {
//       toast.error("Failed to clear notifications");
//     }
//   };

//   const handleNotificationClick = (notification) => {
//     if (!notification.isRead) {
//       markAsRead(notification._id);
//     }
//     if (notification.type === "job-application-admin" && notification.relatedId) {
//       router.push(`/dashboard/job-applications?applicationId=${notification.relatedId}`);
//     }
//   };

//   const unreadCount = notifications.filter((notif) => !notif.isRead).length;

//   return (
//     <React.Fragment>
//       <nav
//         className={classname("navbar navbar-expand-lg fixed-top sticky p-0", navClass)}
//         id="navigation"
//       >
//         <Container fluid className="custom-container">
//           <Link href="/" className="navbar-brand text-dark fw-bold me-auto">
//             <Image
//               src={darkLogo}
//               height="80"
//               alt="Logo"
//               className="logo-dark"
//               style={{ height: "6rem", width: "6rem" }}
//             />
//           </Link>
//           <div>
//             <NavbarToggler className="me-3" type="button" onClick={toggle}>
//               <i className="mdi mdi-menu"></i>
//             </NavbarToggler>
//           </div>
//           <Collapse isOpen={isOpen} className="navbar-collapse" id="navbarCollapse">
//             <ul className="navbar-nav mx-auto navbar-center">
//               <li className="nav-item">
//                 <Link
//                   href="/"
//                   className={classname("nav-link", { active: activeMenu === "/" })}
//                 >
//                   Home
//                 </Link>
//               </li>
//               <li className="nav-item">
//                 <Link
//                   href="/aboutus"
//                   className={classname("nav-link", { active: activeMenu === "/aboutus" })}
//                 >
//                   About Us
//                 </Link>
//               </li>
//               <li className="nav-item">
//                 <Link
//                   href="/services"
//                   className={classname("nav-link", { active: activeMenu === "/services" })}
//                 >
//                   Services
//                 </Link>
//               </li>
//               <li className="nav-item">
//                 <Link
//                   href="/contact"
//                   className={classname("nav-link", { active: activeMenu === "/contact" })}
//                 >
//                   Contact
//                 </Link>
//               </li>
//               <li className="nav-item dropdown dropdown-hover">
//                 <a
//                   href="#"
//                   className={classname("nav-link dropdown-toggle", {
//                     active: activeMenu.startsWith("/jobgrid2"),
//                   })}
//                   onClick={() => setBlogDropdown(!blogDropdown)}
//                 >
//                   More <div className="arrow-down"></div>
//                 </a>
//                 <ul
//                   className={classname("dropdown-menu dropdown-menu-center", {
//                     show: blogDropdown,
//                   })}
//                 >
//                   <li>
//                     <Link href="/jobgrid2" className="dropdown-item">
//                       Opportunity
//                     </Link>
//                   </li>
//                 </ul>
//               </li>
//             </ul>
//             <ul className="header-menu list-inline d-flex align-items-center mb-0">
//               {isAuthenticated && userId && (
//                 <li className="list-inline-item me-4">
//                   <Dropdown isOpen={notificationOpen} toggle={dropDownNotification}>
//                     <DropdownToggle
//                       href="#"
//                       className="header-item noti-icon position-relative"
//                       id="notification"
//                       type="button"
//                       tag="a"
//                       aria-label="Notifications"
//                     >
//                       <i className="mdi mdi-bell fs-22"></i>
//                       {unreadCount > 0 && (
//                         <div
//                           className="count position-absolute"
//                           style={{
//                             backgroundColor: "#ff4d4f",
//                             color: "white",
//                             borderRadius: "50%",
//                             padding: "2px 6px",
//                             fontSize: "12px",
//                             top: "-5px",
//                             right: "-5px",
//                           }}
//                         >
//                           {unreadCount}
//                         </div>
//                       )}
//                     </DropdownToggle>
//                     <DropdownMenu
//                       className="dropdown-menu-sm dropdown-menu-end p-0"
//                       aria-labelledby="notification"
//                       end
//                       style={{ minWidth: "300px" }}
//                     >
//                       <div className="notification-header border-bottom bg-light p-3">
//                         <div className="d-flex justify-content-between align-items-center">
//                           <h6 className="mb-0">Notifications</h6>
//                           {unreadCount > 0 && (
//                             <Button
//                               color="link"
//                               size="sm"
//                               className="p-0 text-primary"
//                               onClick={markAllAsRead}
//                               aria-label="Mark all notifications as read"
//                             >
//                               Mark all as read
//                             </Button>
//                           )}
//                         </div>
//                         <p className="text-muted fs-13 mb-0">
//                           You have {unreadCount} unread notifications
//                         </p>
//                       </div>
//                       <div
//                         className="notification-wrapper dropdown-scroll"
//                         style={{ maxHeight: "300px", overflowY: "auto" }}
//                       >
//                         {loading && (
//                           <div className="text-center p-3">
//                             <Spinner size="sm" color="primary" />
//                           </div>
//                         )}
//                         {error && (
//                           <p className="text-danger text-center p-2" role="alert">
//                             {error}
//                           </p>
//                         )}
//                         {!loading && notifications.length === 0 && !error && (
//                           <p className="text-center p-2">No notifications</p>
//                         )}
//                         {!loading &&
//                           notifications.map((notif) => (
//                             <div
//                               key={notif._id}
//                               className={`notification-item d-block p-3 ${
//                                 !notif.isRead ? "bg-light" : ""
//                               }`}
//                               style={{ cursor: "pointer", borderBottom: "1px solid #f1f1f1" }}
//                               onClick={() => handleNotificationClick(notif)}
//                               role="button"
//                               tabIndex={0}
//                               onKeyPress={(e) => {
//                                 if (e.key === "Enter") handleNotificationClick(notif);
//                               }}
//                               aria-label={`Notification: ${notif.message}`}
//                             >
//                               <div className="d-flex align-items-center">
//                                 <div className="flex-shrink-0 me-3">
//                                   <div
//                                     className={`avatar-xs ${
//                                       !notif.isRead ? "bg-primary" : "bg-secondary"
//                                     } text-white rounded-circle text-center`}
//                                   >
//                                     <i
//                                       className={
//                                         notif.type === "sign-in"
//                                           ? "uil uil-user-check"
//                                           : "uil uil-briefcase"
//                                       }
//                                     ></i>
//                                   </div>
//                                 </div>
//                                 <div className="flex-grow-1">
//                                   <h6
//                                     className={`mt-0 mb-1 fs-14 ${
//                                       !notif.isRead ? "fw-bold" : ""
//                                     }`}
//                                   >
//                                     {notif.message}
//                                   </h6>
//                                   <p className="mb-0 fs-12 text-muted">
//                                     <i className="mdi mdi-clock-outline"></i>{" "}
//                                     <span>
//                                       {formatDistanceToNow(new Date(notif.createdAt), {
//                                         addSuffix: true,
//                                       })}
//                                     </span>
//                                   </p>
//                                 </div>
//                                 {!notif.isRead && (
//                                   <div className="flex-shrink-0">
//                                     <Button
//                                       color="link"
//                                       size="sm"
//                                       className="p-0 text-primary"
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         markAsRead(notif._id);
//                                       }}
//                                       aria-label={`Mark notification as read: ${notif.message}`}
//                                     >
//                                       <i className="mdi mdi-check"></i>
//                                     </Button>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           ))}
//                       </div>
//                       {notifications.length > 0 && (
//                         <div className="notification-footer border-top text-center p-2">
//                           <Button
//                             color="link"
//                             className="primary-link fs-13"
//                             onClick={clearAllNotifications}
//                             aria-label="Clear all notifications"
//                           >
//                             <i className="mdi mdi-trash-can me-1"></i>
//                             <span>Clear All</span>
//                           </Button>
//                         </div>
//                       )}
//                     </DropdownMenu>
//                   </Dropdown>
//                 </li>
//               )}
//               <li className="list-inline-item">
//                 {userData ? (
//                   <Dropdown
//                     isOpen={blogDropdown}
//                     toggle={() => setBlogDropdown(!blogDropdown)}
//                     className="list-inline-item"
//                   >
//                     <DropdownToggle
//                       href="#"
//                       className="header-item"
//                       id="userdropdown"
//                       type="button"
//                       tag="a"
//                       aria-expanded="false"
//                     >
//                       <div
//                         className="rounded-circle me-1 d-flex align-items-center justify-content-center"
//                         style={{
//                           width: "35px",
//                           height: "35px",
//                           backgroundColor: "#28a745",
//                           color: "#fff",
//                           fontSize: "18px",
//                           fontWeight: "bold",
//                         }}
//                       >
//                         {userData.username ? userData.username.charAt(0).toUpperCase() : ""}
//                       </div>
//                       <span className="d-none d-md-inline-block fw-medium">
//                         Hi, {userData.username}
//                       </span>
//                     </DropdownToggle>
//                     <DropdownMenu className="dropdown-menu-end" end>
//                       <Link href="/signout" className="dropdown-item" onClick={handleSignOut}>
//                         Sign Out
//                       </Link>
//                     </DropdownMenu>
//                   </Dropdown>
//                 ) : (
//                   <button className="btn btn-primary" onClick={handleSignIn}>
//                     Sign In
//                   </button>
//                 )}
//               </li>
//             </ul>
//           </Collapse>
//         </Container>
//       </nav>
//     </React.Fragment>
//   );
// };

// export default withRouter(NavBar);