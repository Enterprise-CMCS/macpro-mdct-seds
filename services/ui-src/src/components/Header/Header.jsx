import React, { useEffect, useState } from "react";
import { Nav, Navbar, NavDropdown, NavItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Auth } from "aws-amplify";
import { GovBanner, NavList } from "@trussworks/react-uswds";
import { Link } from "react-router-dom";

import "./Header.scss";

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

  const menuItems = [<Link to="/">Home</Link>];

  return (
    <div className="header" data-testid="Header">
      <GovBanner className="padding-y-1px" />

      <div className="logo">
        <Link to="/">
          <img
            src="/img/seds-logo-white.svg"
            alt="MDCT SEDS: Statistical Enrollment Data Systems"
            width={250}
            height={90}
          />
        </Link>
        <Nav pullRight={true}>
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
      </div>

      <div className="navigation">
        {isAuthenticated ? (
          <Nav pullLeft={true}>
            <NavList items={menuItems} />
          </Nav>
        ) : null}
      </div>
    </div>
  );
};

export default Header;
