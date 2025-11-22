import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Routes from "../Routes/Routes";
import { AppContext } from "../../libs/contextLib";
import { getCurrentUser } from "../../libs/api";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./App.scss";

import { fireTealiumPageView } from "../../utility-functions/tealium";

function App() {
  const { pathname } = useLocation();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState();
  async function onLoad() {
    try {
      const currentUser = await getCurrentUser();
      
      setUser(currentUser);
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
