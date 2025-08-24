import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import "./ArrivalTimeSelect.scss";

const times = [
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
  "07:30 PM",
  "08:00 PM",
  "08:30 PM",
  "09:00 PM",
  "09:30 PM",
  "10:00 PM",
  "10:30 PM",
  "11:00 PM",
];

const parseTimeToDate = (timeStr, dateStr) => {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  const [year, month, day] = dateStr.split("-");
  return new Date(year, month - 1, day, hours, minutes);
};

const ArrivalTimeSelect = ({ selectedTime, onTimeChange, reservationDate }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const now = useMemo(() => new Date(), []);

  const isToday = reservationDate === now.toISOString().split("T")[0];

  // Lọc các khung giờ hợp lệ
  const getValidTimes = useCallback(() => {
    return times.filter((time) => {
      if (!reservationDate) return false;
      if (isToday) {
        return parseTimeToDate(time, reservationDate) > now;
      }
      return true;
    });
  }, [isToday, reservationDate, now]);

  // Kiểm tra và cập nhật thời gian nếu cần
  useEffect(() => {
    if (isToday && selectedTime) {
      const findNextValidTime = () => {
        const validTimes = getValidTimes();
        if (validTimes.length === 0) return null;
        if (!selectedTime) return validTimes[0];

        const currentTimeIndex = validTimes.indexOf(selectedTime);
        if (currentTimeIndex === -1) {
          return validTimes[0];
        }
        return selectedTime;
      };

      const nextValidTime = findNextValidTime();
      if (nextValidTime !== selectedTime) {
        onTimeChange(nextValidTime);
      }
    }
  }, [isToday, selectedTime, reservationDate, onTimeChange, getValidTimes]);

  const validTimes = getValidTimes();

  return (
    <div className="arrival-time-select">
      <label>Giờ đến</label>
      <Dropdown
        isOpen={dropdownOpen}
        toggle={() => setDropdownOpen((prev) => !prev)}
      >
        <DropdownToggle caret className="arrival-toggle">
          {selectedTime || "Chọn giờ"}
        </DropdownToggle>
        <DropdownMenu className="arrival-menu">
          {validTimes.map((time, index) => (
            <DropdownItem
              key={index}
              onClick={() => onTimeChange(time)}
              active={time === selectedTime}
            >
              {time}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default ArrivalTimeSelect;
