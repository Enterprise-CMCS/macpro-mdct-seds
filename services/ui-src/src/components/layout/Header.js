import React, { useEffect, useState } from "react";
import {
  Grid,
  GridContainer,
  GovBanner,
  Link,
  NavList
} from "@trussworks/react-uswds";
import { Nav, Navbar, NavDropdown, NavItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Auth } from "aws-amplify";
import { useHistory } from "react-router-dom";
import { currentUserInfo } from "../../libs/user";
import config from "../../config";
import { listUsers } from "../../libs/api";

const Header = () => {

  const listusers = listUsers();
  console.log('header', listusers)
  // const history = useHistory();
  // const [email, setEmail] = useState("");
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  // useEffect(() => {
  //   function loadProfile() {
  //     return currentUserInfo();
  //   }

  //   async function onLoad() {
  //     try {
  //       // Get user info
  //       const userInfo = await loadProfile();

  //       if (userInfo === null) {
  //         // setIsAuthenticated(false);
  //       } else {
  //         if (userInfo.signInUserSession) {
  //           // Get payload
  //           //const payload = userInfo.signInUserSession.idToken.payload;
  //           //setEmail(payload.email);
  //         } else {
  //           //setEmail(userInfo.email);
  //         }
  //         // setIsAuthenticated(true);
  //       }
  //     } catch (error) {
  //       if (error !== "The user is not authenticated") {
  //         console.log(
  //           "There was an error while loading the user information.",
  //           error
  //         );
  //       }
  //     }
  //   }

  //   onLoad();
  // }, []);

  // function handleLogout() {
  //   if (config.LOCAL_LOGIN === "true") {
  //     window.localStorage.removeItem("userKey");
  //     history.push("/login");
  //     history.go(0);
  //   } else {
  //     try {
  //       const authConfig = Auth.configure();
  //       Auth.signOut();
  //       window.location.href = authConfig.oauth.redirectSignOut;
  //     } catch (error) {
  //       console.log("error signing out: ", error);
  //     }
  //   }
  // }

  // let testItems = [
  //   <Link href={"/"}>Home</Link>,
  //   <Link href={"/contact"}>Contact</Link>
  // ];

  return (
    <div>
      {listusers}
    </div>
    // <div className="header" data-test="component-header">
    //   <div className="gov-info">
    //     <GovBanner />
    //   </div>

    //   <div className="logo">
    //     <GridContainer className="container">
    //       <Grid row>
    //         <Grid col={12}>
    //           <Link href="/">
    //             <img
    //               src="/img/logo-cms.png"
    //               alt="Centers for Medicare and Medicaid Services"
    //             />
    //           </Link>
    //         </Grid>
    //       </Grid>
    //     </GridContainer>
    //   </div>
    //   <div className="navigation">
    //     <GridContainer className="container">
    //       <Grid row>
    //         <Grid col={7}>
    //           <NavList items={testItems} type="primary" />
    //         </Grid>
    //         <Grid col={5}>
    //           <Navbar.Collapse>
    //             <Nav pullRight>
    //               {isAuthenticated ? (
    //                 <>
    //                   <NavDropdown id="User" title="My Profile">
    //                     <LinkContainer to="/profile">
    //                       <NavItem>User Profile</NavItem>
    //                     </LinkContainer>
    //                     <NavItem onClick={handleLogout}>Logout</NavItem>
    //                   </NavDropdown>
    //                 </>
    //               ) : (
    //                 <>
    //                   <LinkContainer to="/login">
    //                     <NavItem>Login</NavItem>
    //                   </LinkContainer>
    //                 </>
    //               )}
    //             </Nav>
    //           </Navbar.Collapse>
    //         </Grid>
    //       </Grid>
    //     </GridContainer>
    //   </div>
    //   <div className="page-title">
    //     <GridContainer className="container">
    //       <Grid row>
    //         <Grid col={12}>
    //           <h1 className="page-title">
    //             CHIP Statistical Enrollment Data Reports
    //           </h1>
    //         </Grid>
    //       </Grid>
    //     </GridContainer>
    //   </div>
    // </div>
  );
};

export default Header;
