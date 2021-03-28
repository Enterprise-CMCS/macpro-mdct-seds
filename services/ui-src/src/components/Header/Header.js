import React, { useEffect, useState } from "react";
import { Nav, Navbar, NavDropdown, NavItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Auth } from "aws-amplify";
import { GovBanner, Link, NavList } from "@trussworks/react-uswds";

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const onLoad = async () => {
      try {
        const userInfo = (await Auth.currentSession()).getIdToken().payload;
        setIsAuthenticated(userInfo !== null);
        // eslint-disable-next-line no-empty
      } catch (error) {}
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

  const menuItems = [
    <Link href="/">Home</Link>,
    <Link href="#/contact">Contact</Link>
  ];

  return (
    <div className="header">
      <GovBanner className="react-transition swipe-right padding-y-1px" />

      <div className="logo">
        <Link to="/">
          <img
            src="/img/logo-cms.png"
            alt="Centers for Medicare and Medicaid Services"
          />
        </Link>
        <span className="app-title font-alt-xl">
          CHIP Statistical Enrollment Data Reports
        </span>
      </div>

      <div className="navigation">
        {isAuthenticated ? (
          <Nav pullLeft={true}>
            <NavList items={menuItems} type="primary" />
          </Nav>
        ) : null}
        <Navbar.Collapse>
          <Nav pullRight={true} className="padding-right-9">
            {isAuthenticated ? (
              <>
                <NavDropdown id="User" title="My Profile">
                  <LinkContainer to="/profile">
                    <NavItem>User Profile</NavItem>
                  </LinkContainer>
                  <NavItem onClick={handleLogout}>Logout</NavItem>
                </NavDropdown>
              </>
            ) : null}
          </Nav>
        </Navbar.Collapse>
      </div>
    </div>
  );
};

export default Header;
