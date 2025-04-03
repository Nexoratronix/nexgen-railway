import React, { useState } from "react";
import {
  Col,
  Container,
  Row,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import Link from "next/link";
import { useRouter } from "next/router";

import { Spinner } from "reactstrap"; 
import styles from "./TopBar.module.css"; 

// Import images
import flagUs from "../../assets/images/flags/us.jpg";
import flagSp from "../../assets/images/flags/spain.jpg";
import flagGr from "../../assets/images/flags/germany.jpg";
import flagIt from "../../assets/images/flags/italy.jpg";
import flagRu from "../../assets/images/flags/russia.jpg";
import useLoadingStore from "@/store/loading";

const TopBar = () => {
  const iconTobar = [
    { id: 1, classname: "uil uil-whatsapp" },
    { id: 2, classname: "uil uil-facebook-messenger-alt" },
    { id: 3, classname: "uil uil-instagram" },
    { id: 4, classname: "uil uil-envelope" },
    { id: 5, classname: "uil uil-twitter-alt" },
  ];

  // Language Dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { isLoading, setLoading } = useLoadingStore(); 
  const router = useRouter();

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const handleSignOut = async () => {
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setTimeout(() => {
          router.push("/signout");
        }, 1000);
      } else {
        setMessage(data.message || "Failed to sign out");
      }
    } catch (error) {
      setMessage("Failed to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <div className="top-bar" style={{ zIndex: 1030 }}>
        <Container fluid className="custom-container">
          <Row className="g-0 align-items-center">
            <Col md={7}>
              <ul className="list-inline mb-0 text-center text-md-start">
                <li className="list-inline-item">
                  <p className="fs-13 mb-0">
                    <i className="mdi mdi-map-marker"></i>Location:{" "}
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=23704+100th+Ave+SE+Suite+A+104+Kent+WA+98031"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-dark text-decoration-none"
                    >
                      23704 100th ave se suite a 104 kent wa 98031
                    </a>
                  </p>
                </li>
                <li className="list-inline-item">
                  {/* <ul className="topbar-social-menu list-inline mb-0">
                    {(iconTobar || []).map((icon, key) => (
                      <li className="list-inline-item" key={key}>
                        <Link href="/" className="social-link">
                          <i className={icon.classname}></i>
                        </Link>
                      </li>
                    ))}
                  </ul> */}
                </li>
              </ul>
            </Col>

            <Col md={5}>
              <ul className="list-inline mb-0 text-center text-md-end">
                <li className="list-inline-item py-2 me-2 align-middle">
                  <Link href="/signup" className="text-dark fw-medium fs-13">
                    <i className="uil uil-lock"></i>
                    Sign Up
                  </Link>
                </li>
                {/* <li className="list-inline-item py-2 me-2 align-middle">
                  <button
                    onClick={handleSignOut}
                    className={`text-dark fw-medium fs-13 ${styles.signOutButton}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Spinner size="sm" className="me-1" />
                    ) : (
                      <i className="uil uil-lock me-1"></i>
                    )}
                    Sign out
                  </button>
                </li> */}
              </ul>
              <div
                className={`${styles.messageContainer} ${
                  message ? styles.show : styles.hide
                }`}
              >
                {message && (
                  <p className="text-primary text-center fs-13">{message}</p>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default TopBar;