import React from "react";
import PropTypes from "prop-types";

const SwitchUI = ({ id, checked, onChange, disabled = false }) => {
  return (
    <div className="d-flex">
      <div className="square-switch">
        <input
          type="checkbox"
          id={id}
          className="switch switch-bool"
          checked={!!checked}
          onChange={onChange}
          disabled={disabled}
        />
        <label htmlFor={id} data-on-label="Yes" data-off-label="No" />
      </div>
    </div>
  );
};

SwitchUI.propTypes = {
  id: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

export default SwitchUI;
