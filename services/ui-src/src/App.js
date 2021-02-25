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
import { getUserByUsername, createUser, updateUser } from "./libs/api";

function App() {
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState();
  const history = useHistory();

  useEffect(() => {
    async function onLoad() {
      // Get user data either locally or through cognito
      let payload;
      if (config.LOCAL_LOGIN === "true") {
        payload = await currentUserInfo();
        // Always update user to payload when local
        if (payload) {
          const user = await getUpdateOrAddUser(payload);
          setUser(user);
          userHasAuthenticated(true);
        }
        // If no data, send user to login
        if (payload === null) {
          history.push("/login");
        }
      } else {
        try {
          // Pull user data from cognito
          const data = await Auth.currentAuthenticatedUser();

          // If no data, send user to login
          if (!data) {
            history.push("/login");
          }

          // If user is logged in, get payload
          if (data.signInUserSession) {
            payload = data.signInUserSession.idToken.payload;
          }
        } catch (error) {
          if (error !== "The user is not authenticated") {
            console.log(
              "There was an error while loading the user information.",
              error
            );
          }
        }
      }

      if (payload) {
        console.log("zzzPayload", payload);
        // Clean and set role from long string (example in localLogin.js)
        const cleanRole = determineRole(payload.role);
        payload.role = cleanRole;

        // Either get or create and get user
        const user = await getUpdateOrAddUser(payload);

        // If no states, send used to unauthorized
        if (user.states === null || user.states === "") {
          history.push("/unauthorized");
        }

        setUser(user);
        userHasAuthenticated(true);

        // If user is Active set
        // this also triggers a reload on useEffect
        if (payload.isActive === true || payload.isActive === "true") {
          setIsAuthorized(true);
        }
      }
      setIsAuthenticating(false);
    }

    onLoad();
  }, [history, isAuthorized]);

  const determineRole = role => {
    const roleArray = ["admin", "business", "state"];
    if (roleArray.includes(role)) {
      return role;
    }

    if (role.includes("CHIP_D_USER_GROUP_ADMIN")) {
      return "admin";
    } else if (role.includes("CHIP_D_USER_GROUP")) {
      return "state";
    } else {
      return null;
    }
  };

  async function getUpdateOrAddUser(payload) {
    if (payload.username) {
      // Check if user exists
      const data = await getUserByUsername({ username: payload.username });
      // If user doesn't exists, create user
      if (!data) {
        payload.lastLogin = new Date().toISOString();
        return await createUser(payload);
      } else {
        payload.lastLogin = new Date().toISOString();
        const user = await updateUser(payload);
        return user.Attributes;
      }
    }
  }

  return (
    !isAuthenticating && (
      <div className="App">
        <Header user={user} />
        <AppContext.Provider value={{ isAuthenticated, userHasAuthenticated }}>
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
