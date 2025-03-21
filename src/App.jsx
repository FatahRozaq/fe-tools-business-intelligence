import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./assets/css/dashboard.css";
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap CSS
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./assets/css/dashboard.css";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css"; // DataTables CSS
import "font-awesome/css/font-awesome.min.css"; // FontAwesome
import Header from "./component/Header";
import Sidebar from "./component/Sidebar";
import Canvas from "./component/Canvas";

function App() {
  

  return (
    <>
      <Header />

      <div className="main-container">
        <Sidebar />
        <Canvas/>
      </div>
    </>
  );
}

export default App;
