import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "./components/navbar";
import Home from "./components/Home/home";
import Footer from "./components/Footer/footer.js";
import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import CartPage from "./components/Cart/Cart";
import ProductDesc from "./components/Product/ProductDesc";
import SignUp from "./components/Auth/Signup";
import Login from "./components/Auth/Login";
import Store from "./components/BuyNow/Store";
import Layout from "./components/Layout";
import BuyNow from "./components/BuyNow/BuyNow";
import Orders from "./components/Orders/Orders";

function App() {
  const location = useLocation();

  const isLoginOrSignupPage =
    location.pathname === "/login" || location.pathname === "/signup";
  const shouldShowNavBarAndFooter = !isLoginOrSignupPage;

  return (
    <Store>
      {shouldShowNavBarAndFooter && <NavBar />}

      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<Layout component={CartPage} />} path="/cart" />
        <Route
          element={<Layout component={BuyNow} />}
          path="/buyNow/:productId"
        />
        <Route element={<Layout component={BuyNow} />} path="/buyNow/cart" />
        <Route element={<Layout component={Orders} />} path="/orders" />
        {/* <Route path="/profile" /> */}
        <Route element={<ProductDesc />} path="/product/:productId" />
        <Route element={<SignUp />} path="/signup" />
        <Route element={<Login />} path="/login" />
      </Routes>

      {shouldShowNavBarAndFooter && <Footer />}
    </Store>
  );
}

export default App;
