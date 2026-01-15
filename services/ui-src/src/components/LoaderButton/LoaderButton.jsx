import React from "react";
import { Button } from "@cmsgov/design-system";
import "./LoaderButton.scss";

export default function LoaderButton({
  isLoading,
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <Button
      variation="solid"
      className="login-button"
      disabled={disabled || isLoading}
      {...props}
      data-testid="LoaderButton"
    >
      {props.children}
      {isLoading && (
        <img
          src="preloaders/spheres.gif"
          alt="Loading... Please wait..."
          title="Loading... Please wait..."
          className="display-inline"
        />
      )}
    </Button>
  );
}
