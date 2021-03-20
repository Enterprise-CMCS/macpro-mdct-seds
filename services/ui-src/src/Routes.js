import React from "react";
import { Redirect, Switch } from "react-router-dom";
import Home from "./containers/Home";
import Login from "./containers/Login";
import NotFound from "./containers/NotFound";
import Signup from "./containers/Signup";
import Profile from "./containers/Profile";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";
import Users from "./components/users/Users";
import UserEdit from "./components/users/UserEdit";
import GridWithTotals from "./components/GridWithTotals/GridWithTotals";
import Example from "./components/examples";
import Quarterly from "./containers/Quarterly";
import UserAdd from "./components/users/UserAdd";
import Unauthorized from "./containers/Unauthorized";
import FormPage from "./components/form/FormPage";

export default function Routes({ user, isAuthorized }) {
  if (!isAuthorized) {
    return (
      <Switch>
        <UnauthenticatedRoute exact path="/">
          <Redirect to="/login" />
        </UnauthenticatedRoute>
        <UnauthenticatedRoute exact path="/login">
          <Login />
        </UnauthenticatedRoute>
        <UnauthenticatedRoute exact path="/signup">
          <Signup />
        </UnauthenticatedRoute>
      </Switch>
    );
  }
  return (
    <Switch>
      {/*************** UNAUTHENTICATED ROUTES ***************/}
      <UnauthenticatedRoute exact path="/signup">
        <Signup />
      </UnauthenticatedRoute>
      <UnauthenticatedRoute exact path="/unauthorized">
        <Unauthorized />
      </UnauthenticatedRoute>
      {/*************** AUTHENTICATED ROUTES ***************/}
      <AuthenticatedRoute exact path="/">
        <Home user={user} />
      </AuthenticatedRoute>
      <AuthenticatedRoute exact path="/totals">
        <GridWithTotals />
      </AuthenticatedRoute>
      <AuthenticatedRoute exact path="/example">
        <Example />
      </AuthenticatedRoute>
      <AuthenticatedRoute exact path="/forms/:state/:year/:quarter/:formName">
        <FormPage />
      </AuthenticatedRoute>
      <AuthenticatedRoute exact path="/profile">
        <Profile user={user} />
      </AuthenticatedRoute>
      <AuthenticatedRoute exact path="/forms/:state/:year/:quarter">
        <Quarterly />
      </AuthenticatedRoute>
      {/*************** ADMIN ROUTES ***************/}
      {user.attributes["ismemberof"] === "admin" ? (
        <>
          <AuthenticatedRoute exact path="/users">
            <Users />
          </AuthenticatedRoute>
          <AuthenticatedRoute exact path="/users/add">
            <UserAdd />
          </AuthenticatedRoute>
          <AuthenticatedRoute exact path="/users/:id/edit">
            <UserEdit />
          </AuthenticatedRoute>
        </>
      ) : null}
      <UnauthenticatedRoute>
        <NotFound />
      </UnauthenticatedRoute>
    </Switch>
  );
}
