import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./menu.scss";
import { getMenuList, getAllDishes } from "@services/client/menuService";
import { getDishDetail } from "@services/client/dishDetailService";

import plush from "@assets/client/images/menu/plush.svg";
import defaultDishImg from "@assets/client/images/branch/anh-caugiay.jpg";

import NavbarCategory from "../../../components/client/include/header/NavbarCategory";
import DishDetailPopsup from "../dishDetail/DishDetailPopsup";
import { useCart } from "../cart/cartContext";
import CartSummary from "../cart/cart";
import CartModal from "../cart/cartModal";
// import { CartProvider } from "./components/client/cart/cartContext";

const Menu = () => {
  const [menuData, setMenuData] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { cart, addToCart } = useCart();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryId = searchParams.get("category");
  const fullUrl = `http://localhost:8000/storage/`;

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = categoryId
          ? await getMenuList(categoryId)
          : await getAllDishes();

        setMenuData(Array.isArray(data.data) ? data.data : []);
      } catch (e) {
        console.error("Lỗi lấy menu:", e);
        setMenuData([]);
      }
    };
    fetchMenu();
  }, [categoryId]);

  const handleAdd = (item) => {
    addToCart(item);
  };

  const handleShowDetail = async (id) => {
    try {
      const res = await getDishDetail(id);
setSelectedDish(res.data?.dish || null);
      setShowDetail(true);
    } catch (e) {
      console.error("Lỗi khi lấy chi tiết món:", e);
      setSelectedDish(null);
      setShowDetail(false);
    }
  };

  return (
    <div className="td-menu">
      <NavbarCategory />

      <div className="menuList">
        <div className="widthCT">
          {/* Tạm tính nổi bên phải */}
          <CartSummary onClick={() => setIsModalOpen(true)} />

          <div className="menuBox">
            <h2 className="title-menu">Menu</h2>
            <ul className="list-food-menu">
              {menuData.length > 0 ? (
                menuData.map((item) => (
                  <li key={item.id}>
                    <div className="food-menu">
                      {/* Click ảnh mở popup */}
                      <a
                        href="#"
                        className="thumb"
                        onClick={(e) => {
                          e.preventDefault();
                          handleShowDetail(item.id);
                        }}
                      >
                        <img
                          src={`${fullUrl}${item.image_url}`}
                          alt={item.name}
                        />
                      </a>

                      <div className="info-box">
                        {/* Click tên món mở popup */}
                        <a
                          href="#"
                          className="title-food"
                          onClick={(e) => {
                            e.preventDefault();
                            handleShowDetail(item.id);
                          }}
                        >
                          {item.name || item.title || "Tên món đang cập nhật"}
                        </a>

                        <div className="price-food">
                          {item.selling_price
                            ? item.selling_price.toLocaleString() + "₫"
                            : item.price}
                        </div>

                        <div className="funcsBox">
                          <button
                            className="add-to-card"
                            onClick={() => handleAdd(item)}
                          >
                            <img src={plush} alt="" />
                            <span className="txt">Đặt</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li>Không có dữ liệu món ăn.</li>
              )}
            </ul>
          </div>

          {/* Popup chi tiết món ăn */}
          {showDetail && selectedDish && (
  <DishDetailPopsup
    isOpen={showDetail}
    onClose={() => setShowDetail(false)}
    dish={selectedDish}
  />
)}

          {/* Popup giỏ hàng */}
          {isModalOpen && <CartModal onClose={() => setIsModalOpen(false)} />}
        </div>
      </div>
    </div>
  );
};

export default Menu;
