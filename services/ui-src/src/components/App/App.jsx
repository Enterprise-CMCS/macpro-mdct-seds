import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Routes from "../Routes/Routes";
import { AppContext } from "../../libs/contextLib";
import { Auth } from "aws-amplify";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

import "./App.scss";

import { ensureUserExistsInApi } from "../../utility-functions/initialLoadFunctions";
import { fireTealiumPageView } from "../../utility-functions/tealium";

function App() {
  const { pathname } = useLocation();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState();
  async function onLoad() {
    try {
      // const token = (await Auth.currentSession()).getIdToken();
      // const apiUser = await ensureUserExistsInApi(token.payload.email);
      const apiUser = {
        firstName: "Alice",
        lastName: "Cooper",
        lastLogin: "2021-10-01T12:46:35.838Z",
        "custom:ismemberof": "admin",
        dateJoined: "2021-10-01T12:46:35.838Z",
        isSuperUser: "true",
        userId: "1",
        email: "alicecooper@collabralink.com",
        identities: [{ userId: "AAAA" }],
        states: ["TX", "MD", "PA"],
        localLogin: true,
        password: "password",
        role: "admin"
      };

      const user = { attributes: apiUser }; // ew
      user.attributes["app-role"] = user.attributes.role;

      setUser(user);
      setIsAuthenticated(true);
      setIsAuthorized(true);
      setIsAuthenticating(false);
    } catch (error) {
      setIsAuthenticating(false);
    }
  }
  useEffect(() => {
    onLoad().then();
  }, [isAuthenticated]);

  // fire tealium page view on route change
  useEffect(() => {
    if (isAuthenticating) return;
    fireTealiumPageView(isAuthenticated, window.location.href, pathname);
  }, [pathname, isAuthenticating, isAuthenticated]);

  return (
    <div className="App">
      {!isAuthenticating && (
        <>
          <Header user={user} displayHeader={true} />
          <AppContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            <div className="main">
              <Routes user={user} isAuthorized={isAuthorized} />
            </div>
          </AppContext.Provider>
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;
