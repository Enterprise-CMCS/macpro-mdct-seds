import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Routes from "../Routes/Routes";
import { AppContext } from "../../libs/contextLib";
import {
  fetchAuthSession,
} from "aws-amplify/auth";
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
      const tokens = (await fetchAuthSession()).tokens;
      const payload = tokens.idToken.payload;
      const apiUser = await ensureUserExistsInApi(payload.email);
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
