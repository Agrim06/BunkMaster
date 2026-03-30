import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import Profile from "./pages/Profile";
import Home from "./pages/Home";

import ProtectedRoute from "./auth/ProtectedRoute";
import PublicRoute from "./auth/PublicRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}

        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Layout>
                <Login />
              </Layout>
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <Layout>
                <ForgotPassword />
              </Layout>
            </PublicRoute>
          }
        />

        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <Layout>
                <ResetPassword />
              </Layout>
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Layout>
                <Register />
              </Layout>
            </PublicRoute>
          }
        />

        <Route
          path="/verify-email"
          element={
            <PublicRoute>
              <Layout>
                <VerifyEmail />
              </Layout>
            </PublicRoute>
          }
        />

        {/* Protected routes */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/subjects"
          element={
            <ProtectedRoute>
              <Layout>
                <Subjects />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all route to redirect back to home/dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;