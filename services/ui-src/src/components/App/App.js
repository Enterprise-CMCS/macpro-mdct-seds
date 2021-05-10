import React, { useState, useEffect } from "react";
import Routes from "../Routes/Routes";
import { AppContext } from "../../libs/contextLib";
import { Auth } from "aws-amplify";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

import "./App.scss";

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
    console.log("inside onLoad function");
    try {
      let user = await Auth.currentAuthenticatedUser();

      console.log("got user");
      console.log(user);

      // *** make sure attributes exist and are in standard format
      user.attributes = user.signInUserSession.idToken.payload;

      console.log("attributes created: ");
      console.log(user);

      user.attributes["app-role"] = determineRole(
        user.attributes["custom:ismemberof"]
      );
      user.attributes["app-role"] = "state";

      console.log("role figured out");
      console.log(user);
      setUser(user);
      console.log("user set");
      setIsAuthenticated(true);
      console.log("user is authenticated set");
      setIsAuthenticating(false);
      console.log("user is authenticatING set");

      setIsAuthorized(true);
      console.log("testing user presence");
      await ascertainUserPresence(user);
    } catch (error) {
      setIsAuthenticating(false);
    }
  }
  useEffect(() => {
    console.log("running onload");
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
