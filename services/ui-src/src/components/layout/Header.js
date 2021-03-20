import React, { useEffect, useState } from "react";
import { Nav, Navbar, NavDropdown, NavItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Auth } from "aws-amplify";
import {
  Grid,
  GridContainer,
  GovBanner,
  Link,
  NavList
} from "@trussworks/react-uswds";

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const onLoad = async () => {
      try {
        const userInfo = (await Auth.currentSession()).getIdToken().payload;
        setIsAuthenticated(userInfo !== null);
      } catch (error) {
        console.log(
          "There was an error while loading the user information.",
          error
        );
      }
    };

    onLoad().then();
  }, []);

  const handleLogout = () => {
    try {
      Auth.signOut().then(() => {
        window.location.href = Auth.configure().oauth.redirectSignOut;
      });
    } catch (error) {
      console.log("error signing out: ", error);
    }
  };

  let testItems = [
    <Link href="/">Home</Link>,
    <Link href="#/contact">Contact</Link>
  ];

  return (
    <div className="header" data-test="component-header">
      <div className="gov-info">
        <GovBanner />
      </div>

      <div className="logo">
        <GridContainer className="container">
          <Grid row>
            <Grid col={12}>
              <Link to="/">
                <img
                  src="/img/logo-cms.png"
                  alt="Centers for Medicare and Medicaid Services"
                />
              </Link>
            </Grid>
          </Grid>
        </GridContainer>
      </div>
      <div className="navigation">
        <GridContainer className="container">
          <Grid row>
            <Grid col={7}>
              <NavList items={testItems} type="primary" />
            </Grid>
            <Grid col={5}>
              <Navbar.Collapse>
                <Nav pullRight>
                  {isAuthenticated ? (
                    <>
                      <NavDropdown id="User" title="My Profile">
                        <LinkContainer to="/profile">
                          <NavItem>User Profile</NavItem>
                        </LinkContainer>
                        <NavItem onClick={handleLogout}>Logout</NavItem>
                      </NavDropdown>
                    </>
                  ) : (
                    <>
                      <LinkContainer to="/login">
                        <NavItem>Login</NavItem>
                      </LinkContainer>
                    </>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Grid>
          </Grid>
        </GridContainer>
      </div>
      <div className="page-title">
        <GridContainer className="container">
          <Grid row>
            <Grid col={12}>
              <h1 className="page-title">
                CHIP Statistical Enrollment Data Reports
              </h1>
            </Grid>
          </Grid>
        </GridContainer>
      </div>
    </div>
  );
};

export default Header;
