import React, { useEffect, useState } from "react";

function CountdownCookingTime({
  receivedAt,
  cookingTime,
  status,
  completedAt,
}) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    function calcRemaining() {
      if (!receivedAt || !cookingTime) return 0;
      const start = new Date(receivedAt).getTime();
      const now = new Date().getTime();
      const totalMs = cookingTime * 60 * 1000;
      const remainMs = start + totalMs - now;
      return Math.floor(remainMs / 1000);
    }

    // Chỉ chạy timer khi chưa ready
    if (status !== "ready") {
      setRemaining(calcRemaining());
      const timer = setInterval(() => {
        setRemaining(calcRemaining());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [receivedAt, cookingTime, status]);

  if (!cookingTime || !receivedAt) return null;

  // Nếu trạng thái là "ready", hiển thị thời gian ready
  if (status === "ready") {
    let content = "";
    let badgeClass = "badge rounded-pill bg-primary";

    if (completedAt) {
      // Hiển thị thời gian ready thực tế
      const start = new Date(receivedAt).getTime();
      const completed = new Date(completedAt).getTime();
      const actualTimeMs = completed - start;
      const actualMin = Math.floor(actualTimeMs / 1000 / 60);
      const actualSec = Math.floor((actualTimeMs / 1000) % 60);
      content = `ready: ${actualMin}:${actualSec
        .toString()
        .padStart(2, "0")} phút`;
    } else {
      // Hiển thị tổng thời gian chế biến dự kiến
      content = `ready: ${cookingTime} phút`;
    }

    return (
      <span
        className={badgeClass}
        style={{
          fontSize: 13,
          fontWeight: 600,
          verticalAlign: "middle",
          letterSpacing: 0.5,
        }}
      >
        {content}
      </span>
    );
  }

  // Logic đếm ngược như cũ khi chưa ready
  const start = new Date(receivedAt).getTime();
  const now = new Date().getTime();
  const totalMs = cookingTime * 60 * 1000;
  const remainMs = start + totalMs - now;

  let content = "";
  let badgeClass = "";

  if (remainMs >= 0) {
    // Đếm ngược bình thường
    const min = Math.floor(remainMs / 1000 / 60);
    const sec = Math.floor((remainMs / 1000) % 60);
    content = `Còn lại: ${min}:${sec.toString().padStart(2, "0")} phút`;
    badgeClass = "badge rounded-pill bg-success";
  } else {
    // Quá giờ: số phút tăng dần
    const overMs = Math.abs(remainMs);
    const min = Math.floor(overMs / 1000 / 60);
    const sec = Math.floor((overMs / 1000) % 60);
    content = `Quá hạn: ${min}:${sec.toString().padStart(2, "0")} phút`;
    badgeClass = "badge rounded-pill bg-danger";
  }

  return (
    <span
      className={badgeClass}
      style={{
        fontSize: 13,
        fontWeight: 600,
        verticalAlign: "middle",
        letterSpacing: 0.5,
      }}
    >
      {content}
    </span>
  );
}

export default CountdownCookingTime;
