import React, { useState } from "react";
import Header from "./header/header";
import Footer from "./footer/footer";
import BookingPopup from "./header/BookingPopup";

const ClientLayout = ({ children }) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleOpenBooking = () => {
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer onOpenBooking={handleOpenBooking} />
      <BookingPopup isOpen={isBookingOpen} onClose={handleCloseBooking} />
    </>
  );
};

export default ClientLayout;
