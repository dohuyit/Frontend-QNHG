import React from "react";
import { Button, Badge } from "reactstrap";
import "@pages/admin/KitchenOrders/KitchenOrdersKanban.css";

/**
 * StatusFilterGroup - Reusable badge button group for status filtering/selecting
 * @param {Array} options - [{ label, value, badgeColor }]
 * @param {string} value - currently selected value
 * @param {function} onChange - callback(newValue)
 * @param {string} className - optional extra class
 * @param {string} size - optional button size (sm, md, lg)
 */
const StatusFilterGroup = ({
  options,
  value,
  onChange,
  className = "",
  size = "sm",
  style,
}) => {
  return (
    <div className={`d-flex flex-wrap gap-2 ${className}`} style={style}>
      {options.map((opt) => (
        <Button
          key={opt.value}
          color={value === opt.value ? opt.badgeColor || "primary" : "light"}
          outline={value !== opt.value}
          className={value !== opt.value ? "text-dark border" : ""}
          style={value !== opt.value ? { opacity: 0.95, fontWeight: 500 } : {}}
          onClick={() => onChange(opt.value)}
          size={size}
          type="button"
        >
          {opt.label}
          {"badgeCount" in opt ? (
            <Badge color={opt.badgeColor || "secondary"} pill className="ms-2">
              {opt.badgeCount}
            </Badge>
          ) : null}
        </Button>
      ))}
    </div>
  );
};

export default StatusFilterGroup;
