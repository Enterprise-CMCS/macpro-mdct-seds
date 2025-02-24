import React, { useState } from "react";
import { Auth } from "aws-amplify";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../LoaderButton/LoaderButton";
import { useFormFields } from "../../libs/hooksLib";
import { onError } from "../../libs/errorLib";
import "./Login.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons/faSignInAlt";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOkta, setIsLoadingOkta] = useState(false);
  const [fields, handleFieldChange] = useFormFields({
    email: "",
    password: ""
  });

  function validateForm() {
    return fields.email.length > 0 && fields.password.length > 0;
  }

  function signInWithOkta() {
    const authConfig = Auth.configure();
    const { domain, redirectSignIn, responseType } = authConfig.oauth;
    const clientId = authConfig.userPoolWebClientId;
    const url = `https://${domain}/oauth2/authorize?identity_provider=Okta&redirect_uri=${redirectSignIn}&response_type=${responseType}&client_id=${clientId}`;
    window.location.assign(url);
  }

  async function handleSubmitOkta(event) {
    event.preventDefault();

    setIsLoadingOkta(true);

    try {
      signInWithOkta();
    } catch (e) {
      onError(e);
      setIsLoadingOkta(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    try {
      await Auth.signIn(fields.email, fields.password);
      window.location.href = "/";
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }

  //This variable will be used to set the hidden property of the developer-login form
  //If the environment is not PROD and is not VAL, the developer login will be shown
  let development = true;
  if (
    window.location.hostname !== "mdctseds.cms.gov" &&
    window.location.hostname !== "mdctsedsval.cms.gov"
  ) {
    development = false;
  }

  return (
    <div className="login-wrapper text-center" data-testid="Login">
      <div className="padding-y-9" data-testid="OktaLogin">
        <LoaderButton
          type="button"
          onClick={handleSubmitOkta}
          isLoading={isLoadingOkta}
          outline={true}
          data-testid="handleSubmitOktaButton"
        >
          Login with EUA ID
          <FontAwesomeIcon icon={faSignInAlt} className="margin-left-2" />
        </LoaderButton>
      </div>
      <form
        onSubmit={handleSubmit}
        className="developer-login text-center"
        hidden={development}
        data-testid="loginForm"
      >
        <FormGroup controlId="email" bsSize="large">
          <ControlLabel>Email</ControlLabel>
          <FormControl
            autoFocus
            type="email"
            value={fields.email}
            onChange={handleFieldChange}
            className="form-input"
          />
        </FormGroup>
        <FormGroup controlId="password" bsSize="large">
          <ControlLabel>Password</ControlLabel>
          <FormControl
            type="password"
            value={fields.password}
            onChange={handleFieldChange}
            className="form-input"
          />
        </FormGroup>
        <div className="padding-y-9">
          <LoaderButton
            type="submit"
            isLoading={isLoading}
            disabled={!validateForm()}
          >
            Login
            <FontAwesomeIcon icon={faSignInAlt} className="margin-left-2" />
          </LoaderButton>
        </div>
      </form>
    </div>
  );
}
