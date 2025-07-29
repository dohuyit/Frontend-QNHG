import React, { useState, useEffect } from "react";
import "./header.scss";
import { Link, Navigate, useLocation } from "react-router-dom";
import logo from "@assets/client/images/header/logo.png";
import BookingPopup from "./BookingPopup";
import HeaderService from "@services/client/HeaderService"; 
import { FaPhoneAlt, FaRegClock, FaGift, FaUser, FaUserPlus } from "react-icons/fa";
import InforPage from "./inforPage";

const Header = () => {
  const [showNoti, setShowNoti] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Gọi API lấy danh mục cha khi load header
  useEffect(() => {
    const checkUser = () => {
      const token = localStorage.getItem('token');
      if (token) {
        const clientUser = localStorage.getItem('clientUser');
        if (clientUser) {
          try {
            const userObj = JSON.parse(clientUser);
            setUser(userObj || null);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('clientUser');
    setUser(null);
    window.location.reload();
  };

  return (
    <header className="header-wrapper">
      {showNoti && (
        <div className="header-notification">
          <span className="noti-text">
            TẶNG 5000 ÁO PHÔNG PHIÊN BẢN THIẾT KẾ CHO KHÁCH HÀNG
          </span>
          <button
            className="noti-close"
            onClick={() => setShowNoti(false)}
            aria-label="Đóng thông báo"
          >
            ✕
          </button>
        </div>
      )}
      {/* Header Top mới */}
      <section className="header-top-bar">
        <div className="header-top-left">
          <span className="icon">
            <FaPhoneAlt />
          </span>
          <span className="top-text">
            Hotline: <b>*2005</b>
          </span>
          <span className="icon">
            <FaRegClock />
          </span>{" "}
          <span className="top-text">16:00 - 23:00</span>
        </div>
        <div className="header-top-right">
          <span className="icon">
            <FaGift />
          </span>
          <span className="divider-vertical" />
          {user ? (
            <div className="user-dropdown" style={{ display: "inline-block", position: "relative" }}>
              <span
                className="top-link user-name"
                style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", marginLeft: 0, fontWeight: 400, fontSize: 18 }}
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                <span className="icon" style={{ marginRight: 6 }}><FaUser /></span>
                {user.full_name}
              </span>
              {showDropdown && (
                <div
                  className="dropdown-menu-logout"
                  style={{
                    position: "absolute",
                    top: "120%",
                    right: 0,
                    background: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                    borderRadius: 8,
                    zIndex: 100,
                    minWidth: 120,
                  }}
                >
                  <button
                    className="logout-btn"
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      background: "#22543d",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "8px 0",
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <span className="icon">
                <FaUser />
              </span>
              <Link to="/login-page" className="top-link">
                Đăng nhập
              </Link>
              <span className="divider-vertical" />
              <span className="icon">
                <FaUserPlus />
              </span>
              <Link to="/register-page" className="top-link">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </section>
      <div className="header-main">
        <div className="header-left">
          <Link to="/" className="logo-header">
            <img src={logo} alt="Quán Nhậu Hoàng Gia" />
          </Link>
        </div>

        <div className="nav-menu">
          <div className="nav-links">
            <Link
              to="/"
              className={`nav-link ${
                location.pathname === "/" ? "active" : ""
              }`}
            >
              Trang Chủ
            </Link>
            <Link
              to="/menu-page"
              className={`nav-link ${location.pathname.includes("/menu-page") ? "active" : ""}`}
            >
              Thực Đơn
            </Link>
            <Link
              to="/branch-page"
              className={`nav-link ${location.pathname.includes("/branch-page") ? "active" : ""}`}
            >
              Cơ Sở
            </Link>
            <Link
              to="/endow-page"
              className={`nav-link ${location.pathname.includes("/endow-page") ? "active" : ""}`}
            >
              Ưu Đãi
            </Link>
            <Link
              to="/contact-page"
              className={`nav-link ${location.pathname.includes("/contact-page") ? "active" : ""}`}
            >
              Liên Hệ
            </Link>

            {/* Nút Đặt Bàn mở popup */}
            <button className="nav-button" onClick={() => setShowPopup(true)}>
              ĐẶT BÀN
            </button>
          </div>

          {/* ❗️(Tuỳ chọn): hiển thị danh mục cha nếu cần */}
          {/* <ul className="dropdown-menu">
            {categories.map((item) => (
              <li key={item.id}>
                <Link to={`/menu-page?category=${item.id}`}>{item.name}</Link>
              </li>
            ))}
          </ul> */}
        </div>
      </div>

      {showPopup && (
        <BookingPopup isOpen={showPopup} onClose={() => setShowPopup(false)} />
      )}
      {/* Hiển thị InforPage nếu không phải trang chủ */}
      {location.pathname !== "/" && (
        <InforPage
          category={
            location.pathname.includes("menu-page") ? "menu" :
            location.pathname.includes("branch-page") ? "branch" :
            "menu"
          }
        />
      )}
    </header>
  );
};

export default Header;
