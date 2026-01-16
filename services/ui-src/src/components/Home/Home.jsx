import React, { useState, useEffect } from "react";
import { useAppContext } from "../../libs/contextLib";
import "./Home.scss";
import HomeState from "../HomeState/HomeState";
import HomeAdmin from "../HomeAdmin/HomeAdmin";
import Unauthorized from "../Unauthorized/Unauthorized";
import { useStore } from "../../store/store";

const Home = () => {
  const userRole = useStore((state) => state.user.role);
  const { isAuthenticated } = useAppContext();
  /* eslint-disable no-unused-vars */
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(isAuthenticated === false);
  }, [isAuthenticated]);

  const renderLander = () => {
    let content;

    switch (userRole) {
      case "state":
        content = <HomeState />;
        break;
      case "business":
      case "admin":
        content = <HomeAdmin />;
        break;
      default:
        content = <Unauthorized />;
        break;
    }
    return content;
  };

  return (
    <div className="Home" data-testid="Home">
      {renderLander()}
    </div>
  );
};

Home.propTypes = {};

export default Home;
