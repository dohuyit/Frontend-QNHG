import React, { useState } from "react";

const SwitchUI = () => {
  const [sq3, setSq3] = useState(true);

  return (
    <div className="d-flex">
        <div className="square-switch">
          <input
            type="checkbox"
            id="square-switch3"
            className="switch switch-bool"
            defaultChecked={sq3}
            onChange={() => setSq3(!sq3)}
          />
          <label
            htmlFor="square-switch3"
            data-on-label="Yes"
            data-off-label="No"
          />
        </div>
      </div>
  );
};

export default SwitchUI;
