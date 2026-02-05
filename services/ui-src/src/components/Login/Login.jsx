import React, { useState } from "react";
import { signIn, signInWithRedirect } from "aws-amplify/auth";
import { Form } from "react-bootstrap";
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
    password: "",
  });

  function validateForm() {
    return fields.email.length > 0 && fields.password.length > 0;
  }

  async function signInWithOkta() {
    await signInWithRedirect({ provider: { custom: "Okta" } });
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
        options: { authFlowType: "USER_PASSWORD_AUTH" },
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
        className="developer-login text-center"
        hidden={hideCognitoLogin}
        data-testid="loginForm"
      >
        <Form.Group controlId="email" bsSize="large">
          <Form.Label>Email</Form.Label>
          <Form.Control
            autoFocus
            type="email"
            value={fields.email}
            onChange={handleFieldChange}
            className="form-input"
          />
        </Form.Group>
        <Form.Group controlId="password" bsSize="large">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={fields.password}
            onChange={handleFieldChange}
            className="form-input"
          />
        </Form.Group>
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
