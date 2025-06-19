import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../../../assets/client/images/header/logo.jpg";
import BookingPopup from "./BookingPopup";
import { FaPhoneAlt, FaRegClock, FaGift, FaUserPlus, FaUser } from "react-icons/fa";
import "./header.scss";

const Header = () => {
  const [showNoti, setShowNoti] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const location = useLocation();

  return (
    <header className="header-wrapper">
      {/* Header Top mới */}
      <section className="header-top-bar">
        <div className="header-top-left">
          <span className="icon"><FaPhoneAlt /></span>
          <span className="top-text">Hotline: <b>*2005</b></span>
          <span className="icon"><FaRegClock /></span>          <span className="top-text">16:00 - 23:00</span>
        </div>
        <div className="header-top-right">
          <span className="icon"><FaGift /></span>

          <span className="divider-vertical" />
          <span className="icon"><FaUser /></span>
          <span className="top-link">Đăng nhập</span>
          <span className="divider-vertical" />
          <span className="icon"><FaUserPlus /></span>
          <span className="top-link">Đăng ký</span>
        </div>
      </section>
      {/* Header Main */}
      <section className="header-main">
        <div className="header-left">
          <Link to="/home-page" className="brand-link">
            <span className="star-icon">⭐</span>
            <div className="brand-text">
              <span className="brand-sub">QUÁN NHẬU</span>
              <span className="brand-main">Hoàng Gia</span>
            </div>
          </Link>
          <span className="hotline-main">HOTLINE <b>*2005</b></span>
        </div>
        <div className="header-right">
          <nav className="nav-links">
            <Link to="/home-page" className={`nav-link ${location.pathname.includes("/home-page") ? "active" : ""}`}>TRANG CHỦ</Link>
            <Link to="/menu-page" className={`nav-link ${location.pathname.includes("/menu-page") ? "active" : ""}`}>THỰC ĐƠN</Link>
            <Link to="/branch-page" className={`nav-link ${location.pathname.includes("/branch-page") ? "active" : ""}`}>CƠ SỞ</Link>
            <Link to="/endow-page" className={`nav-link ${location.pathname.includes("/endow-page") ? "active" : ""}`}>ƯU ĐÃI</Link>
            <Link to="/contact-page" className={`nav-link ${location.pathname.includes("/contact-page") ? "active" : ""}`}>LIÊN HỆ</Link>
            <button className="nav-button" onClick={() => setShowPopup(true)}>ĐẶT BÀN</button>
          </nav>
        </div>
        {showPopup && (
          <BookingPopup isOpen={showPopup} onClose={() => setShowPopup(false)} />
        )}
      </section>
    </header>
  );
};

export default Header;
