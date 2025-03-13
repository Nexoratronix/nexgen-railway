import React from "react";
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";

//Import Images
import AboutImage from "../../../assets/images/about/img-01.jpg";

const About = () => {
  return (
    <React.Fragment>
      <section className="section overflow-hidden">
        <Container>
          <Row className="align-items-center g-0">
            <Col lg={6}>
              <div className="section-title me-lg-5">
                <h6 className="sub-title">About Us</h6>
                <h2 className="title mb-4">
                  Why <span className="text-warning fw-bold">35,000+</span>{" "}
                  People Trust On Next-Gen?
                </h2>
                <p className="text-muted">
                  At Next-Gen, we empower your business with cutting-edge IT staffing and managed services tailored to your needs. Based in the Chicago area, our expert team delivers everything you need—top-tier IT professionals, seamless outsourcing, and cost-effective solutions—to drive efficiency, reduce risks, and keep your systems running smoothly. Partner with us to unlock a workforce that’s as innovative as your vision.
                </p>

                <Row className="mt-4 pt-2">
                  <Col md={6}>
                    <ul className="list-unstyled about-list text-muted mb-0 mb-md-3">
                      <li>Expert IT Staffing Solutions</li>
                      <li>Talented IT Professionals & Specialists</li>
                      <li>Managed IT Services</li>
                      <li>Custom Software Development</li>
                    </ul>
                  </Col>
                  <Col md={6}>
                    <ul className="list-unstyled about-list text-muted">
                      <li>Seamless Outsourcing Options</li>
                      <li>Support for 100+ IT Roles</li>
                      <li>IT Advisory & Consulting</li>
                      <li>And More...</li>
                    </ul>
                  </Col>
                </Row>
                <div className="mt-3">
                  {/* <Link to="#" className="btn btn-primary btn-hover">
                    Learn More{" "}
                    <i className="uil uil-angle-right-b align-middle"></i>
                  </Link> */}
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="about-img mt-4 mt-lg-0">
                <img src={AboutImage} alt="" className="img-fluid rounded" />
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </React.Fragment>
  );
};

export default About;
