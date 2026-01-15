import React, { useState } from "react";
import { signIn, signInWithRedirect } from "aws-amplify/auth";
import { TextField } from "@cmsgov/design-system";
import LoaderButton from "../LoaderButton/LoaderButton";
import { onError } from "../../libs/errorLib";
import "./Login.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons/faSignInAlt";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOkta, setIsLoadingOkta] = useState(false);
  const [fields, setFieldChange] = useState({
    email: "",
    password: ""
  });

  function validateForm() {
    return fields.email.length > 0 && fields.password.length > 0;
  }

  async function signInWithOkta() {
    await signInWithRedirect({ provider: { custom: "Okta" } });
  }

  function onFieldChange(e) {
    const { name, value } = e.target;
    const newFields = { ...fields };
    newFields[name] = value;
    setFieldChange(newFields);
  }

  async function handleSubmitOkta(event) {
    event.preventDefault();

    setIsLoadingOkta(true);

    try {
      await signInWithOkta();
    } catch (e) {
      onError(e);
      setIsLoadingOkta(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    try {
      await signIn({
        username: fields.email,
        password: fields.password,
        options: { authFlowType: "USER_PASSWORD_AUTH" }
      });
      window.location.href = "/";
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }

  //This variable will be used to set the hidden property of the developer-login form
  //If the environment is not PROD, the developer login will be shown
  const hideCognitoLogin = window.location.hostname === "mdctseds.cms.gov";

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
        className="developer-login"
        hidden={hideCognitoLogin}
        data-testid="loginForm"
      >
        <TextField
          autoFocus
          key="email"
          name="email"
          label="Email"
          value={fields.email}
          onChange={onFieldChange}
        ></TextField>
        <TextField
          type="password"
          key="password"
          name="password"
          label="Password"
          value={fields.password}
          onChange={onFieldChange}
        ></TextField>
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
