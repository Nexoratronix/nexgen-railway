import React from "react";
import Section from "../Services/Section";
import ServicePage from "../Services/ServicePage";
import { Helmet } from 'react-helmet';

const Services = () => {
  document.title = "Services | NEXGEN Staffing";
  <Helmet>
        <title>Services | NEXGEN Staffing</title>
        <meta name="description" content="Explore IT staffing services at NEXGEN Staffing. Hire IT candidates with our temporary, permanent, and remote tech talent solutions across the US. Learn more now!" />
        <meta name="keywords" content="IT staffing services, IT recruitment agency, hire IT candidates, tech talent solutions, IT jobs in the US, temporary IT staffing, permanent IT recruitment, remote IT talent" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="NEXGEN Staffing" />
        <meta property="og:title" content="IT Staffing Services | NEXGEN Staffing" />
        <meta property="og:description" content="Hire IT candidates with tailored staffing solutions from NEXGEN Staffing. Temporary, permanent, and remote options available." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://nexgenstaffings.com/services" />
        <meta property="og:image" content="https://nexgenstaffings.com/services-image.jpg" />
      </Helmet>
  return (
    <React.Fragment>
      <Section />
      <ServicePage />
    </React.Fragment>
  );
};

export default Services;
