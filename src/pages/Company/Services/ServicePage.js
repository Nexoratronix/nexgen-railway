import React from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";

const ServicePage = () => {
  const servicePage = [
    {
      id: 1,
      serviceIcon: "uim-object-ungroup",
      serviceName: "IT Staffing Solutions",
      serviceText:
        "We source and deploy highly skilled IT professionals—developers, engineers, and analysts—to meet your project needs with precision and speed."
    },
    {
      id: 2,
      serviceIcon: "uim-telegram-alt",
      serviceName: "Custom Software Development",
      serviceText:
        "Our expert teams craft tailored software solutions, from mobile apps to enterprise systems, ensuring quality and innovation at every step."
    },
    {
      id: 3,
      serviceIcon: "uim-airplay",
      serviceName: "Managed IT Services",
      serviceText:
        "Keep your systems running smoothly with our comprehensive managed services, covering helpdesk, network management, and more."
    },
    {
      id: 4,
      serviceIcon: "uim-rocket",
      serviceName: "Business IT Outsourcing",
      serviceText:
        "Scale efficiently with our flexible onshore and offshore outsourcing options, designed to reduce costs and boost productivity."
    },
    {
      id: 5,
      serviceIcon: "uim-history",
      serviceName: "24/7 IT Support",
      serviceText:
        "Rely on our round-the-clock support to resolve issues fast, keeping your operations seamless and downtime to a minimum."
    },
    {
      id: 6,
      serviceIcon: "uim-bookmark",
      serviceName: "Project Management",
      serviceText:
        "Track and manage your IT projects with our expert oversight, ensuring timely delivery and alignment with your goals."
    },
    {
      id: 7,
      serviceIcon: "uim-layers-alt",
      serviceName: "Cloud Engineering",
      serviceText:
        "Leverage our Azure and AWS expertise to build, migrate, or optimize your cloud infrastructure for maximum efficiency."
    },
    {
      id: 8,
      serviceIcon: "uim-anchor",
      serviceName: "IT Advisory Services",
      serviceText:
        "Plan smarter with our strategic guidance, including virtual CIO support, budgeting, and technology roadmapping tailored to your business."
    },
    {
      id: 9,
      serviceIcon: "uim-graph-bar",
      serviceName: "Performance Monitoring",
      serviceText:
        "Gain actionable insights with our real-time monitoring and reporting, helping you optimize systems and reduce risks."
    }
  ];
  return (
    <React.Fragment>
      <section className="section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={6}>
              <div className="section-title text-center">
                <h3 className="title mb-3">
                  Providing our trusted{" "}
                  <span className="text-warning">Services</span>
                </h3>
                <p className="text-muted">
                  From IT staffing to managed services and outsourcing, we deliver tailored, high-quality solutions to empower your business with efficiency and innovation.
                </p>
              </div>
            </Col>
          </Row>
          <Row>
            {servicePage.map((servicePageDetails, key) => (
              <Col lg={4} md={6} key={key}>
                <Card className="service-box mt-4 border-0">
                  <CardBody className="p-4">
                    <div className="service-icon icons-md">
                      <Icon
                        icon={servicePageDetails.serviceIcon}
                        color="#766df4"
                      />
                    </div>
                    <div className="mt-4">
                      <h5>{servicePageDetails.serviceName}</h5>
                      <p className="text-muted">
                        {servicePageDetails.serviceText}
                      </p>
                    </div>
                    <div className="learn-more">
                      {/* <Link to="#" className="form-text text-primary">
                        Learn More <i className="uil uil-angle-right-b"></i>
                      </Link> */}
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </React.Fragment>
  );
};

export default ServicePage;
