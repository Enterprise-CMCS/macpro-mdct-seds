import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "./App.scss";
import Routes from "./Routes";
import { AppContext } from "./libs/contextLib";
import { Auth } from "aws-amplify";
import { onError } from "./libs/errorLib";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

function App() {
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  /* eslint-disable no-unused-vars */
  const [email, setEmail] = useState(false);
  const history = useHistory();

  useEffect(() => {
    onLoad();
  }, []);

  async function onLoad() {
    try {
      const userInfo = await Auth.currentSession();
      userHasAuthenticated(true);
      setEmail(userInfo.idToken.payload.email);
    } catch (e) {
      if (e !== "No current user") {
        onError(e);
      }
    }

    setIsAuthenticating(false);
  }
  /* eslint-disable no-unused-vars */
  async function handleLogout() {
    await Auth.signOut();

    userHasAuthenticated(false);

    history.push("/login");
  }
  return (
    !isAuthenticating && (
      <div className="App">
        <Header isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
        <button onClick={handleLogout}>Logout</button>

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
