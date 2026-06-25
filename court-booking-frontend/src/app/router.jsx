// src/app/router.jsx

import React from "react";
import { createBrowserRouter } from "react-router-dom";

// Layouts
import { MainLayout } from "../layouts/MainLayout";
import { OwnerLayout } from "../layouts/OwnerLayout";
import { AdminLayout } from "../layouts/AdminLayout";

// Public Pages
import { HomePage } from "../pages/public/HomePage";
import { SearchVenuePage } from "../pages/public/SearchVenuePage";
import { VenueDetailPage } from "../pages/public/VenueDetailPage";
import { LoginPage } from "../pages/public/LoginPage";
import { RegisterPage } from "../pages/public/RegisterPage";

// Customer Pages
import { BookingFlowPage } from "../pages/customer/BookingFlowPage";
import { MyBookingsPage } from "../pages/customer/MyBookingsPage";
import { ProfilePage } from "../pages/customer/ProfilePage";

// Owner Pages
import { OwnerDashboard } from "../pages/owner/OwnerDashboard";
import { OwnerVenuesPage } from "../pages/owner/OwnerVenuesPage";
import { OwnerCourtsPage } from "../pages/owner/OwnerCourtsPage";
import { OwnerSlotsPage } from "../pages/owner/OwnerSlotsPage";
import { OwnerBookingsPage } from "../pages/owner/OwnerBookingsPage";

// Admin Pages
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { AdminUsersPage } from "../pages/admin/AdminUsersPage";
import { AdminVenuesPage } from "../pages/admin/AdminVenuesPage";

export const router = createBrowserRouter([
  // Public and Customer Layout Routes
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "search",
        element: <SearchVenuePage />
      },
      {
        path: "venue/:id",
        element: <VenueDetailPage />
      },
      {
        path: "login",
        element: <LoginPage />
      },
      {
        path: "register",
        element: <RegisterPage />
      },
      // Customer Routes protected by MainLayout (with user role checks)
      {
        path: "book",
        element: <BookingFlowPage />
      },
      {
        path: "my-bookings",
        element: <MyBookingsPage />
      },
      {
        path: "profile",
        element: <ProfilePage />
      }
    ]
  },
  // Owner Routes
  {
    path: "/owner",
    element: <OwnerLayout />,
    children: [
      {
        path: "dashboard",
        element: <OwnerDashboard />
      },
      {
        path: "venues",
        element: <OwnerVenuesPage />
      },
      {
        path: "courts",
        element: <OwnerCourtsPage />
      },
      {
        path: "slots",
        element: <OwnerSlotsPage />
      },
      {
        path: "bookings",
        element: <OwnerBookingsPage />
      }
    ]
  },
  // Admin Routes
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "dashboard",
        element: <AdminDashboard />
      },
      {
        path: "users",
        element: <AdminUsersPage />
      },
      {
        path: "venues",
        element: <AdminVenuesPage />
      },
      {
        path: "analytics",
        element: <AdminDashboard /> // Reusing AdminDashboard for analytics as requested
      }
    ]
  }
]);
