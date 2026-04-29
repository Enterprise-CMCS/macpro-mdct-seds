import React, { useState } from "react";
import { signIn, signInWithRedirect } from "aws-amplify/auth";
import { TextField } from "@cmsgov/design-system";
import LoaderButton from "../LoaderButton/LoaderButton";
import { onError } from "../../libs/errorLib";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons/faSignInAlt";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOkta, setIsLoadingOkta] = useState(false);
  const [fields, setFieldChange] = useState({
    email: "",
    password: "",
  });

  function validateForm() {
    return fields.email.length > 0 && fields.password.length > 0;
  }

  async function signInWithOkta() {
    await signInWithRedirect({ provider: { custom: "Okta" } });
  }

  function onFieldChange(e) {
    const { name, value } = e.target;
    const newFields = { ...fields, [name]: value };
    setFieldChange(newFields);
  }

  async function handleSubmitOkta(event) {
    event.preventDefault();

    setIsLoadingOkta(true);

    try {
      await signInWithOkta();
    } catch (error) {
      onError(error);
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
        options: { authFlowType: "USER_PASSWORD_AUTH" },
      });
      window.location.href = "/";
    } catch (error) {
      onError(error);
      setIsLoading(false);
    }
  }

  //This variable will be used to set the hidden property of the developer-login form
  //If the environment is not PROD, the developer login will be shown
  const hideCognitoLogin = window.location.hostname === "mdctseds.cms.gov";

  return (
    <div data-testid="Login" className="login">
      <div data-testid="OktaLogin">
        <LoaderButton
          type="button"
          onClick={handleSubmitOkta}
          isLoading={isLoadingOkta}
          variation="outline"
          data-testid="handleSubmitOktaButton"
        >
          Login with EUA ID
          <FontAwesomeIcon icon={faSignInAlt} />
        </LoaderButton>
      </div>
      <form
        onSubmit={handleSubmit}
        hidden={hideCognitoLogin}
        data-testid="loginForm"
        className="flex-col-gap-1half center"
      >
        <TextField
          autoFocus
          label="Email"
          name="email"
          autoComplete="username"
          value={fields.email}
          onChange={onFieldChange}
        ></TextField>
        <TextField
          type="password"
          name="password"
          label="Password"
          autoComplete="current-password"
          value={fields.password}
          onChange={onFieldChange}
        ></TextField>
        <div>
          <LoaderButton
            type="submit"
            isLoading={isLoading}
            disabled={!validateForm()}
          >
            Login
            <FontAwesomeIcon icon={faSignInAlt} />
          </LoaderButton>
        </div>
      </form>
    </div>
  );
}
