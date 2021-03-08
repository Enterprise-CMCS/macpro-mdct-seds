import React from "react";
import { Route, Switch } from "react-router-dom";
// import Home from "./containers/Home";
// import Login from "./containers/Login";
// import LocalLogin from "./containers/LocalLogin";
// import NotFound from "./containers/NotFound";
// import Signup from "./containers/Signup";
// import Profile from "./containers/Profile";
// import AuthenticatedRoute from "./components/AuthenticatedRoute";
// import UnauthenticatedRoute from "./components/UnauthenticatedRoute";
import Users from "./components/users/Users";
// import UserEdit from "./components/users/UserEdit";
import config from "./config";
// import GridWithTotals from "./components/GridWithTotals/GridWithTotals";
// import Example from "./components/examples";
// import Quarterly from "./containers/Quarterly";
// import UserAdd from "./components/users/UserAdd";
// import Unauthorized from "./containers/Unauthorized";

export default function Routes({ user, isAuthorized }) {
  const localLogin = config.LOCAL_LOGIN === "true";

    return (
      <Switch>
        <Route exact path="/">
          <Users />
        </Route>s
        {/* <UnauthenticatedRoute exact path="/users">
            <Users />
          </UnauthenticatedRoute>
        <UnauthenticatedRoute exact path="/login">
          {localLogin ? <LocalLogin /> : <Login />}
        </UnauthenticatedRoute> */}
      </Switch>
    );
  // return (
  //   <Switch>
  //     <AuthenticatedRoute exact path="/">
  //       <Home user={user} />
  //     </AuthenticatedRoute>
  //     <AuthenticatedRoute exact path="/unauthorized">
  //       <Unauthorized />
  //     </AuthenticatedRoute>
  //     <UnauthenticatedRoute exact path="/totals">
  //       <GridWithTotals />
  //     </UnauthenticatedRoute>
  //     <UnauthenticatedRoute exact path="/login">
  //       {localLogin ? <LocalLogin /> : <Login />}
  //     </UnauthenticatedRoute>
  //     <UnauthenticatedRoute exact path="/signup">
  //       <Signup />
  //     </UnauthenticatedRoute>
  //     <AuthenticatedRoute exact path="/example">
  //       <Example />
  //     </AuthenticatedRoute>
  //     <AuthenticatedRoute exact path="/profile">
  //       <Profile user={user} />
  //     </AuthenticatedRoute>
  //     <AuthenticatedRoute exact path="/forms/:state/:year/:quarter">
  //       <Quarterly />
  //     </AuthenticatedRoute>
  //     {/* {user.role === "admin" ? (
  //       <> */}
  //         <UnauthenticatedRoute exact path="/users">
  //           <Users />
  //         </UnauthenticatedRoute>
  //         <AuthenticatedRoute exact path="/users/add">
  //           <UserAdd />
  //         </AuthenticatedRoute>
  //         <AuthenticatedRoute exact path="/users/:id/edit">
  //           <UserEdit />
  //         </AuthenticatedRoute>
  //       {/* </>
  //     ) : null} */}
  //     <Route>
  //       <NotFound />
  //     </Route>
  //   </Switch>
  // );
}
