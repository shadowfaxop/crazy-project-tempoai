import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App"; // assumes App renders MainLayout
import GitTestPage from "./pages/GitTestPage";

import "./index.css";
import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <div className="w-full h-full">
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/git-test" element={<GitTestPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  </React.StrictMode>,
);
