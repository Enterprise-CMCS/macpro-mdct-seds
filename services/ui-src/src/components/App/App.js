import React, { useState, useEffect } from "react";
import Routes from "../Routes/Routes";
import { AppContext } from "../../libs/contextLib";
import { Auth } from "aws-amplify";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

import "./App.scss";
import "../../animations/transitions.scss";
import {
  ascertainUserPresence,
  determineRole
} from "../../utility-functions/initialLoadFunctions";

function App() {
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState();

  async function onLoad() {
    try {
      let user = await Auth.currentAuthenticatedUser();

      user.attributes["app-role"] = determineRole(
        user.attributes["custom:ismemberof"]
      );
      setUser(user);
      setIsAuthenticated(true);
      setIsAuthenticating(false);
      setIsAuthorized(true);
      await ascertainUserPresence(user);
    } catch (error) {
      setIsAuthenticating(false);
    }
  }
  useEffect(() => {
    onLoad().then();
  }, [isAuthenticated]);

  return (
    <div className="App react-transition fade-in">
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
