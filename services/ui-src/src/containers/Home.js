import React, { useState, useEffect } from "react";
import { useAppContext } from "../libs/contextLib";
import "./Home.css";
import HomeState from "./HomeState";
import HomeBus from "./HomeBus";
import HomeAdmin from "./HomeAdmin";
import Unauthorized from "./Unauthorized";
import { Grid, GridContainer } from "@trussworks/react-uswds";
import { determineRole } from "../utilityFunctions/initialLoadFunctions";

export default function Home({ user }) {
  const { isAuthenticated } = useAppContext();
  /* eslint-disable no-unused-vars */
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(isAuthenticated === false);
  }, [isAuthenticated]);

  const renderLander = () => {
    let content;

    switch (user.attributes["ismemberof"]) {
      case "state":
        content = <HomeState />;
        break;
      case "business":
        content = <HomeBus />;
        break;
      case "admin":
        content = <HomeAdmin />;
        break;
      default:
        content = <Unauthorized />;
        break;
    }
    return (
      <GridContainer className="container page-home">
        <Grid row>
          <Grid col={12}>{content}</Grid>
        </Grid>
      </GridContainer>
    );
  };

  return (
    <div className="Home react-transition swipe-right">{renderLander()}</div>
  );
}

Home.propTypes = {};
