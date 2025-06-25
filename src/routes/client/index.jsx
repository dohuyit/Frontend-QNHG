import Menu from "../../components/client/menu/menu";
import Endow from "../../components/client/endow-blog/endow";
import Detail from "../../components/client/detail-blog/detail";
import Header from "../../components/client/include/header/header";
// import Footer from "../../components/client/include/footer/footer";
import RegisterUserPage from "../../pages/client/auth/register";
import LoginUserPage from "../../pages/client/auth/login";
import BranchDetail from "../../components/client/BranchDetail/BranchDetail";
import Contact from "../../components/client/contact/Contact";
import Home from "../../components/client/home/home";
import SuccessfulReservation from "../../components/client/include/header/successful_reservation"


const clientRoutes = [
  {
    path: "/", 
    exact: true,
    component: <Home/>,
  },
  {
    path: "/menu-page",
    component: <Menu />,
  },
  {
    path: "/branch-page", // Trang chi tiết chi nhánh
    component: <BranchDetail />,
  },
  {
    path: "/contact-page", // Trang chi tiết chi nhánh
    component: <Contact />,
  },
  {
    path: "/endow-page", // Trang ưu đãi
    component: <Endow />,
  },
  {
    path: "/endow-page/detail/:slug",
    component: <Detail />,
  },
   {
    path: "/register-page",
    component: <RegisterUserPage/>,
  },
   {
    path: "/login-page",
    component: <LoginUserPage/>,
  },
   {
    path: "/reservation_success",
    component: <SuccessfulReservation/>,
  },
   
];

export { clientRoutes };
