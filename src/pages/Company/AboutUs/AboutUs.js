import React from "react";
import About from "../../../pages/Company/AboutUs/About";
import Section from "../../../pages/Company/AboutUs/Section";
import Counter from "../../../pages/Company/AboutUs/Counter";
import Features from "../../../pages/Company/AboutUs/Features";
import Cta from "../../../pages/Company/AboutUs/Cta";
import CompanyTestimonal from "../../../pages/Company/AboutUs/CompanyTestimonal";
import Team from "../Team/Team";
import CompanyDetails from "../../CandidateAndCompany/CompanyDetails/CompanyDetails";

const AboutUs = () => {
  document.title = "About Us | Next-Gen";
  return (
    <React.Fragment>
      <Section />
      <About />
      <CompanyDetails/>
      <Counter />
     
      <Features />
      <Team/>
      <Cta />
      <CompanyTestimonal />
    </React.Fragment>
  );
};

export default AboutUs;
