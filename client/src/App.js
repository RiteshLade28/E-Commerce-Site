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
import Store from "./components/Auth/Store";
import Layout from "./components/Layout";

function App() {
  const location = useLocation();

  const isLoginOrSignupPage =
    location.pathname === "/login" || location.pathname === "/signup";
  const shouldShowNavBarAndFooter = !isLoginOrSignupPage;

  return (
    <Store>
      {shouldShowNavBarAndFooter && <NavBar />}

      <Routes>
        <Route element={<Layout component={Home } />} path="/" />
        <Route element={<Layout component={CartPage} />} path="/cart" />
        <Route element={<Layout component={ProductDesc} />} path="/product/:productId"/>
        <Route element={<SignUp />} path="/signup" />
        <Route element={<Login />} path="/login" />
      </Routes>

      {shouldShowNavBarAndFooter && <Footer />}
    </Store>
  );
}

export default App;
