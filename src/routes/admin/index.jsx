import React from "react";
import { Navigate } from "react-router-dom";

import UserProfile from "@pages/admin/Authentication/user-profile";

// Authentication related pages
import Login from "@pages/admin/Authentication/Login";
import Logout from "@pages/admin/Authentication/Logout";
import Register from "@pages/admin/Authentication/Register";
import ForgetPwd from "@pages/admin/Authentication/ForgetPassword";

// Inner Authentication
import Login1 from "@pages/admin/AuthenticationInner/Login";
import Login2 from "@pages/admin/AuthenticationInner/Login2";
import Register1 from "@pages/admin/AuthenticationInner/Register";
import Register2 from "@pages/admin/AuthenticationInner/Register2";
import Recoverpw from "@pages/admin/AuthenticationInner/Recoverpw";
import Recoverpw2 from "@pages/admin/AuthenticationInner/Recoverpw2";
import ForgetPwd1 from "@pages/admin/AuthenticationInner/ForgetPassword";
import ForgetPwd2 from "@pages/admin/AuthenticationInner/ForgetPassword2";
import LockScreen from "@pages/admin/AuthenticationInner/auth-lock-screen";
import LockScreen2 from "@pages/admin/AuthenticationInner/auth-lock-screen-2";
import ConfirmMail from "@pages/admin/AuthenticationInner/page-confirm-mail";
import ConfirmMail2 from "@pages/admin/AuthenticationInner/page-confirm-mail-2";
import EmailVerification from "@pages/admin/AuthenticationInner/auth-email-verification";
import EmailVerification2 from "@pages/admin/AuthenticationInner/auth-email-verification-2";
import TwostepVerification from "@pages/admin/AuthenticationInner/auth-two-step-verification";
import TwostepVerification2 from "@pages/admin/AuthenticationInner/auth-two-step-verification-2";

// Dashboard
import Dashboard from "@pages/admin/Dashboard/index";

import PageCustomer from "@pages/admin/Customers/index";
import UpdateCustomer from "@components/admin/Customers/UpdateCustomer";
import PageDishes  from "@pages/admin/Dishes/index";
import ListRole from "@pages/admin/Role/ListRole.jsx";
import ListPermissionGroup from "@pages/admin/PermissionGroup/ListPermissionGroup.jsx";
import ListPermission from "@pages/admin/Permission/ListPermission.jsx";
import ListUser from "@pages/admin/Users/ListUser.jsx";
import ListUserRole from "@pages/admin/UserRole/ListUserRole.jsx";
import PageTable from "@pages/admin/Tables/index";
import PageReservation from "@pages/admin/Reservations/index";
import PageTableArea from "@pages/admin/TableAreas/index";
import PageOrder from "@pages/admin/Orders/index";
import PageCombo from "@pages/admin/Combos/index";
import PageCategory from "@pages/admin/Categories/index";

const authProtectedRoutes = [
  { path: "/dashboard", component: <Dashboard /> },

  // Customer routes
  { path: "/customer", component: <PageCustomer /> },
  { path: "/customer/edit/:id", component: <UpdateCustomer /> },

  // Role/Permission/User routes
  { path: "/roles", component: <ListRole /> },
  { path: "/permission_groups", component: <ListPermissionGroup /> },
  { path: "/permissions", component: <ListPermission /> },
  { path: "/users", component: <ListUser /> },
  { path: "/user_roles", component: <ListUserRole /> },

  // Table routes
  { path: "/table", component: <PageTable /> },
  { path: "/categories", component: <PageCategory /> },

  // Reservation routes
  { path: "/reservations", component: <PageReservation /> },
  { path: "/reservations/list", component: <PageReservation /> },
  { path: "/reservations/:id/detail", component: <PageReservation /> },
  { path: "/reservations/create", component: <PageReservation /> },
  { path: "/reservations/:id/edit", component: <PageReservation /> },
  { path: "/reservations/trash", component: <PageReservation /> },
  
  // Quản lý khu vực bàn
  { path: "/table-areas", component: <PageTableArea  /> },
  { path: "/table-areas/list", component: <PageTableArea  /> },
  { path: "/table-areas/:id/detail", component: <PageTableArea  /> },
  { path: "/table-areas/create", component: <PageTableArea  /> },
  { path: "/table-areas/:id/update", component: <PageTableArea  /> },
  { path: "/table-areas/:id/delete", component: <PageTableArea  /> },

  // Quản lý đơn hàng
  { path: "/orders", component: <PageOrder /> },
  { path: "/orders/list", component: <PageOrder /> },
  { path: "/orders/:id/detail", component: <PageOrder /> },
  { path: "/orders/create", component: <PageOrder /> },
  { path: "/orders/:id/edit", component: <PageOrder /> },
  { path: "/orders/track", component: <PageOrder /> },

  { path: "/dishes", component: <PageDishes /> },
  //   // //profile
  { path: "/profile", component: <UserProfile /> },

  { path: "/combos", component: <PageCombo /> },

  { path: "/", exact: true, component: <Navigate to="/dashboard" /> },
];

const publicRoutes = [
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
  { path: "/forgot-password", component: <ForgetPwd /> },
  { path: "/register", component: <Register /> },


  { path: "/pages-login", component: <Login1 /> },
  { path: "/pages-login-2", component: <Login2 /> },
  { path: "/pages-register", component: <Register1 /> },
  { path: "/pages-register-2", component: <Register2 /> },
  { path: "/page-recoverpw", component: <Recoverpw /> },
  { path: "/page-recoverpw-2", component: <Recoverpw2 /> },
  { path: "/pages-forgot-pwd", component: <ForgetPwd1 /> },
  { path: "/pages-forgot-pwd-2", component: <ForgetPwd2 /> },
  { path: "/auth-lock-screen", component: <LockScreen /> },
  { path: "/auth-lock-screen-2", component: <LockScreen2 /> },
  { path: "/page-confirm-mail", component: <ConfirmMail /> },
  { path: "/page-confirm-mail-2", component: <ConfirmMail2 /> },
  { path: "/auth-email-verification", component: <EmailVerification /> },
  { path: "/auth-email-verification-2", component: <EmailVerification2 /> },
  { path: "/auth-two-step-verification", component: <TwostepVerification /> },
  { path: "/auth-two-step-verification-2", component: <TwostepVerification2 /> },
];

export { authProtectedRoutes, publicRoutes };
