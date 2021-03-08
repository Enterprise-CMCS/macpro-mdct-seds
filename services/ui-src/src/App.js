// import React, {useEffect } from "react";
// import { useHistory } from "react-router-dom";
import "./App.scss";
// import Routes from "./Routes";
// import { AppContext } from "./libs/contextLib";
// import { Auth } from "aws-amplify";
// import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
// import config from "./config";
// import { currentUserInfo } from "./libs/user";
import { listUsers } from "./libs/api";

function App() {
  // const [isAuthenticating, setIsAuthenticating] = useState(true);
  // const [isAuthenticated, userHasAuthenticated] = useState(false);
  // const [isAuthorized, setIsAuthorized] = useState(false);
  // const [user, setUser] = useState();
  // const history = useHistory();

  const allUsers = listUsers();
  console.log('yeet', allUsers)



  // useEffect(() => {
    // async function getUpdateOrAddUser(payload) {
    //   // Set ismemberof to role for easier comprehension
    //   payload.role = payload["custom:ismemberof"];
    //   payload.username = payload.identities[0].userId;

    //   if (payload.identities) {
    //     // Check if user exists
    //     const data = await getUserByUsername({
    //       username: payload.identities[0].userId
    //     });

    //     // If user doesn't exists, create user
    //     console.log("zzzData", data);
    //     if (data.Count === 0 || data === false) {
    //       payload.lastLogin = new Date().toISOString();
    //       payload.isActive = "true";
    //       return await createUser(payload);
    //     } else {
    //       let newData = data.Items[0];
    //       newData.lastLogin = new Date().toISOString();
    //       newData.isActive = data.isActive ?? "true";
    //       // newData.role = determineRole(payload.role);
    //       const user = await updateUser(newData);
    //       return user.Attributes;
    //     }
    //   }
    // }
    // onLoad();
  // }, []);

  // const determineRole = role => {
  //   const roleArray = ["admin", "business", "state"];
  //   if (roleArray.includes(role)) {
  //     return role;
  //   }

  //   if (role.includes("CHIP_D_USER_GROUP_ADMIN")) {
  //     return "admin";
  //   } else if (role.includes("CHIP_D_USER_GROUP")) {
  //     return "state";
  //   } else {
  //     return null;
  //   }
  // };

  return (
      <div className="App">
          <div className="main">
            {allUsers}
          </div>
        <Footer />
      </div>
    
  );
}

export default App;
