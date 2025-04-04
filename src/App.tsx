import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Homepage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import SignUp from "./pages/SignUp";
const App = () => {

  return (
    <BrowserRouter>
    <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
