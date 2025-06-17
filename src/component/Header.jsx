import React, { useState, useEffect } from "react";
import { AiOutlineDatabase, AiOutlinePieChart } from "react-icons/ai";
import { FaPlus } from "react-icons/fa";
import { TbSql } from "react-icons/tb";
import logo from "../assets/img/Logo TBI.png";
import config from "../config";
import axios from "axios";

const Header = ({ currentCanvasIndex, setCurrentCanvasIndex, setCanvases, canvases, currentCanvasId, setCurrentCanvasId,  totalCanvasCount, setTotalCanvasCount }) => {
  const [totalCanvases, setTotalCanvases] = useState(0);

  useEffect(() => {
    const savedIndex = localStorage.getItem("currentCanvasIndex");
    const savedCanvasId = localStorage.getItem("currentCanvasId");
    
    if (savedIndex !== null && typeof setCurrentCanvasIndex === 'function') {
      setCurrentCanvasIndex(parseInt(savedIndex));
    }
    
    if (savedCanvasId !== null && typeof setCurrentCanvasId === 'function') {
      setCurrentCanvasId(parseInt(savedCanvasId));
    }

    axios
      .get(`${config.API_BASE_URL}/api/kelola-dashboard/project/1/canvases`)
      .then((response) => {
        if (response.data.success) {
          // Filter canvases where is_deleted is false
          const activeCanvases = response.data.canvases;
          setCanvases(activeCanvases);
          setTotalCanvasCount(activeCanvases.length); // Update the total canvases count

          // Log canvas index and id_canvas
          activeCanvases.forEach((canvas, index) => {
            console.log(`Canvas Index: ${index}, Canvas ID: ${canvas.id}`);
          });
        } else {
          console.error("Failed to fetch canvases:", response.data.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching canvases:", error);
      });
  }, [setCanvases, setCurrentCanvasIndex, setCurrentCanvasId, setTotalCanvasCount]);

  const goToNextCanvas = () => {
  const newIndex = currentCanvasIndex + 1;
  if (newIndex < canvases.length && canvases[newIndex]?.id) {
    const newCanvasId = canvases[newIndex].id;
    setCurrentCanvasIndex(newIndex);
    setCurrentCanvasId(newCanvasId);
    localStorage.setItem("currentCanvasIndex", newIndex);
    localStorage.setItem("currentCanvasId", newCanvasId);
    console.log("Canvas Index: ", newIndex);
    console.log("Canvas ID: ", newCanvasId);
  } else {
    console.warn("Next canvas not ready or undefined:", canvases[newIndex]);
  }
};
const goToPreviousCanvas = () => {
  if (currentCanvasIndex > 0 && canvases.length > 0) {
    const newIndex = currentCanvasIndex - 1;
    const newCanvasId = canvases[newIndex].id;

    setCurrentCanvasIndex(newIndex);
    setCurrentCanvasId(newCanvasId);

    localStorage.setItem("currentCanvasIndex", newIndex);
    localStorage.setItem("currentCanvasId", newCanvasId);

    console.log("Canvas Index: ", newIndex);
    console.log("Canvas ID: ", newCanvasId);
  }
};

  return (
    <header className="header fixed-top d-flex align-items-center p-3 bg-white shadow">
      <div className="logo me-3">
        <img src={logo} alt="Logo" width={10} height={10} />
      </div>
      <div className="d-flex flex-column">
        <span className="fw-bold">Tools Dasbor Interaktif</span>
        <div className="d-flex justify-content-center align-items-center text-muted" style={{ cursor: 'pointer' }}>
          <span
            className="cursor-pointer"
            onClick={goToPreviousCanvas}
            style={{ padding: "0 10px", fontSize: "20px" }}
          >
            &#8592;
          </span>
          <span id="menu-canvas">
            Kanvas {currentCanvasIndex + 1} dari {totalCanvasCount}
          </span>
          <span
            className="cursor-pointer"
            onClick={goToNextCanvas}
            style={{ padding: "0 10px", fontSize: "20px" }}
          >
            &#8594;
          </span>
          <span className="mx-2">|</span>

          <span id="menu-data" className="cursor-pointer d-flex align-items-center">
            <AiOutlineDatabase className="me-1" />
            Pilih Data
          </span>

          <span className="mx-2">|</span>

          <span id="menu-visualisasi" className="cursor-pointer d-flex align-items-center">
            <AiOutlinePieChart className="me-1" />
            Konfigurasi
          </span>

          <span className="mx-2">|</span>

          <span id="menu-query" className="cursor-pointer d-flex align-items-center">
            <TbSql className="me-1 mt-1" />
            Query
          </span>

          <span className="mx-2">|</span>
          
          <span id="menu-tambah-datasource" className="cursor-pointer d-flex align-items-center">
            <FaPlus className="me-1" />
            Tambah Datasource
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;