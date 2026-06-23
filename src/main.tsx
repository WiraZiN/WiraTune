import React from "react";
import ReactDOM from "react-dom/client";
import "./App.css";
import { Layout } from "./layout/layout";

const App: React.FC = () => {

  return (
      <Layout />
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
