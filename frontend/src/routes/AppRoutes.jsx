import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { ROLES } from '../utils/constants';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const ListingDetails = lazy(() => import('../pages/ListingDetails'));
const CreateListing = lazy(() => import('../pages/CreateListing'));
const EditListing = lazy(() => import('../pages/EditListing'));
const BuyList = lazy(() => import('../pages/BuyList'));
const SellerRequests = lazy(() => import('../pages/SellerRequests'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const NotFound = lazy(() => import('../pages/NotFound'));

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/listings/:id" element={<ListingDetails />} />

      <Route
        path="/listings/new"
        element={
          <ProtectedRoute roles={[ROLES.STUDENT]}>
            <CreateListing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listings/:id/edit"
        element={
          <ProtectedRoute roles={[ROLES.STUDENT]}>
            <EditListing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buy-list"
        element={
          <ProtectedRoute roles={[ROLES.STUDENT]}>
            <BuyList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller-requests"
        element={
          <ProtectedRoute roles={[ROLES.STUDENT]}>
            <SellerRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
