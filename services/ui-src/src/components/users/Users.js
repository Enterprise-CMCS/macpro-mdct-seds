import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import DataTableExtensions from "react-data-table-component-extensions";
import Card from "@material-ui/core/Card";
import "react-data-table-component-extensions/dist/index.css";
import SortIcon from "@material-ui/icons/ArrowDownward";
// import { useDispatch } from "react-redux";
import moment from "moment";
import { Grid, GridContainer } from "@trussworks/react-uswds";
/**
 * Display all users with options
 *
 *
 * @constructor
 */

const Users = () => {
  // const dispatch = useDispatch();
  const [users, setUsers] = useState();

  const loadUserData = async () => {
    // dispatch({ type: "CONTENT_FETCHING_STARTED" });
    //
    // try {
    //   let { data } = await axios.post(`/api/v1/userprofiles`);
    //   setUsers(data);
    // } catch (e) {
    //   console.log("Error pulling users data: ", e);
    // }
    // dispatch({ type: "CONTENT_FETCHING_FINISHED" });

    const data = [
      {
        user_id: 0,
        password: "",
        is_superuser: true,
        username: "WAQF",
        first_name: "Alexis",
        last_name: "Woodbury",
        email: "awoodbury@collabralink.com",
        is_active: true,
        date_joined: "01/22/2021",
        last_login: "01/22/2021",
        states: ["AZ"],
        role: "admin"
      },
      {
        user_id: 1,
        password: "",
        is_superuser: true,
        username: "A1LX",
        first_name: "Andrew",
        last_name: "Adcock",
        email: "aadcock@collabralink.com",
        is_active: true,
        date_joined: "01/22/2021",
        last_login: "01/22/2021",
        states: ["DC", "MD"],
        role: "state"
      },
      {
        user_id: 2,
        password: "",
        is_superuser: true,
        username: "G24F",
        first_name: "Jenna",
        last_name: "Gillis",
        email: "jgillis@collabralink.com",
        is_active: false,
        date_joined: "01/22/2021",
        last_login: "01/22/2021",
        states: ["DC", "MD", "FL"],
        role: "admin"
      },
      {
        user_id: 3,
        password: "",
        is_superuser: true,
        username: "G812",
        first_name: "Tim",
        last_name: "Griesemer",
        email: "tgriesemer@collabralink.com",
        is_active: true,
        date_joined: "01/22/2021",
        last_login: "01/22/2021",
        states: ["DC", "MD"],
        role: "admin"
      },
      {
        user_id: 4,
        password: "",
        is_superuser: true,
        username: "DKZ2",
        first_name: "Tony",
        last_name: "Davydets",
        email: "tdavydets@collabralink.com",
        is_active: true,
        date_joined: "01/22/2021",
        last_login: "01/22/2021",
        states: ["DC", "MD"],
        role: "admin"
      },
      {
        user_id: 5,
        password: "",
        is_superuser: true,
        username: "MDCT_Test",
        first_name: "MDCT",
        last_name: "Test",
        email: "mdcttest@example.com",
        is_active: true,
        date_joined: "01/22/2021",
        last_login: "01/22/2021",
        states: ["DC", "MD"],
        role: "admin"
      }
    ];

    setUsers(data);
  };

  useEffect(() => {
    async function fetchData() {
      await loadUserData();
    }
    fetchData();
  }, []);

  const deactivateUser = async e => {
    const confirm = window.confirm(
      `Are you sure you want to deactivate user ${e}`
    );
    if (confirm) {
      // axios.post(`/api/v1/user/deactivate/${e}`).then(async () => {
      //   await loadUserData();
      // });
    }
  };

  const activateUser = async e => {
    const confirm = window.confirm(
      `Are you sure you want to activate user ${e}`
    );
    if (confirm) {
      // axios.post(`/api/v1/user/activate/${e}`).then(async () => {
      //   await loadUserData();
      // });
    }
  };

  let tableData = false;

  if (users) {
    // Build column structure for react-data-tables
    const columns = [
      {
        name: "Username",
        selector: "username",
        sortable: true,
        cell: function editUser(e) {
          return (
            <span>
              <a href={`/users/${e.user_id}`}>{e.username}</a>
            </span>
          );
        }
      },
      {
        name: "First Name",
        selector: "first_name",
        sortable: true
      },
      {
        name: "Last Name",
        selector: "last_name",
        sortable: true
      },
      {
        name: "Email",
        selector: "email",
        sortable: true,
        cell: function modifyEmail(e) {
          return (
            <span>
              <a href={`mailto:${e.email}`}>{e.email}</a>
            </span>
          );
        }
      },
      {
        name: "Role",
        selector: "role",
        sortable: true,
        cell: function Role(r) {
          if (r) {
            return r.role;
          } else {
            return "";
          }
        }
      },
      {
        name: "Joined",
        selector: "date_joined",
        sortable: true,
        cell: function modifyDateJoined(d) {
          if (d.date_joined) {
            return <span>{moment(d.date_joined).format("MM/DD/YYYY")}</span>;
          } else {
            return "";
          }
        }
      },
      {
        name: "Last Active",
        selector: "last_login",
        sortable: true,
        cell: function modifyLastLogin(l) {
          if (l.last_login) {
            return <span>{moment(l.last_login).format("MM/DD/YYYY")}</span>;
          } else {
            return "";
          }
        }
      },
      {
        name: "Created",
        selector: "date_joined",
        sortable: true,
        cell: function modifyDateJoined(l) {
          return <span>{moment(l.date_joined).format("MM/DD/YYYY")}</span>;
        }
      },
      {
        name: "States",
        selector: "state_codes",
        sortable: true,
        cell: function modifyStateCodes(s) {
          return s.states ? <span>{s.states.sort().join(", ")}</span> : null;
        }
      },
      {
        name: "Status",
        selector: "is_active",
        sortable: true,
        cell: function modifyIsActive(s) {
          return (
            <span>
              {s.is_active ? (
                <button
                  className="btn btn-primary"
                  onClick={() => deactivateUser(s.username)}
                >
                  Deactivate
                </button>
              ) : (
                <button
                  className="btn btn-secondary"
                  onClick={() => activateUser(s.username)}
                >
                  Activate
                </button>
              )}
            </span>
          );
        }
      }
    ];

    tableData = {
      columns,
      data: users,
      exportHeaders: true
    };
  }

  return (
    <div className="user-profiles">
      <GridContainer className="container">
        <Grid row>
          <Grid col={12}>
            <h1>Users</h1>
            <Card>
              {tableData ? (
                <DataTableExtensions {...tableData}>
                  <DataTable
                    title="Users"
                    defaultSortField="username"
                    sortIcon={<SortIcon />}
                    highlightOnHover
                    selectableRows={false}
                    responsive={true}
                  />
                </DataTableExtensions>
              ) : null}
            </Card>
          </Grid>
        </Grid>
      </GridContainer>
    </div>
  );
};

export default Users;
