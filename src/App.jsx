import PropTypes from "prop-types";
import React from "react";
import { Routes, Route } from "react-router-dom";
import { connect } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "@components/admin/ProtectedRoute.jsx";
import Authmiddleware from "@routes/admin/route.jsx";

// Import Routes
import { publicRoutes, authProtectedRoutes,authOnlyRoutes} from "@routes/admin/index.jsx";
import { clientRoutes } from "@routes/client/index.jsx";

// Layouts
import Include from "@components/admin/Include/";
import AdminLayout from "@layouts/AdminLayout";
import ClientLayout from "@components/client/include/ClientLayout";

// SCSS
import "@assets/admin/scss/theme.scss";

// Fake backend
import fakeBackend from "@helpers/admin/AuthType/fakeBackend";
fakeBackend();

const App = () => {
    const Layout = Include;

    return (
        <React.Fragment>
            <Routes>
                {/* ✅ Public Admin Routes */}
                {publicRoutes.map((route, idx) => (
                    <Route
                        key={idx}
                        path={route.path}
                        element={<AdminLayout>{route.component}</AdminLayout>}
                    />
                ))}

                {/* ✅ Routes chỉ cần login (không cần permission) */}
                {authOnlyRoutes.map((route, idx) => (
                    <Route
                        key={idx}
                        path={route.path}
                        element={
                            <Authmiddleware>
                                <Layout>{route.component}</Layout>
                            </Authmiddleware>
                        }
                    />
                ))}

                {/* ✅ Protected Admin Routes - Check Token + Permission */}
                {authProtectedRoutes.map((route, idx) => (
                    <Route
                        key={idx}
                        path={route.path}
                        element={
                            <Authmiddleware>
                                <Layout>
                                    <ProtectedRoute permission={route.permission}>
                                        {route.component}
                                    </ProtectedRoute>
                                </Layout>
                            </Authmiddleware>
                        }
                    />
                ))}


                {/* ✅ Client Routes */}
                {clientRoutes.map((route, idx) => (
                    <Route
                        key={idx}
                        path={route.path}
                        element={<ClientLayout>{route.component}</ClientLayout>}
                    />
                ))}
            </Routes>

            {/* ✅ Toasts */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
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
