import React, { useState } from "react";
import { Collapse } from "reactstrap";

const AccordianContentRight = () => {
  //Collapse Tab

  const [isCollapseFourth, setIsCollapseFourth] = useState(true);
  const toggleFourth = () => setIsCollapseFourth(!isCollapseFourth);

  const [isCollapseFifth, setIsCollapseFifth] = useState(false);
  const toggleFifth = () => setIsCollapseFifth(!isCollapseFifth);

  const [isCollapseSixth, setIsCollapseSixth] = useState(false);
  const toggleSixth = () => setIsCollapseSixth(!isCollapseSixth);
  return (
    <React.Fragment>
      <div className="accordion-item mt-4 border-0">
        <h2 className="accordion-header" id="generalfour">
          <button
            className="accordion-button"
            onClick={toggleFourth}
            type="button"
          >
            How can outsourcing IT to your company benefit my business?
          </button>
        </h2>
        <Collapse isOpen={isCollapseFourth} id="general-four">
          <div className="accordion-body">
          Outsourcing with us reduces operational costs, provides access to specialized expertise, and allows you to scale your IT resources as needed. Our flexible onshore and offshore options ensure you get high-quality support tailored to your budget and goals, without the overhead of an in-house team.
          </div>
        </Collapse>
      </div>

      <div className="accordion-item mt-4 border-0">
        <h2 className="accordion-header" id="generalfive">
          <button
            className="accordion-button"
            onClick={toggleFifth}
            type="button"
          >
            How quickly can your 24/7 IT support team respond to an issue?
          </button>
        </h2>
        <Collapse isOpen={isCollapseFifth} id="general-five">
          <div className="accordion-body">
          Our 24/7 IT support team is always on standby to address your concerns. For critical issues, we aim to respond within minutes, ensuring fast resolution to keep your operations running seamlessly, day or night.
          </div>
        </Collapse>
      </div>

      <div className="accordion-item mt-4 border-0">
        <h2 className="accordion-header" id="generalsix">
          <button
            className="accordion-button"
            onClick={toggleSixth}
            type="button"
          >
          What makes your cloud engineering services stand out?
          </button>
        </h2>
        <Collapse isOpen={isCollapseSixth} id="general-six">
          <div className="accordion-body">
          Our cloud engineering team specializes in Azure and AWS, offering end-to-end solutions—from migration and setup to optimization and security. We focus on maximizing efficiency, scalability, and cost-effectiveness, tailoring your cloud infrastructure to support your business growth.
          </div>
        </Collapse>
      </div>
    </React.Fragment>
  );
};

export default AccordianContentRight;
