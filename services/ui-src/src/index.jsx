import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./components/App/App";
import { BrowserRouter as Router } from "react-router-dom";
import { Amplify } from "aws-amplify";
import config from "./config/config";
import { Provider } from "react-redux";
import store from "./store/storeIndex";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: config.cognito.USER_POOL_ID,
      identityPoolId: config.cognito.IDENTITY_POOL_ID,
      userPoolClientId: config.cognito.APP_CLIENT_ID,
      loginWith: {
        oauth: {
          domain: config.cognito.APP_CLIENT_DOMAIN,
          redirectSignIn: [config.cognito.REDIRECT_SIGNIN],
          redirectSignOut: [config.cognito.REDIRECT_SIGNOUT],
          scopes: ["email", "openid", "profile"],
          responseType: "token"
        }
      }
    }
  },
  API: {
    REST: {
      "mdct-seds": {
          endpoint: config.apiGateway.URL,
          region: config.apiGateway.REGION
      }
    }
  }
});

ReactDOM.render(
  <Router>
    <Provider store={store}>
      <App />
    </Provider>
  </Router>,
  document.getElementById("root")
);
