import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "./components/navbar";
import Home from "./components/Home/home";
import Footer from "./components/Footer/footer.js";
import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import CartPage from "./components/Cart/Cart";

// toast.configure();
function App() {
  return (
    <div>
      <NavBar />
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<CartPage />} path="/cart" />
      </Routes>
      <hr />
      <Footer />
    </div>
  );
}

export default App;
