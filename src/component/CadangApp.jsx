// App.jsx
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./assets/css/dashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "font-awesome/css/font-awesome.min.css";
import Header from "./component/Header";
import Sidebar from "./component/Sidebar";
import Canvas from "./component/Canvas";
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import VisualisasiChart from "./component/Visualiaze";

const requestPayload = {
  "tabel": "pendaftar",
  "dimensi": ["pendaftar.provinsi"],
  "metriks": ["pendaftar.id_pendaftar"],
  "filters": []
};

function App() {
  const [canvasData, setCanvasData] = useState([]);
  const [canvasQuery, setCanvasQuery] = useState([]);

  return (
    <>
      {/* {/* <Header />
      <div className="main-container">
        <Sidebar 
          setCanvasData={setCanvasData} 
          setCanvasQuery={setCanvasQuery} 
        /> */}
        {/* <Canvas 
          data={canvasData} 
          query={canvasQuery}  
        /> 
        {/* <VisualisasiChart requestPayload={requestPayload} /> */}
      {/* </div> */}
    </>
  );
}

export default App;
