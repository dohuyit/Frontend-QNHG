import PropTypes from "prop-types";
import React from "react";
import { Routes, Route } from "react-router-dom";
import { connect } from "react-redux";


// Import Routes
import { authProtectedRoutes, publicRoutes } from "@routes/admin/index.jsx";
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
import BaseLayout from "@layouts/BaseLayout.jsx";
import { ToastContainer } from "react-toastify";

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
            element={<BaseLayout>{route.component}</BaseLayout>}
            key={idx}
            exact={true}
          />
        ))}

        {authProtectedRoutes.map((route, idx) => (
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
        ))}

        {/* ✅ Client Routes — Header + Footer tự động */}
        {clientRoutes.map((route, idx) => (
          <Route
            path={route.path}
            element={<BaseLayout>{route.component}</BaseLayout>}
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
