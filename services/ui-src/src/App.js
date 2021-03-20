import React, { useState, useEffect } from "react";
import "./App.scss";
import Routes from "./Routes";
import { AppContext } from "./libs/contextLib";
import { Auth } from "aws-amplify";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

function App() {
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState();

  useEffect(() => {
    async function onLoad() {
      try {
        setIsAuthenticating(true);
        let user = await Auth.currentAuthenticatedUser();

        // ***
        user.attributes["ismemberof"] = "admin";

        setUser(user);
        userHasAuthenticated(true);
        setIsAuthenticating(false);
        setIsAuthorized(true);
      } catch (error) {
        console.log(error);
        setIsAuthenticating(false);
      }
    }
    onLoad().then();
  }, [isAuthenticated]);

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
