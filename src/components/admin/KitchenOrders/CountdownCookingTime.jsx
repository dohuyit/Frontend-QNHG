import React, { useEffect, useState } from "react";

function CountdownCookingTime({ receivedAt, cookingTime }) {
    const [remaining, setRemaining] = useState(0);

    useEffect(() => {
        function calcRemaining() {
            if (!receivedAt || !cookingTime) return 0;
            const start = new Date(receivedAt).getTime();
            const now = new Date().getTime();
            const totalMs = cookingTime * 60 * 1000;
            const remainMs = start + totalMs - now;
            return Math.floor(remainMs / 1000); // Cho phép giá trị âm cả khi quá giờ
        }
        setRemaining(calcRemaining());
        const timer = setInterval(() => {
            setRemaining(calcRemaining());
        }, 1000);
        return () => clearInterval(timer);
    }, [receivedAt, cookingTime]);

    if (!cookingTime || !receivedAt) return null;
    // Tính toán thời gian còn lại hoặc quá hạn
    const start = new Date(receivedAt).getTime();
    const now = new Date().getTime();
    const totalMs = cookingTime * 60 * 1000;
    const remainMs = start + totalMs - now;
    let content = '';
    let badgeClass = '';
    if (remainMs >= 0) {
        // Đếm ngược bình thường
        const min = Math.floor(remainMs / 1000 / 60);
        const sec = Math.floor((remainMs / 1000) % 60);
        content = `Còn lại: ${min}:${sec.toString().padStart(2, '0')} phút`;
        badgeClass = 'badge rounded-pill bg-success';
    } else {
        // Quá giờ: số phút tăng dần
        const overMs = Math.abs(remainMs);
        const min = Math.floor(overMs / 1000 / 60);
        const sec = Math.floor((overMs / 1000) % 60);
        content = `Quá hạn: ${min}:${sec.toString().padStart(2, '0')} phút`;
        badgeClass = 'badge rounded-pill bg-danger';
    }
    return (
        <span
            className={badgeClass}
            style={{ fontSize: 13, fontWeight: 600,verticalAlign: 'middle', letterSpacing: 0.5}}
        >
            {content}
        </span>
    );
}

export default CountdownCookingTime;
    