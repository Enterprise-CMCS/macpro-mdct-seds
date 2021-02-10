import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "./App.scss";
import Routes from "./Routes";
import { AppContext } from "./libs/contextLib";
import { Auth } from "aws-amplify";
import { onError } from "./libs/errorLib";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import config from "./config";
import { getLocalUserInfo } from "./libs/user";

function App() {
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  /* eslint-disable no-unused-vars */
  const [email, setEmail] = useState(false);
  const history = useHistory();

  useEffect(() => {
    onLoad();
  });

  async function onLoad() {
    if (config.LOCAL_LOGIN === "true") {
      const userInfo = getLocalUserInfo();

      if (userInfo === null) {
        history.push("/login");
      } else {
        setEmail(userInfo.attributes.email);
        userHasAuthenticated(true);
      }
    } else {
      try {
        const userInfo = await Auth.currentAuthenticatedUser();
        console.log("zzzAuth in app.js", Auth);
        setEmail(userInfo.idToken.payload.email);
        console.log("zzzUserInfo from Auth.currentSession", userInfo);
        userHasAuthenticated(true);
      } catch (e) {
        if (e !== "No current user") {
          console.log(
            "zzzError in app.js can't get currentAuthenticatedUser",
            e
          );
          onError(e);
        }
      }
    }

    setIsAuthenticating(false);
  }

  return (
    !isAuthenticating && (
      <div className="App">
        <Header />
        <AppContext.Provider value={{ isAuthenticated, userHasAuthenticated }}>
          <div className="main">
            <Routes />
          </div>
        </AppContext.Provider>
        <Footer />
      </div>
    )
  );
}

export default App;
