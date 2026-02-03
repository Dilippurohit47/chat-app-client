import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Homepage";
import Navbar from "./components/Navbar";
import PublicLayout from "./layouts/PublicLayout";
import LoginPage from "./features/auth/pages/LoginPage"
import SignUp from "./features/auth/pages/SignUp";
const App = () => {

  return (
    <BrowserRouter>
    <Navbar />
      <Routes>
        <Route  path="/" element={<Home />} />a
        <Route element={  <PublicLayout/> }>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
export default App;
