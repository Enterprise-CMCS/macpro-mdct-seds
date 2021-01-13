import React from "react";
import {
  Grid,
  GridContainer,
  GovBanner,
  NavList
} from "@trussworks/react-uswds";
import { Nav, Navbar, NavDropdown, NavItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";

const Header = () => {
  // TODO: Fill with data from Redux when available
  let pageTitle = "CHIP Statistical Enrollment Data Reports";
  let isAuthenticated = true;
  let email = "test@example.com";
  const handleLogout = () => {};

  let testItems = [
    <Link href={"/"}>Home</Link>,
    <Link href={"/contact"}>Contact</Link>
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
              <img
                src="/img/logo-cms.png"
                alt="Centers for Medicare and Medicaid Services"
              />
            </Grid>
          </Grid>
        </GridContainer>
      </div>
      <div className="navigation">
        <GridContainer className="container">
          <Grid row>
            <Grid col={9}>
              <NavList items={testItems} type="primary" />
            </Grid>
            <Grid col={3}>
              <Navbar.Collapse>
                <Nav pullRight>
                  {isAuthenticated ? (
                    <>
                      <NavDropdown id="User" title={email}>
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
              <h1>{pageTitle}</h1>
            </Grid>
          </Grid>
        </GridContainer>
      </div>
    </div>
  );
};

export default Header;
