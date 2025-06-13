import React from "react";
import { Navigate } from "react-router-dom";

// // File Manager
import FileManager from "@pages/admin/FileManager/index";

// // Profile
import UserProfile from "@pages/admin/Authentication/user-profile";

// // Authentication related pages
import Login from "@pages/admin/Authentication/Login";
import Logout from "@pages/admin/Authentication/Logout";
import Register from "@pages/admin/Authentication/Register";
import ForgetPwd from "@pages/admin/Authentication/ForgetPassword";

// //  // Inner Authentication
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

// // Dashboard
import Dashboard from "@pages/admin/Dashboard/index";

// //Tables
import BasicTables from "@pages/admin/Tables/BasicTables";
import DatatableTables from "@pages/admin/Tables/DatatableTables";

// // Forms
import FormElements from "@pages/admin/Forms/FormElements";
import FormLayouts from "@pages/admin/Forms/FormLayouts";
import FormAdvanced from "@pages/admin/Forms/FormAdvanced/index";
import FormEditors from "@pages/admin/Forms/FormEditors";
import FormValidations from "@pages/admin/Forms/FormValidations";
import FormMask from "@pages/admin/Forms/FormMask";
import FormRepeater from "@pages/admin/Forms/FormRepeater";
import FormUpload from "@pages/admin/Forms/FormUpload";
import FormWizard from "@pages/admin/Forms/FormWizard";
import DualListbox from "@pages/admin/Tables/DualListbox";

// //Ui
import UiAlert from "@pages/admin/Ui/UiAlerts/index";
import UiButtons from "@pages/admin/Ui/UiButtons/index";
import UiCards from "@pages/admin/Ui/UiCard/index";
import UiCarousel from "@pages/admin/Ui/UiCarousel";
import UiColors from "@pages/admin/Ui/UiColors";
import UiDropdown from "@pages/admin/Ui/UiDropdown/index";
import UiOffCanvas from "@pages/admin/Ui/UiOffCanvas";

import UiGeneral from "@pages/admin/Ui/UiGeneral";
import UiGrid from "@pages/admin/Ui/UiGrid";
import UiImages from "@pages/admin/Ui/UiImages";
import UiLightbox from "@pages/admin/Ui/UiLightbox";
import UiModal from "@pages/admin/Ui/UiModal/index";

import UiTabsAccordions from "@pages/admin/Ui/UiTabsAccordions";
import UiTypography from "@pages/admin/Ui/UiTypography";
import UiVideo from "@pages/admin/Ui/UiVideo";
import UiSessionTimeout from "@pages/admin/Ui/UiSessionTimeout";
import UiRating from "@pages/admin/Ui/UiRating";
import UiRangeSlider from "@pages/admin/Ui/UiRangeSlider";
import UiNotifications from "@pages/admin/Ui/UINotifications";

import UiPlaceholders from "@pages/admin/Ui/UiPlaceholders";
import UiToasts from "@pages/admin/Ui/UiToast";
import UiUtilities from "@pages/admin/Ui/UiUtilities";
import SwitchUI from "@components/admin/ui/SwitchUI";

// //Pages
import PagesStarter from "@pages/admin/Utility/pages-starter";
import PagesMaintenance from "@pages/admin/Utility/pages-maintenance";
import PagesComingsoon from "@pages/admin/Utility/pages-comingsoon";
import PagesTimeline from "@pages/admin/Utility/pages-timeline";
import PagesFaqs from "@pages/admin/Utility/pages-faqs";
import PagesPricing from "@pages/admin/Utility/pages-pricing";
import Pages404 from "@pages/admin/Utility/pages-404";
import Pages500 from "@pages/admin/Utility/pages-500";

import PageCustomer from "@pages/admin/Customers/index";
import UpdateCustomer from "@components/admin/Customers/UpdateCustomer";

const authProtectedRoutes = [
  { path: "/dashboard", component: <Dashboard /> },

  //Customer routes
  { path: "/customer", component: <PageCustomer /> },
  { path: "/customer/edit/:id", component: <UpdateCustomer /> },

  //File Manager
  { path: "/apps-filemanager", component: <FileManager /> },

  //   // //profile
  { path: "/profile", component: <UserProfile /> },

  //   // Tables
  { path: "/tables-basic", component: <BasicTables /> },
  { path: "/tables-datatable", component: <DatatableTables /> },

  //   // Forms
  { path: "/form-elements", component: <FormElements /> },
  { path: "/form-layouts", component: <FormLayouts /> },
  { path: "/form-advanced", component: <FormAdvanced /> },
  { path: "/form-editors", component: <FormEditors /> },
  { path: "/form-mask", component: <FormMask /> },
  { path: "/form-repeater", component: <FormRepeater /> },
  { path: "/form-uploads", component: <FormUpload /> },
  { path: "/form-wizard", component: <FormWizard /> },
  { path: "/form-validation", component: <FormValidations /> },
  { path: "/dual-listbox", component: <DualListbox /> },

  //   // Ui
  { path: "/ui-alerts", component: <UiAlert /> },
  { path: "/ui-buttons", component: <UiButtons /> },
  { path: "/ui-cards", component: <UiCards /> },
  { path: "/ui-carousel", component: <UiCarousel /> },
  { path: "/ui-colors", component: <UiColors /> },
  { path: "/ui-dropdowns", component: <UiDropdown /> },
  { path: "/ui-offcanvas", component: <UiOffCanvas /> },
  { path: "/ui-general", component: <UiGeneral /> },
  { path: "/ui-grid", component: <UiGrid /> },
  { path: "/ui-images", component: <UiImages /> },
  { path: "/ui-lightbox", component: <UiLightbox /> },
  { path: "/ui-modals", component: <UiModal /> },
  { path: "/ui-tabs-accordions", component: <UiTabsAccordions /> },
  { path: "/ui-typography", component: <UiTypography /> },
  { path: "/ui-video", component: <UiVideo /> },
  { path: "/ui-session-timeout", component: <UiSessionTimeout /> },
  { path: "/ui-rating", component: <UiRating /> },
  { path: "/ui-rangeslider", component: <UiRangeSlider /> },
  { path: "/ui-notifications", component: <UiNotifications /> },
  { path: "/ui-placeholders", component: <UiPlaceholders /> },
  { path: "/ui-toasts", component: <UiToasts /> },
  { path: "/ui-utilities", component: <UiUtilities /> },
  { path: "/ui-switch", component: <SwitchUI /> },

  //   //Utility
  { path: "/pages-starter", component: <PagesStarter /> },
  { path: "/pages-timeline", component: <PagesTimeline /> },
  { path: "/pages-faqs", component: <PagesFaqs /> },
  { path: "/pages-pricing", component: <PagesPricing /> },

  { path: "/", exact: true, component: <Navigate to="/dashboard" /> },
];

const publicRoutes = [
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
  { path: "/forgot-password", component: <ForgetPwd /> },
  { path: "/register", component: <Register /> },

  { path: "/pages-maintenance", component: <PagesMaintenance /> },
  { path: "/pages-comingsoon", component: <PagesComingsoon /> },
  { path: "/pages-404", component: <Pages404 /> },
  { path: "/pages-500", component: <Pages500 /> },

  //   // Authentication Inner
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
  {
    path: "/auth-two-step-verification-2",
    component: <TwostepVerification2 />,
  },
];

// export { authProtectedRoutes, publicRoutes };
export { authProtectedRoutes, publicRoutes };
