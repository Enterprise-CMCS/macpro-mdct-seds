import React, { useState, useEffect } from "react";
import { useAppContext } from "../libs/contextLib";
import "./Home.css";
import HomeState from "./HomeState";
// import HomeBus from "./HomeBus";
// import HomeAdmin from "./HomeAdmin";
import Unauthorized from "./Unauthorized";
import { Grid, GridContainer } from "@trussworks/react-uswds";

export default function Home({ user }) {
  const { isAuthenticated } = useAppContext();
  /* eslint-disable no-unused-vars */
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function onLoad() {
      if (!isAuthenticated) {
        return;
      }

      setIsLoading(false);
    }

    onLoad();
  }, [isAuthenticated]);

  function renderLander() {
    let content = <HomeState />;

    // let content = null;
    // switch (user.role) {
    //   case "state":
    //     content = <HomeState />;
    //     break;
    //   case "business":
    //     content = <HomeBus />;
    //     break;
    //   case "admin":
    //     content = <HomeAdmin />;
    //     break;
    //   default:
    //     content = <Unauthorized />;
    //     break;
    // }
    return (
      <GridContainer className="container page-home">
        <Grid row>
          <Grid col={12}>{content}</Grid>
        </Grid>
      </GridContainer>
    );
  }

  function renderUnauthorized() {
    const content = <Unauthorized />;

    return (
      <GridContainer className="container page-home">
        <Grid row>
          <Grid col={12}>{content}</Grid>
        </Grid>
      </GridContainer>
    );
  }

  return (
    <div className="Home">
      {/* TODO: Check for authentication */}
      {/*{isAuthenticated ? renderLander() : renderUnauthorized()}*/}
      {renderLander()}
    </div>
  );
}

Home.propTypes = {};
