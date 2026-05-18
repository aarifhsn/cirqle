import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import App from "./App.jsx";
import { CirclesProvider } from "./context/CirclesContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./index.css";
import AuthProvider from "./providers/AuthProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <CirclesProvider>
                        <App />
                        <ToastContainer />
                    </CirclesProvider>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    </React.StrictMode>,
);
