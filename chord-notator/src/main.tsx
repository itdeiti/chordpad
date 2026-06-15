import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "features/print";
import { App } from "app/app";
import { HapticsProvider } from "features/haptics";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HapticsProvider>
      <App />
    </HapticsProvider>
  </React.StrictMode>,
);
