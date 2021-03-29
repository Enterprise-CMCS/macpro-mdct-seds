import React from "react";

const HomeAdmin = () => {
  return (
    <>
      <h1 className="page-header">Home Admin User Page</h1>
      <div className="padding-left-9 margin-left-9 list-display-container">
        <ul>
          <li>
            <a to="/users" className="text-bold">
              View / Edit Users
            </a>
          </li>
          <li>
            <a to="/users/add" className="text-bold">
              Create User
            </a>
          </li>
        </ul>
      </div>
    </>
  );
};

export default HomeAdmin;
