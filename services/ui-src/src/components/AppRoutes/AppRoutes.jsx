import { React } from "react";
import { Navigate, Routes, Route } from "react-router";
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

export default function AppRoutes() {
  const userRole = useStore((state) => state.user.role);

  const homePage = () => {
    switch (userRole) {
      case "state":
        return <HomeState />;
      case "business":
      case "admin":
        return <HomeAdmin />;
      default:
        return <Navigate to="/login" />;
    }
  };

  const loggedInPage = (element) => {
    if (!userRole) return <Navigate to="/login" />;
    return element;
  };

  const adminPage = (element) => {
    if (!userRole) return <Navigate to="/login" />;
    if (userRole !== "admin") return <Unauthorized />;
    return element;
  };

  return (
    <Routes>
      {/* These pages are available to the general public */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={homePage()} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* These pages require an active user session */}
      <Route path="/register-state" element={loggedInPage(<StateSelector />)} />
      <Route path="/profile" element={loggedInPage(<Profile />)} />
      <Route
        path="/forms/:state/:year/:quarter"
        element={loggedInPage(<Quarterly />)}
      />
      <Route
        path="/forms/:state/:year/:quarter/:formName"
        element={loggedInPage(<FormPage />)}
      />
      <Route
        path="/print/:state/:year/:quarter/:formName"
        element={loggedInPage(<PrintPDF />)}
      />

      {/* These pages are admin-only */}
      <Route path="/users" element={adminPage(<Users />)} />
      <Route path="/users/:id/edit" element={adminPage(<EditUser />)} />
      <Route path="/form-templates" element={adminPage(<FormTemplates />)} />
      <Route path="/generate-forms" element={adminPage(<GenerateForms />)} />
      <Route path="/generate-counts" element={adminPage(<GenerateTotals />)} />

      {/* The fallback page is also generally available */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
