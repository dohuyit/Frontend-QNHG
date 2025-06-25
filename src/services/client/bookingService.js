// services/client/bookingService.js
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


export const createBooking = async (bookingData) => {
  try {
    const response = await axiosInstance.post("/reservations/create", bookingData);
    return response.data;
  } catch (error) {
    console.error("Lỗi tạo đơn đặt bàn:", error.response?.data || error.message);
    throw error;
  }
  // nếu có thêm phần quản lí đơn đặt thì sẽ thêm nhé:))
};
