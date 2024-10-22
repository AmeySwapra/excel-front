import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { CssBaseline, GlobalStyles } from "@mui/material";

import axios from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

axios.defaults.baseURL = "https://excel-backend-1-8djc.onrender.com";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <CssBaseline />

      <GlobalStyles
        styles={{
          body: {
            backgroundImage:
              "radial-gradient(rgba(0,0,0,0.5) 1px, transparent 0)",
            backgroundSize: "25px 25px",
            "@media (max-width: 600px)": {
              backgroundSize: "10px 10px",  
            },
            "@media (min-width: 601px) and (max-width: 960px)": {
              backgroundSize: "15px 15px",  
            },
            "@media (min-width: 961px)": {
              backgroundSize: "25px 25px",  
            },
            margin: 0,
            padding: 0,
            boxSizing: "border-box",
            fontSize: "16px", 
            "@media (max-width: 600px)": {
              fontSize: "14px",  
            },
            "@media (min-width: 961px)": {
              fontSize: "18px",  
            },
          },
        }}
      />

      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
