import React, { useState, useEffect } from "react";
import "./home.scss";
import Slider from "react-slick";
import { introInfo, partyInfo, endows, promoSlides } from "./data-home";
import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import DishDetailPopsup from "../dishDetail/DishDetailPopsup";
import BookingPopup from "../include/header/BookingPopup";
import OrderModal from "../order/order";
import { getFeaturedDishes } from "@services/client/dishDetailService";
import dishDefault from "@assets/admin/images/dish/dish-default.webp";
import BlurText from "../ui/BlurText";
import ClickSpark from "../ui/ClickSpark";
import HeroBanner from "./HeroBanner";
import { useCart } from "../cart/cartContext";
import CartSummary from "../cart/cart";
import CartModal from "../cart/cartModal";
import { formatPriceToVND } from "@helpers/formatPriceToVND";

export default function Home() {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [dishes, setDishes] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const { addToCart } = useCart();

  const fullUrl = `http://localhost:8000/storage/`;
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

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const res = await getFeaturedDishes();
        setDishes(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
        setDishes([]);
      }
    };
    fetchDishes();
  }, []);

  return (
    <>
      <ClickSpark
        sparkColor="#fff"
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <section className="hero-banner-section">
          <HeroBanner />
        </section>

        <section className="home-section">
          <div className="home-content">
            <BlurText
              text="Hoàng Gia Quán Đỉnh Cao Ẩm Thực "
              delay={150}
              animateBy="words"
              direction="top"
              className="title-page"
            />
          </div>
        </section>

        <section className="new-menu-section">
          <h2 className="section-title">Món mới ra lò</h2>
          <div className="slider-wrapper">
            <div className="slider-inner">
              <Slider {...settings}>
                {dishes.map((d) => (
                  <div
                    key={d.id}
                    className="card-item small"
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className="card-image"
                      onClick={() => {
                        setSelectedDish(d);
                        setShowDetail(true);
                      }}
                    >
                      <img
                        src={
                          d.image_url && d.image_url.trim() !== ""
                            ? `${fullUrl}${d.image_url}`
                            : dishDefault
                        }
                        alt={d.name}
                      />
                    </div>
                    <div className="card-info">
                      <h3
                        onClick={() => {
                          setSelectedDish(d);
                          setShowDetail(true);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {d.name}
                      </h3>
                      <p className="price">
                        {formatPriceToVND(d.selling_price)}
                      </p>
                      <button
                        className="btn-order"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(d);
                        }}
                      >
                        + Đặt
                      </button>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
          <div className="btn-wrap">
            <Link to="/menu-page" className="btn-view-menu">
              Xem thực đơn
            </Link>
          </div>
        </section>

        <section className="promotion-section">
          <div className="marquee">
            <div className="marquee-track">
              <div className="marquee-content">
                ƯU ĐÃI HOÀNG GIA 🔖 ƯU ĐÃI HOÀNG GIA 🔖 ƯU ĐÃI HOÀNG GIA 🔖 ƯU ĐÃI HOÀNG GIA 🔖 ƯU ĐÃI HOÀNG GIA 🔖 ƯU ĐÃI HOÀNG GIA 🔖
              </div>
            </div>
          </div>
        </section>

        <section className="promo-cards-section">
          <div className="slider-wrapper promo">
            <Slider {...settings}>
              {endows.map((item) => (
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

        <section className="club-section">
          <div className="club-container">
            <h3 className="club-subtitle">HOÀNG GIA CLUB</h3>
            <h4 className="club-title">
              Gia nhập Hoàng Gia <br />
              Uống sang - chơi chất.
            </h4>
            <p className="club-description">
              Hoàng Gia Club là nơi hội tụ của những tâm hồn yêu thích sự sang
              trọng và đẳng cấp. Tại đây, bạn sẽ được trải nghiệm những ly rượu
              thượng hạng, những món ăn tinh tế và những khoảnh khắc đáng nhớ
              bên bạn bè và người thân.
            </p>
            <button className="club-cta" onClick={() => setShowBooking(true)}>
              ĐẶT BÀN NGAY
            </button>
          </div>
        </section>

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

        <CartSummary onClick={() => setShowCart(true)} />
        {showCart && <CartModal onClose={() => setShowCart(false)} />}

      </ClickSpark>

      <DishDetailPopsup
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        dish={selectedDish}
      />

      <BookingPopup
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
      />
      <OrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        cartItems={[]}
      />
    </>
  );
}
