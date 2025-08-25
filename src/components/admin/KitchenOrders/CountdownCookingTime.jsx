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
      // Yêu cầu: nếu khi đang chế biến đã quá hạn rồi chuyển sang hoàn thành,
      // thì hiển thị: thời gian = thời gian quá hạn tại thời điểm hoàn thành + cooking_time
      const cookingMin = Number(cookingTime) || 0;
      const start = new Date(receivedAt).getTime();
      const completed = new Date(completedAt).getTime();
      const totalMs = cookingMin * 60 * 1000;
      const overdueMs = Math.max(0, completed - (start + totalMs));
      const overdueMin = Math.floor(overdueMs / 1000 / 60);
      const totalDisplayMin = cookingMin + overdueMin;
      content = `Thời gian chế biến: ${totalDisplayMin} phút`;
    } else {
      // Không có completedAt: hiển thị thời gian dự kiến
      const cookingMin = Number(cookingTime) || 0;
      content = `Thời gian chế biến: ${cookingMin} phút`;
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

  // Logic đếm ngược khi chưa ready (dựa trên `remaining` để vừa hiển thị vừa kích re-render)
  const remainMs = remaining * 1000; // có thể âm nếu đã quá hạn

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
