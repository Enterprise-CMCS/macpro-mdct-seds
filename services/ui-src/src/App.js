import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "./App.scss";
import Routes from "./Routes";
import { AppContext } from "./libs/contextLib";
import { Auth } from "aws-amplify";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import config from "./config";
import { getLocalUserInfo } from "./libs/user";

function App({ userData }) {
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, userHasAuthenticated] = useState(false);
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
        userHasAuthenticated(true);
      }
    } else {
      try {
        const data = await Auth.currentAuthenticatedUser();
        console.log("zzzData from app.js", data);

        if (data.signInUserSession) {
          const payload = data.signInUserSession.idToken.payload;
          getOrAddUser(payload);
        }
        userHasAuthenticated(true);
      } catch (error) {
        if (error !== "The user is not authenticated") {
          console.log(
            "There was an error while loading the user information.",
            error
          );
        }
      }
    }

    setIsAuthenticating(false);
  }

  async function getOrAddUser(payload) {
    if (payload.username) {
      // Check if user exists
      // If user doesn't exists, add to database
    }
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
