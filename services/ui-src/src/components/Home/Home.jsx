import React, { useState, useEffect } from "react";
import { useAppContext } from "../../libs/contextLib";
import "./Home.scss";
import HomeState from "../HomeState/HomeState";
import HomeAdmin from "../HomeAdmin/HomeAdmin";
import Unauthorized from "../Unauthorized/Unauthorized";

const Home = ({ user }) => {
  const { isAuthenticated } = useAppContext();
  /* eslint-disable no-unused-vars */
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(isAuthenticated === false);
  }, [isAuthenticated]);

  const renderLander = () => {
    let content;

    switch (user?.role) {
      case "state":
        content = <HomeState />;
        break;
      case "business":
      case "admin":
        content = <HomeAdmin user={user} />;
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
