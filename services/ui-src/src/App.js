import React, { useState, useEffect } from "react";
import Routes from "./Routes";
import { AppContext } from "./libs/contextLib";
import { Auth } from "aws-amplify";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

import "./App.scss";
import "./animations/transitions.scss";

function App() {
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState();

  useEffect(() => {
    async function onLoad() {
      setIsAuthenticating(true);

      try {
        let user = await Auth.currentAuthenticatedUser();

        // *** LOCAL ONLY ADMIN OVERRIDE
        user.attributes["ismemberof"] = "admin";

        setUser(user);
        setIsAuthenticated(true);
        setIsAuthenticating(false);
        setIsAuthorized(true);
      } catch (error) {
        setIsAuthenticating(false);
      }
    }
    onLoad().then();
  }, [isAuthenticated]);

  return (
    !isAuthenticating && (
      <div className="App react-transition scale-in">
        <Header user={user} />
        <AppContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
          <div className="main">
            <Routes user={user} isAuthorized={isAuthorized} />
          </div>
        </AppContext.Provider>
        <Footer />
      </div>
    )
  );
}

export default App;
