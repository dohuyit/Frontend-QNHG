import React from "react";
import "./home.scss";
import Slider from "react-slick";
import { introInfo, partyInfo, dishes, endows, promoSlides } from "./data-home";
import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import plush from "@assets/client/images/menu/plush.svg";

// Đã xóa import Header

export default function Home() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 4 } },
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 576, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <>
      {/* Đã xóa <Header /> */}
      {/* Section 1: tiêu đề */}
      <section className="home-section">
        <div className="home-content">
          <h1>HOÀNG GIA QUÁN<br />THẾ GIỚI CỦA TA</h1>
        </div>
      </section>

      {/* Section 2: Món mới ra lò */}
      <section className="new-menu-section">
        <h2 className="section-title">Món mới ra lò</h2>
        <div className="slider-wrapper">
          <Slider {...settings}>
            {dishes.map(d => (
              <div key={d.id} className="card-item small">
                <div className="card-image">
                  <img src={d.img} alt={d.name} />
                </div>
                <div className="card-info">
                  <h3>{d.name}</h3>
                  <p className="price">{d.price}</p>
                  <button className="btn-order">+ Đặt</button>
                </div>
              </div>
            ))}
          </Slider>
        </div>
        <div className="btn-wrap">
          <button className="btn-view-menu">Xem thực đơn</button>
        </div>
      </section>

      {/* Section 3: chữ chạy */}
      <section className="promotion-section">
        <div className="promotion-wrapper">
          <span className="promotion-text">
            ƯU ĐÃI HOÀNG GIA 🔖 ƯU ĐÃI HOÀNG GIA 🔖 ƯU ĐÃI HOÀNG GIA 🔖 ƯU ĐÃI HOÀNG GIA 🔖 ƯU ĐÃI HOÀNG GIA 🔖 ƯU ĐÃI HOÀNG GIA 🔖 ƯU ĐÃI HOÀNG GIA 🔖 ƯU ĐÃI HOÀNG GIA 🔖
          </span>
        </div>
      </section>

      {/* Section 4: Khuyến mãi & Tin tức */}
      <section className="promo-cards-section">
        <div className="slider-wrapper promo">
          <Slider {...settings}>
            {endows.map(item => (
              <div key={item.id} className="card-item small">
                <div className="card-image">
                  <img src={item.image} alt={item.description} />
                </div>
                <div className="card-info">
                  <h3>{item.description}</h3>
                  <button className="btn-receive">Xem Ngay</button>
                </div>
              </div>
            ))}
          </Slider>
        </div>
        <div className="btn-wrap">
          <button className="btn-view-all">Xem tất cả</button>
        </div>
      </section>

      {/* Section 5: Giới thiệu thương hiệu */}
      <section className="intro-section">
        <div className="intro-container">
          <div className="intro-text">
            <h2>{introInfo.title}</h2>
            <ul>
              {introInfo.points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
          <div className="intro-image">
            <img src={introInfo.image} alt="Giới thiệu Quán Nhậu Hoàng Gia" />
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* Section 6: Tiệc tùng */}
      <section className="party-section">
        <div className="party-container">
          <div className="party-image">
            <img src={partyInfo.image} alt="Dịch vụ tiệc tùng Hoàng Gia" />
          </div>
          <div className="party-text">
            <h2>{partyInfo.title}</h2>
            <ul>
              {partyInfo.points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Section 7: Club */}
      <section className="club-section">
        <div className="club-container">
          <h3 className="club-subtitle">HOÀNG GIA CLUB</h3>
          <h4 className="club-title">
            Gia nhập Hoàng Gia <br />Uống sang - chơi chất.
          </h4>
          <p className="club-description">
            Hoàng Gia Club là nơi hội tụ của những tâm hồn yêu thích sự sang trọng và đẳng cấp. Tại đây, bạn sẽ được trải nghiệm những ly rượu thượng hạng, những món ăn tinh tế và những khoảnh khắc đáng nhớ bên bạn bè và người thân.
          </p>
          <button className="club-cta">ĐẶT BÀN NGAY</button>
        </div>
      </section>

      {/* Section 8: Slider khuyến mãi nhiều cột */}
      <section className="promo-slider-section">
        <div className="promo-slider-container">
          <Slider
            autoplay
            autoplaySpeed={4500}
            infinite
            speed={1000}
            slidesToShow={2}
            slidesToScroll={1}
            dots={false}
            arrows={false}
            responsive={[
              { breakpoint: 1200, settings: { slidesToShow: 2 } },
              { breakpoint: 768, settings: { slidesToShow: 1 } },
            ]}
          >
            {promoSlides.map((item) => (
              <div key={item.id} className="promo-slide-item">
                <img src={item.image} alt={item.alt} />
              </div>
            ))}
          </Slider>
        </div>
      </section>
    </>
  );
}
