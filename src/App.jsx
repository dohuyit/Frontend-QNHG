import PropTypes from "prop-types";
import React from "react";
import { Routes, Route } from "react-router-dom";
import { connect } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import Routes
import {  publicRoutes } from "@routes/admin/index.jsx";
//FE
import { clientRoutes } from "@routes/client/index.jsx";
// Middleware
import Authmiddleware from "@routes/admin/route.jsx";

// Layouts
import Include from "@components/admin/Include/";
// SCSS
import "@assets/admin/scss/theme.scss";

// Fake backend
import fakeBackend from "@helpers/admin/AuthType/fakeBackend";

// Layouts
import AdminLayout from "@layouts/AdminLayout";
import ClientLayout from "@components/client/include/ClientLayout";
import { authProtectedRoutes } from "@routes/admin";

fakeBackend();

const App = (props) => {
  // Sử dụng cố định Include
  const Layout = Include;

  // Tạo user giả
  localStorage.setItem("authUser", JSON.stringify({ username: "quanglam" }));

  return (
    <React.Fragment>
      <Routes>
        {/* ✅ Public Admin Routes */}
        {publicRoutes.map((route, idx) => (
          <Route
            path={route.path}
            element={<AdminLayout>{route.component}</AdminLayout>}
            key={idx}
            exact={true}
          />
        ))}

         {authProtectedRoutes.map((route, idx) => (
          <Route
            path={route.path}
            element={<Layout>{route.component}</Layout>}
            key={idx}
            exact={true}
          />
        ))}

        {/* {authProtectedRoutes.map((route, idx) => (
          <Route
            path={route.path}
            element={
              <Authmiddleware>
                <Layout>{route.component}</Layout>
              </Authmiddleware>
            }
            key={idx}
            exact={true}
          />
        ))} */}

        {/* ✅ Client Routes — Header + Footer tự động */}
        {clientRoutes.map((route, idx) => (
          <Route
            path={route.path}
            element={<ClientLayout>{route.component}</ClientLayout>}
            key={idx}
            exact={true}
          />
        ))}
      </Routes>
    </React.Fragment>
  );
};

App.propTypes = {
  layout: PropTypes.any,
};

const mapStateToProps = (state) => ({
  layout: state.Layout,
});

export default connect(mapStateToProps, null)(App);
