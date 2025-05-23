import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ToastContainer } from 'react-toastify';
import App from "./App.tsx";
import { Provider } from "react-redux";
import {store} from "./store.tsx";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <ToastContainer autoClose={1000} />
    </Provider>
  </StrictMode>
);
