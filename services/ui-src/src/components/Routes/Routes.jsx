import {React, useEffect} from "react";
import { Redirect, Switch, useHistory, useLocation } from "react-router-dom";
import Home from "../Home/Home";
import Login from "../Login/Login";
import NotFound from "../NotFound/NotFound";
import Profile from "../Profile/Profile";
import PrintPDF from "../Print/PrintPDF";
import AuthenticatedRoute from "../AuthenticatedRoute/AuthenticatedRoute";
import UnauthenticatedRoute from "../UnauthenticatedRoute/UnauthenticatedRoute";
import Users from "../Users/Users";
import EditUser from "../EditUser/EditUser";
import Quarterly from "../Quarterly/Quarterly";
import Unauthorized from "../Unauthorized/Unauthorized";
import FormPage from "../FormPage/FormPage";
import StateSelector from "../StateSelector/StateSelector";
import GenerateForms from "../GenerateForms/GenerateForms";
import FormTemplates from "../FormTemplates/FormTemplates";
import GenerateTotals from "../GenerateTotals/GenerateTotals";

export default function Routes({ user, isAuthorized }) {
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
      </Switch>
    );
  }
  return (
    <Switch>
      {/*************** UNAUTHENTICATED ROUTES ***************/}
      <UnauthenticatedRoute exact path="/unauthorized">
        <Unauthorized />
      </UnauthenticatedRoute>
      {/*************** AUTHENTICATED ROUTES ***************/}
      <AuthenticatedRoute exact path="/">
        <Home user={user} />
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
      {user.role === "admin" ? (
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
