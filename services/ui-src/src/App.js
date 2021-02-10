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
        await Auth.currentAuthenticatedUser();
        userHasAuthenticated(true);
      } catch (e) {
        if (e !== "No current user") {
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
