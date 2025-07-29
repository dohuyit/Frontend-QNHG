import React, { useEffect, useState } from "react";
import "./inforPage.scss";
import { getCategories } from "@services/admin/categoryService";

export default function InforPage({ category = "menu" }) {
  console.log(category);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
      // Gọi API với parent_id: null và name (tên danh mục cha)
      const params = { parent_id: null, name: category };
      const res = await getCategories(params);
      const items = res.data?.data?.items || [];
      setInfo(items[0] || null); // Lấy item đầu tiên (nếu có)
    } catch {
      setInfo(null);
    } finally {
      setLoading(false);
    }
  };
  fetchCategory();
}, [category]);

  if (loading) return <div className="header-content-infor"><span>Đang tải...</span></div>;
  if (!info) return <div className="header-content-infor"><span>Không tìm thấy thông tin danh mục</span></div>;

  return (
    <div className="header-content-infor-wrapper">
      <div className="container-main">
        <div className="header-content-infor">
          <h1 className="infor-title">{info.name}</h1>
          <p className="infor-desc">{info.description}</p>
        </div>
      </div>
    </div>
  );
}