import { LinkContainer } from "react-router-bootstrap";
import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { Nav, Navbar, NavItem, NavDropdown } from "react-bootstrap";
import "./App.scss";
import Routes from "./Routes";
import config from "./config";
import { AppContext } from "./libs/contextLib";
import { Auth } from "aws-amplify";
import { onError } from "./libs/errorLib";

function App() {
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  const [email, setEmail] = useState(false);
  const history = useHistory();

  useEffect(() => {
    onLoad();
  }, []);

  async function onLoad() {
    try {
      await Auth.currentSession();
      userHasAuthenticated(true);
      const userInfo = await Auth.currentUserInfo();
      setEmail(userInfo.attributes.email);
    } catch (e) {
      if (e !== "No current user") {
        onError(e);
      }
    }
    setIsAuthenticating(false);
  }

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
  

  return (
    !isAuthenticating && (
      <div className="App container">
        <Navbar fluid collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">SEDS Home</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
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
                  <LinkContainer to="/signup">
                    <NavItem>Signup</NavItem>
                  </LinkContainer>
                  <LinkContainer to="/login">
                    <NavItem>Login</NavItem>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <AppContext.Provider value={{ isAuthenticated, userHasAuthenticated }}>
          <Routes />
        </AppContext.Provider>
      </div>
    )
  );
}

export default App;