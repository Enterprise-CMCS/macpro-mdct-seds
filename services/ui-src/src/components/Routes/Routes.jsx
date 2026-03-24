import { React } from "react";
import { Redirect, Routes as ReactRoutes, Route } from "react-router";
import { useStore } from "../../store/store";
import Login from "../Login/Login";
import NotFound from "../NotFound/NotFound";
import Profile from "../Profile/Profile";
import PrintPDF from "../Print/PrintPDF";
import Users from "../Users/Users";
import EditUser from "../EditUser/EditUser";
import Quarterly from "../Quarterly/Quarterly";
import Unauthorized from "../Unauthorized/Unauthorized";
import FormPage from "../FormPage/FormPage";
import StateSelector from "../StateSelector/StateSelector";
import GenerateForms from "../GenerateForms/GenerateForms";
import FormTemplates from "../FormTemplates/FormTemplates";
import GenerateTotals from "../GenerateTotals/GenerateTotals";
import HomeState from "../HomeState/HomeState";
import HomeAdmin from "../HomeAdmin/HomeAdmin";

/** Define a Route accessible to any logged-in user */
const AuthRoute = (props) => {
  const userRole = useStore((state) => state.user.role);
  if (!userRole) return <Redirect to="/login" />;
  return <Route {...props} />;
};

/** Define a Route accessible only to admins */
const AdminRoute = (props) => {
  const userRole = useStore((state) => state.user.role);
  if (!userRole) return <Redirect to="/login" />;
  if (userRole !== "admin") return <Unauthorized />;
  return <Route {...props} />;
};

export default function Routes() {
  const userRole = useStore((state) => state.user.role);

  const determineRootPage = () => {
    switch (userRole) {
      case "state":
        return <HomeState />;
      case "business":
      case "admin":
        return <HomeAdmin />;
      default:
        return <Redirect to="/login" />;
    }
  };

  return (
    <ReactRoutes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={determineRootPage()} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <AuthRoute path="/register-state" element={<StateSelector />} />
      <AuthRoute path="/profile" element={<Profile />} />
      <AuthRoute path="/forms/:state/:year/:quarter" element={<Quarterly />} />
      <AuthRoute
        path="/forms/:state/:year/:quarter/:formName"
        element={<FormPage />}
      />
      <AuthRoute
        path="/print/:state/:year/:quarter/:formName"
        element={<PrintPDF />}
      />

      <AdminRoute path="/users" element={<Users />} />
      <AdminRoute path="/users/:id/edit" element={<EditUser />} />
      <AdminRoute path="/form-templates" element={<FormTemplates />} />
      <AdminRoute path="/generate-forms" element={<GenerateForms />} />
      <AdminRoute path="/generate-counts" element={<GenerateTotals />} />

      <Route path="*" element={<NotFound />} />
    </ReactRoutes>
  );
}
