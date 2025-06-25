import React, { useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import './ArrivalTimeSelect.scss';

const times = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'
];

const ArrivalTimeSelect = ({ selectedTime, onTimeChange }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="arrival-time-select">
      <label>Giờ đến</label>
      <Dropdown isOpen={dropdownOpen} toggle={() => setDropdownOpen(prev => !prev)}>
        <DropdownToggle caret className="arrival-toggle">
          {selectedTime || 'Chọn giờ'}
        </DropdownToggle>
        <DropdownMenu className="arrival-menu">
          {times.map((time, index) => (
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
