import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import VehiclesPage from "./pages/VehiclesPage";
import AuthorizedStudentsPage from "./pages/AuthorizedStudentsPage";
import ProfilesPage from "./pages/ProfilesPage";
import WalletTopUpPage from "./pages/WalletTopUpPage";
import PricingPage from "./pages/PricingPage";
import ReservationsPage from "./pages/ReservationsPage";
import RidesPage from "./pages/RidesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import InvoicesPage from "./pages/InvoicesPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="authorized-students" element={<AuthorizedStudentsPage />} />
          <Route path="profiles" element={<ProfilesPage />} />
          <Route path="wallet-top-up" element={<WalletTopUpPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="reservations" element={<ReservationsPage />} />
          <Route path="rides" element={<RidesPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}