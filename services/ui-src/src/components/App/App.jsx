import React, { useState, useEffect } from "react";
import { useLocation } from "react-router";
import AppRoutes from "../AppRoutes/AppRoutes";
import { AppContext } from "../../libs/contextLib";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { fireTealiumPageView } from "../../utility-functions/tealium";
import { useStore } from "../../store/store";
import "./App.scss";
import Preloader from "components/Preloader/Preloader";

function App() {
  const loadUser = useStore((state) => state.loadUser);
  const wipeUser = useStore((state) => state.wipeUser);
  const { pathname } = useLocation();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await loadUser();

        setIsAuthenticated(true);
        setIsAuthenticating(false);
      } catch {
        wipeUser();
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
    <>
      {isAuthenticating ? (
        <Preloader />
      ) : (
        <>
          <Header displayHeader={true} />
          <AppContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            <div className="app">
              <AppRoutes />
            </div>
          </AppContext.Provider>
          <Footer />
        </>
      )}
    </>
  );
}

export default App;
