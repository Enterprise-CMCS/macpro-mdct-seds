import React from "react";
import { Link } from "react-router-dom";

const HomeAdmin = () => {
  return (
    <>
      <h1 className="page-header">Home Admin User Page</h1>
      <div className="padding-left-9 margin-left-9 list-display-container">
        <ul>
          <li>
            <Link to="/users" className="text-bold">
              View / Edit Users
            </Link>
          </li>
          <li>
            <Link to="/users/add" className="text-bold">
              Create User
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default HomeAdmin;
