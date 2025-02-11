import {React, useEffect} from "react";
import { Redirect, Switch, useHistory, useLocation } from "react-router-dom";
import Home from "../Home/Home";
import Login from "../LocalLogin/LocalLogin";
import NotFound from "../NotFound/NotFound";
import Signup from "../Signup/Signup";
import Profile from "../Profile/Profile";
import PrintPDF from "../Print/PrintPDF";
import AuthenticatedRoute from "../AuthenticatedRoute/AuthenticatedRoute";
import UnauthenticatedRoute from "../UnauthenticatedRoute/UnauthenticatedRoute";
import Users from "../Users/Users";
import EditUser from "../EditUser/EditUser";
import Example from "../Example/Example";
import Quarterly from "../Quarterly/Quarterly";
import Unauthorized from "../Unauthorized/Unauthorized";
import FormPage from "../FormPage/FormPage";
import StateSelector from "../StateSelector/StateSelector";
import GenerateForms from "../GenerateForms/GenerateForms";
import FormTemplates from "../FormTemplates/FormTemplates";
import GenerateTotals from "../GenerateTotals/GenerateTotals";

export default function Routes({ user, isAuthorized }) {
  console.log(user)
  user = {
    firstName: "Alice",
    lastName: "Cooper",
    lastLogin: "2021-10-01T12:46:35.838Z",
    "custom:ismemberof": "admin",
    dateJoined: "2021-10-01T12:46:35.838Z",
    isSuperUser: "true",
    userId: "1",
    email: "alicecooper@collabralink.com",
    identities: [{ userId: "AAAA" }],
    states: ["TX", "MD", "PA"],
    localLogin: true,
    password: "password",
    role: "admin",
    attributes: {
      "app-role": "admin",
    }
  };
  console.log(user.attributes)
  const history = useHistory()
  const location = useLocation()
  // Preserve old hash style urls and route them to adjusted urls
  useEffect(() => {
    if (location.hash && location.hash.startsWith('#/')) {
      history.replace(location.hash.replace('#', ''))
    }
  }, [history, location.hash, location.pathname])

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
      <AuthenticatedRoute exact path="/register-state">
        <StateSelector />
      </AuthenticatedRoute>
      <AuthenticatedRoute exact path="/print/:state/:year/:quarter/:formName">
        <PrintPDF />
      </AuthenticatedRoute>
      {/*************** ADMIN ROUTES ***************/}
      {user.attributes["app-role"] === "admin" ? (
        <>
          <AuthenticatedRoute exact path="/users">
            <Users />
          </AuthenticatedRoute>
          <AuthenticatedRoute exact path="/form-templates">
            <FormTemplates />
          </AuthenticatedRoute>
          <AuthenticatedRoute exact path="/users/:id/edit">
            <EditUser />
          </AuthenticatedRoute>
          <AuthenticatedRoute exact path="/generate-forms">
            <GenerateForms />
          </AuthenticatedRoute>
          <AuthenticatedRoute exact path="/generate-counts">
            <GenerateTotals />
          </AuthenticatedRoute>
          <AuthenticatedRoute path="*">
            {/* <Redirect to="/" /> */}
          </AuthenticatedRoute>
        </>
      ) : null}
      <AuthenticatedRoute path="*">
        <Redirect to="/" />
      </AuthenticatedRoute>
      <UnauthenticatedRoute>
        <NotFound />
      </UnauthenticatedRoute>
    </Switch>
  );
}
