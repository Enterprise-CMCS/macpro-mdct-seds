import React, { useEffect, useState } from "react";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
import { UsaBanner } from "@cmsgov/design-system";
import { Link } from "react-router-dom";
import { useStore } from "../../store/store";
import config from "config/config";

const Header = () => {
  const wipeUser = useStore((state) => state.wipeUser);
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

  return (
    <div className="header" data-testid="Header">
      <UsaBanner />

      <div className="logo">
        <Link to="/">
          <img
            src="/img/seds-logo-white.svg"
            alt="MDCT SEDS: Statistical Enrollment Data Systems"
            width={250}
            height={90}
          />
        </Link>
        <nav className="navbar">
          {isAuthenticated ? (
            <div id="User" className="dropdown">
              <button
                className="dropbtn"
                onClick={() => {
                  setNavigation(!navigation);
                }}
              >
                My Profile
                <span className="caret"></span>
              </button>
              {navigation && (
                <div className="dropdown-content">
                  <ul className="dropdown-content" role="presentation">
                    <li>
                      <a href="/profile">User Profile</a>
                    </li>
                    <li>
                      <a role="button" href="#" onClick={handleLogout}>
                        Logout
                      </a>
                    </li>
                  </ul>
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
