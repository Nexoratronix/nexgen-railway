import React from "react";
import About from "../../../pages/Company/AboutUs/About";
import Section from "../../../pages/Company/AboutUs/Section";
import Counter from "../../../pages/Company/AboutUs/Counter";
import Features from "../../../pages/Company/AboutUs/Features";
import Cta from "../../../pages/Company/AboutUs/Cta";
import CompanyTestimonal from "../../../pages/Company/AboutUs/CompanyTestimonal";
// import Team from "../Team/Team";
import CompanyDetails from "../../CandidateAndCompany/CompanyDetails/CompanyDetails";
import { Helmet } from 'react-helmet';

const AboutUs = () => {
  document.title = "About Us | NEXGEN Staffing";
  <Helmet>
        <title>About Us | NEXGEN Staffing</title>
        <meta name="description" content="Learn about NEXGEN Staffing, a top IT staffing agency in the US. We connect businesses with skilled IT candidates. Discover our mission, team, and values today!" />
        <meta name="keywords" content="IT staffing agency, about us, hire IT candidates, tech talent solutions, IT recruitment, IT jobs in the US, US tech staffing" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="NEXGEN Staffing" />
        <meta property="og:title" content="About NEXGEN Staffing" />
        <meta property="og:description" content="Meet NEXGEN Staffing, your US-based IT staffing experts. Learn about our mission and team." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://nexgenstaffings.com/about" />
        <meta property="og:image" content="https://nexgenstaffings.com/about-image.jpg" />
      </Helmet>
  return (
    <React.Fragment>
      <Section />
      <About />
      <CompanyDetails/>
      <Counter />
     
      <Features />
      {/* <Team/> */}
      <Cta />
      <CompanyTestimonal />
    </React.Fragment>
  );
};

export default AboutUs;
