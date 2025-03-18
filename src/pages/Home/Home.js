import React from "react";
import Jobcatogaries from "../Home/jobCatogaries";
import JobList from "./JobList/jobList";
import HowItWorks from "./HowItWorks";
import Cta from "./Cta";
import Testimonal from "./Testimonal";
import Blog from "../Home/Blog";
import Client from "./Client";
import Services from "../Company/Services/Services";

const Home = () => {
  return (
    <React.Fragment>
      {/* <Jobcatogaries /> */}
      {/* <JobList /> */}
      <HowItWorks />
      <Services/>
      <Cta />
      <Testimonal />
      {/* <Blog /> */}
      {/* <Client /> */}
    </React.Fragment>
  );
};

export default Home;
