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
        <GoogleOAuthProvider clientId="860063088948-9dalgkd113he6c4dhjkfd8qo11vankv6.apps.googleusercontent.com">
      <App />
      </GoogleOAuthProvider>
      </WebSocketProvider>
      <ToastContainer autoClose={1000} />
    </Provider>
);
