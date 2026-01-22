import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Homepage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import SignUp from "./pages/SignUp";
import PublicLayout from "./layouts/PublicLayout";
const App = () => {

  return (
    <BrowserRouter>
    <Navbar />
      <Routes>
        <Route  path="/" element={<Home />} />
        <Route element={  <PublicLayout/> }>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
export default App;
