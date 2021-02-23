import React, { useEffect, useState } from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import Home from "./containers/Home";
import Login from "./containers/Login";
import LocalLogin from "./containers/LocalLogin";
import NotFound from "./containers/NotFound";
import Signup from "./containers/Signup";
import Profile from "./containers/Profile";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";
import Users from "./components/users/Users";
import UserEdit from "./components/users/UserEdit";
import config from "./config";
import GridWithTotals from "./components/GridWithTotals/GridWithTotals";
import Example from "./components/examples";
import Quarterly from "./containers/Quarterly";
import UserAdd from "./components/users/UserAdd";
import { currentUserInfo } from "./libs/user";
import { Auth } from "aws-amplify";
import Unauthorized from "./containers/Unauthorized";

export default function Routes() {
  // This might not be quite the right place for it, but I'm doing
  // dependency injection here, on the component level.
  // Local Login
  const localLogin = config.LOCAL_LOGIN === "true";

  const history = useHistory();
  const [hasAdminRights, setHasAdminRights] = useState(false);

  useEffect(() => {
    onLoad();
  });

  async function onLoad() {
    let payload;
    if (config.LOCAL_LOGIN === "true") {
      payload = await currentUserInfo();
    } else {
      payload = await Auth.currentAuthenticatedUser();
    }
    if (payload === null) {
      history.push("/login");
    } else {
      if (payload.isActive !== true) {
        history.push("/unauthorized");
      }

      if (payload.isActive && payload.role === "admin") {
        setHasAdminRights(true);
      }
    }
  }

  return (
    <Switch>
      <AuthenticatedRoute exact path="/">
        <Home />
      </AuthenticatedRoute>
      <AuthenticatedRoute exact path="/unauthorized">
        <Unauthorized />
      </AuthenticatedRoute>
      <UnauthenticatedRoute exact path="/totals">
        <GridWithTotals />
      </UnauthenticatedRoute>
      <UnauthenticatedRoute exact path="/login">
        {localLogin ? <LocalLogin /> : <Login />}
      </UnauthenticatedRoute>
      <UnauthenticatedRoute exact path="/signup">
        <Signup />
      </UnauthenticatedRoute>
      <AuthenticatedRoute exact path="/example">
        <Example />
      </AuthenticatedRoute>
      {hasAdminRights ? (
        <>
          <AuthenticatedRoute exact path="/users">
            <Users />
          </AuthenticatedRoute>

          <AuthenticatedRoute exact path="/users/add">
            <UserAdd />
          </AuthenticatedRoute>
          <AuthenticatedRoute exact path="/users/:id">
            <UserEdit />
          </AuthenticatedRoute>
        </>
      ) : null}
      <AuthenticatedRoute exact path="/profile">
        <Profile />
      </AuthenticatedRoute>
      <AuthenticatedRoute exact path="/forms/:state/:year/:quarter">
        <Quarterly />
      </AuthenticatedRoute>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}
