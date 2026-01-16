import React, { useEffect, useState } from "react";
import { Nav, NavDropdown, NavItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
import { GovBanner, NavList } from "@trussworks/react-uswds";
import { Link } from "react-router-dom";
import { useStore } from "../../store/store";

import "./Header.scss";
import config from "config/config";

const Header = () => {
  const wipeUser = useStore((state) => state.wipeUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const onLoad = async () => {
      try {
        const authSession = await fetchAuthSession();
        setIsAuthenticated(!!authSession?.tokens);
        // eslint-disable-next-line no-empty
      } catch (error) {}
    };

    onLoad().then();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      wipeUser();
      window.location.href = config.cognito.REDIRECT_SIGNOUT;
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
