import React from "react";
import { Col, Container, Row, Form } from "reactstrap";
// import {Link} from "react-router-dom";
import processImage2 from "../../../assets/images/process-02.png";
import CountryOptions from "../SubSection/CountryOptions";
import JobSearch from "../SubSection/JobSearch";

const section = () => {
  // document.title = "Home | NEXGEN Staffing";
  return (
    <React.Fragment>
      <section className="bg-home2" id="home">
        <Container>
          <Row className="align-items-center">
            <Col lg={7}>
              <div className="mb-0 pb-3 me-lg-5">
                <h6 className="sub-title">Innovative IT & Staffing Solutions</h6>
                <h1 className="display-5 fw-semibold mb-3">
                 <span className="text-primary fw-bold">NEXGEN STAFFING</span>
                <h2>Your Trusted IT Staffing Partner in the US</h2>
                       
                </h1> 
                
                <p className="lead text-muted mb-0">
                At NEXGEN Staffing, we specialize in connecting businesses across the United States with top-tier IT talent. Whether you’re a startup looking to build a tech team from scratch or an established enterprise seeking skilled professionals for complex projects, our IT staffing solutions are designed to deliver results. Based in the US, we understand the dynamic needs of the tech industry and pride ourselves on being the go-to partner for companies aiming to hire IT candidates who drive innovation and success.
                </p>
              </div>
              {/* <Form action="#">
                <div className="registration-form">
                  <Row className="g-0">
                    <Col md={4}>
                      <div className="filter-search-form filter-border mt-1 mt-md-0">
                        <i className="uil uil-briefcase-alt"></i>
                        <JobSearch />
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="filter-search-form mt-3 mt-md-0">
                        <i className="uil uil-map-marker"></i>
                        <CountryOptions />
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="mt-3 mt-md-0 h-100">
                        <button
                          className="btn btn-primary submit-btn w-100 h-100"
                          type="submit"
                        >
                          <i className="uil uil-search me-1"></i> Find Job
                        </button>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Form> */}
            </Col>

            <Col lg={5}>
              <div className="mt-5 mt-md-0">
                <img src={processImage2} alt="Staff IT Solutions" className="home-img" />
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </React.Fragment>
  );
};

export default section;
