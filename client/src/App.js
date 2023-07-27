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
import BeASeller from "./components/Auth/BeASeller";
import SellerLogin from "./components/Auth/SellerLogin";
import Dashboard from "./components/SellerDashboard/Dashboard";
import SellerNavbar from "./components/SellerDashboard/Navbar.js";
import Products from "./components/SellerDashboard/Products.js";
import SellerOrders from "./components/SellerDashboard/Orders.js";
import AddProduct from "./components/SellerDashboard/AddProduct";
import EditProduct from "./components/SellerDashboard/EditProduct";
import Profile from "./components/UserProfile/Profile";
import SellerProfile from "./components/SellerProfile/SellerProfile";

function App() {
  const location = useLocation();

  const isLoginOrSignupPage =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/beASeller" ||
    location.pathname === "/sellerLogin" ||
    location.pathname === "/sellerSignup" ||
    location.pathname.startsWith("/seller/");

  const shouldShowSellerNavbar = location.pathname.startsWith("/seller/");
  const shouldShowNavBarAndFooter = !isLoginOrSignupPage;

  return (
    <Store>
      {shouldShowSellerNavbar && <SellerNavbar />}
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
        <Route element={<BeASeller />} path="/sellerSignup" />
        <Route element={<SellerLogin />} path="/sellerLogin" />
        <Route
          element={<Layout component={Dashboard} />}
          path="/seller/dashboard"
        />
        <Route element={<Products />} path="/seller/products" />
        <Route element={<SellerOrders />} path="/seller/orders" />
        <Route element={<AddProduct />} path="/seller/addProduct" />
        <Route
          element={<EditProduct />}
          path="/seller/editProduct/:productId"
        />
        <Route element={<Profile />} path="/profile" />
        <Route element={<SellerProfile />} path="/seller/account" />
      </Routes>

      {shouldShowNavBarAndFooter && <Footer />}
    </Store>
  );
}

export default App;
