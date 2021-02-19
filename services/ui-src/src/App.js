import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "./App.scss";
import Routes from "./Routes";
import { AppContext } from "./libs/contextLib";
import { Auth } from "aws-amplify";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import config from "./config";
import { currentUserInfo } from "./libs/user";
import { getUser, createUser } from "./libs/api";

function App({ userData }) {
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  const history = useHistory();

  useEffect(() => {
    onLoad();
  });

  async function onLoad() {
    if (config.LOCAL_LOGIN === "true") {
      const payload = await currentUserInfo();

      if (payload === null) {
        history.push("/login");
      } else {
        await getOrAddUser(payload);
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
    // console.log("getOrAddUser");
    if (payload.userId) {
      // console.log("payload.userId");
      // Check if user exists
      const getUserData = { userId: payload.userId };
      // console.log("zzzGetUserData", getUserData);
      const data = await getUser(getUserData);

      // console.log("zzzData", data);
      // If user doesn't exists, add to database
      if (!data) {
        console.log("No data");
        await createUser(payload);
      }
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
