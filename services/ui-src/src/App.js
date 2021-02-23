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
import { getUserByUsername, createUser } from "./libs/api";

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
          let payload = data.signInUserSession.idToken.payload;

          // Adjust role if coming from Okta
          payload.role = determineRole(payload.role);

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

  const determineRole = role => {
    const roleArray = ["admin", "business", "state"];
    if (roleArray.includes(role)) {
      return role;
    }

    if (role.includes("CHIP_Group_Dev_Admin")) {
      return "admin";
    } else if (role.includes("CHIP_Group_Dev_Users")) {
      return "state";
    }
  };

  async function getOrAddUser(payload) {
    if (payload.username) {
      // Check if user exists
      const data = await getUserByUsername({ username: payload.username });

      // If user doesn't exists, create user
      if (!data) {
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
