import React, { useEffect } from "react";
import PropTypes from "prop-types";
import withRouter from "@components/admin/ui/withRouter";
import { logoutUser } from "@store/admin/actions";

//redux
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const history = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(logoutUser(history));
  }, [dispatch, history]);

  return <></>;
};

Logout.propTypes = {
  history: PropTypes.object,
};

export default withRouter(Logout);
