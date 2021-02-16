import React, { useEffect, useState } from "react";
import {
  Grid,
  GridContainer,
  GovBanner,
  Link,
  NavList
} from "@trussworks/react-uswds";
import { Nav, Navbar, NavDropdown, NavItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Auth } from "aws-amplify";
import { useHistory } from "react-router-dom";
import { currentUserInfo } from "../../libs/user";
import { onError } from "../../libs/errorLib";
import config from "../../config";

const Header = () => {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    function loadProfile() {
      return currentUserInfo();
    }

    async function onLoad() {
      try {
        const userInfo = await loadProfile();
        if (userInfo === null) {
          setIsAuthenticated(false);
        } else {
          setEmail(userInfo.attributes.email);
          setIsAuthenticated(true);
        }
      } catch (e) {
        onError(e);
      }
    }

    onLoad();
  }, []);

  async function handleLogout() {
    if (config.LOCAL_LOGIN === "true") {
      window.localStorage.removeItem("userKey");
      history.push("/login");
      history.go(0);
    } else {
      await Auth.signOut();
    }

    history.push("/login");
  }

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
              <Link href="/">
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
