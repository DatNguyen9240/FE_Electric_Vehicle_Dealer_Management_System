import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";
import { UiProvider } from "./contexts/UiContext";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <UiProvider>
        <App />
      </UiProvider>
    </BrowserRouter>
  </StrictMode>
);
