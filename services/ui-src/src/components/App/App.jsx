import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Routes from "../Routes/Routes";
import { AppContext } from "../../libs/contextLib";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { fireTealiumPageView } from "../../utility-functions/tealium";
import { useStore } from "../../store/store";
import "./App.scss";

function App() {
  const loadUser = useStore((state) => state.loadUser);
  const { pathname } = useLocation();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await loadUser();

        setIsAuthenticated(true);
        setIsAuthorized(true);
        setIsAuthenticating(false);
      } catch (error) {
        setIsAuthenticating(false);
      }
    })();
  }, [isAuthenticated]);

  // fire tealium page view on route change
  useEffect(() => {
    if (isAuthenticating) return;
    fireTealiumPageView(isAuthenticated, window.location.href, pathname);
  }, [pathname, isAuthenticating, isAuthenticated]);

  return (
    <div>
      {!isAuthenticating && (
        <>
          <Header displayHeader={true} />
          <AppContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            <div className="main">
              <Routes isAuthorized={isAuthorized} />
            </div>
          </AppContext.Provider>
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;
