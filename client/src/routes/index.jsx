import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MainLayout, DashboardLayout, AdminLayout } from '../components/layout';

// Public Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import GoogleCallback from '../pages/GoogleCallback';
import EmailVerificationPage from '../pages/EmailVerificationPage';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Products from '../pages/Products';
import ProductDetail from '../pages/ProductDetail';
import Classifieds from '../pages/Classifieds';
import ClassifiedDetail from '../pages/ClassifiedDetail';
import SearchResults from '../pages/SearchResults';

// Protected Pages
import Profile from '../pages/Profile';
import CreateClassified from '../pages/CreateClassified';
import EditClassified from '../pages/EditClassified';
import CreateProduct from '../pages/CreateProduct';
import EditProduct from '../pages/EditProduct';
import Dashboard from '../pages/Dashboard';
import DashboardListings from '../pages/DashboardListings';
import Chat from '../pages/Chat';
import Reports from '../pages/Reports';

// Admin Pages
import {
  AdminDashboard,
  AdminUsers,
  AdminClassifieds,
  AdminProducts
} from '../pages/admin';

// Protected route component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, isAdmin, isSeller, user } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (requiredRole === 'admin' && !isAdmin()) {
    return <Navigate to="/" />;
  }

  if (requiredRole === 'seller' && !isSeller()) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Main Layout Routes */}
      <Route path="/" element={<MainLayout />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="verify-email" element={<EmailVerificationPage />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="auth/google/callback" element={<GoogleCallback />} />

        {/* Product Routes */}
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />

        {/* Classified Routes */}
        <Route path="classifieds" element={<Classifieds />} />
        <Route path="classifieds/:id" element={<ClassifiedDetail />} />
        <Route path="search" element={<SearchResults />} />

        {/* Protected Routes */}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="classifieds/create"
          element={
            <ProtectedRoute>
              <CreateClassified />
            </ProtectedRoute>
          }
        />

        <Route
          path="classifieds/edit/:id"
          element={
            <ProtectedRoute>
              <EditClassified />
            </ProtectedRoute>
          }
        />

        <Route
          path="products/create"
          element={
            <ProtectedRoute>
              <CreateProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="products/edit/:id"
          element={
            <ProtectedRoute>
              <EditProduct />
            </ProtectedRoute>
          }
        />

        {/* Chat Routes */}
        <Route
          path="chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route
          path="chat/:conversationId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* Reports Route */}
        <Route
          path="reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Dashboard Layout Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="seller">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="listings" element={<DashboardListings />} />
      </Route>

      {/* Admin Layout Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="classifieds" element={<AdminClassifieds />} />
        <Route path="products" element={<AdminProducts />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
