import React from "react";
import { Navigate } from "react-router-dom";

import UserProfile from "@pages/admin/Authentication/user-profile";

// Authentication related pages
import Logout from "@pages/admin/Authentication/Logout";

// Inner Authentication
import ForgetPwd1 from "@pages/admin/AuthenticationInner/ForgetPassword";
import ForgetPwd2 from "@pages/admin/AuthenticationInner/ForgetPassword2";
import ConfirmMail from "@pages/admin/AuthenticationInner/page-confirm-mail";
import ConfirmMail2 from "@pages/admin/AuthenticationInner/page-confirm-mail-2";
import EmailVerification from "@pages/admin/AuthenticationInner/auth-email-verification";
import EmailVerification2 from "@pages/admin/AuthenticationInner/auth-email-verification-2";
import TwostepVerification from "@pages/admin/AuthenticationInner/auth-two-step-verification";
import TwostepVerification2 from "@pages/admin/AuthenticationInner/auth-two-step-verification-2";
import AdminLogin from "@pages/admin/Users/AdminLogin.jsx";
import PaymentResult from "@components/admin/Orders/PaymentResult";

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
import FormOrderCreate from "@components/admin/Orders/FormOrderCreate";
import FormOrderUpdate from "@components/admin/Orders/FormOrderUpdate";
import PageCombo from "@pages/admin/Combos/index";
import PageCategory from "@pages/admin/Categories/index";
import PageKitchenOrders from "@pages/admin/KitchenOrders/index";
import AdminForgotPassword from "@pages/admin/Users/AdminForgotpassword.jsx";
import AdminResetPassword from "@pages/admin/Users/ AdminResetPassword.jsx";
import Forbidden403 from "@pages/admin/Users/403.jsx";
import ChangePassword from "@pages/admin/Users/ChangePassword.jsx";
const authProtectedRoutes = [
  { path: "/dashboard", component: <Dashboard />, permission: "dashboard.view" },

  // Customer routes
  { path: "/customer", component: <PageCustomer />, permission: "customer.view" },
  { path: "/customer/edit/:id", component: <UpdateCustomer />, permission: "customer.update" },

  // Role/Permission/User routes
  { path: "/roles", component: <ListRole />, permission: "role.view" },
  { path: "/permission_groups", component: <ListPermissionGroup />, permission: "permission_group.view" },
  { path: "/permissions", component: <ListPermission />, permission: "permission.view" },
  { path: "/users", component: <ListUser />, permission: "user.view" },
  { path: "/user_roles", component: <ListUserRole />, permission: "user_role.view" },

  // Table routes
  { path: "/table", component: <PageTable />, permission: "table.view" },
  { path: "/categories", component: <PageCategory />, permission: "category.view" },

  // Reservation routes
  { path: "/reservations", component: <PageReservation />, permission: "reservation.view" },
  { path: "/reservations/list", component: <PageReservation />, permission: "reservation.view" },
  { path: "/reservations/:id/detail", component: <PageReservation />, permission: "reservation.view" },
  { path: "/reservations/create", component: <PageReservation />, permission: "reservation.create" },
  { path: "/reservations/:id/edit", component: <PageReservation />, permission: "reservation.update" },
  { path: "/reservations/trash", component: <PageReservation />, permission: "reservation.view" },

  // Khu vực bàn
  { path: "/table-areas", component: <PageTableArea />, permission: "table-area.view" },
  { path: "/table-areas/list", component: <PageTableArea />, permission: "table-area.view" },
  { path: "/table-areas/:id/detail", component: <PageTableArea />, permission: "table-area.view" },
  { path: "/table-areas/create", component: <PageTableArea />, permission: "table-area.create" },
  { path: "/table-areas/:id/update", component: <PageTableArea />, permission: "table-area.update" },
  { path: "/table-areas/:id/delete", component: <PageTableArea />, permission: "table-area.delete" },

// Quản lý đơn hàng
  { path: "/orders/list", component: <PageOrder />, permission: "order.view" },
  { path: "/orders/form/create", component: <FormOrderCreate />, permission: "order.create" },
  { path: "/orders/form/edit", component: <FormOrderUpdate />, permission: "order.update" },


  // Đơn hàng
  { path: "/orders", component: <PageOrder />, permission: "order.view" },
  { path: "/orders/list", component: <PageOrder />, permission: "order.view" },
  { path: "/orders/:id/detail", component: <PageOrder />, permission: "order.view" },
  { path: "/orders/create", component: <PageOrder />, permission: "order.create" },
  { path: "/orders/:id/edit", component: <PageOrder />, permission: "order.update" },
  { path: "/orders/track", component: <PageOrder />, permission: "order.view" },

  // Món ăn
  { path: "/dishes", component: <PageDishes />, permission: "dish.view" },

  // Combo
  { path: "/combos", component: <PageCombo />, permission: "combo.view" },

  { path: "/kitchen-orders", component: <PageKitchenOrders />, permission: "kitchen-order.view" },
];


const publicRoutes = [
  { path: "/logout", component: <Logout /> },
  { path: "/admin/login", component: <AdminLogin /> },
  { path: "/admin/forgot-password", component: <AdminForgotPassword /> },
  { path: "/admin/reset-password/:id", component: <AdminResetPassword /> },
  { path: "/403", component: <Forbidden403 /> },
  { path: "/pages-forgot-pwd", component: <ForgetPwd1 /> },
  { path: "/pages-forgot-pwd-2", component: <ForgetPwd2 /> },
  { path: "/page-confirm-mail", component: <ConfirmMail /> },
  { path: "/page-confirm-mail-2", component: <ConfirmMail2 /> },
  { path: "/auth-email-verification", component: <EmailVerification /> },
  { path: "/auth-email-verification-2", component: <EmailVerification2 /> },
  { path: "/auth-two-step-verification", component: <TwostepVerification /> },
  { path: "/auth-two-step-verification-2", component: <TwostepVerification2 /> },
  { path: "/payment-result", component: <PaymentResult /> },
];


const authOnlyRoutes = [
  { path: "/profile", component: <UserProfile /> }, // Chỉ yêu cầu đăng nhập
  { path: "/change-password", component: <ChangePassword /> },
];
export { authProtectedRoutes, publicRoutes,authOnlyRoutes };
