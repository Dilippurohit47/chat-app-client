import { GoogleOAuthProvider } from '@react-oauth/google';
import { createRoot } from "react-dom/client";
import "./index.css";
import { ToastContainer } from 'react-toastify';
import App from "./App.tsx";
import { Provider } from "react-redux";
import {store} from "./store.tsx";
import { WebSocketProvider } from "./context/webSocket.tsx";
createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
      <WebSocketProvider>
        <GoogleOAuthProvider clientId={`${import.meta.env.VITE_GOOGLE_CLIENT_ID}`}>
      <App />
      </GoogleOAuthProvider>
      </WebSocketProvider>
      <ToastContainer autoClose={1000} />
    </Provider>
);
