import React, { useEffect, useState } from "react";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
import { GovBanner } from "@trussworks/react-uswds";
import { Link } from "react-router-dom";
import { useStore } from "../../store/store";

import "./Header.scss";
import config from "config/config";

const Header = () => {
  const wipeUser = useStore(state => state.wipeUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [navigation, setNavigation] = useState(false);

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
        <nav class="navbar">
          {isAuthenticated ? (
            <div id="User" class="dropdown">
              <button
                class="dropbtn"
                onClick={() => {
                  setNavigation(!navigation);
                }}
              >
                My Profile
              </button>
              {navigation && (
                <div class="dropdown-content">
                  <ui class="dropdown-content">
                    <li role="presentation"><a href="/profile">User Profile</a></li>
                    <li role="presentation"><a role="button" href="#" onClick={handleLogout}>Logout</a></li>
                  </ui>
                </div>
              )}
            </div>
          ) : null}
        </nav>
      </div>

      <div className="navigation">
        {isAuthenticated ? (
          <nav>
            <Link to="/">Home</Link>
          </nav>
        ) : null}
      </div>
    </div>
  );
};

export default Header;
