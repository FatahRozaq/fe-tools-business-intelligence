import React, { useState, useEffect } from "react";
import { AiOutlineDatabase, AiOutlinePieChart } from "react-icons/ai";
import { TbSql } from "react-icons/tb";
import logo from "../assets/img/Logo TBI.png";
import config from "../config";
import axios from "axios";

const Header = ({ currentCanvasIndex, setCurrentCanvasIndex, setCanvases, canvases, currentCanvasId, setCurrentCanvasId }) => {
  const [totalCanvases, setTotalCanvases] = useState(0);

  useEffect(() => {
    // Cek apakah ada currentCanvasIndex yang disimpan di localStorage
    const savedIndex = localStorage.getItem("currentCanvasIndex");
    const savedCanvasId = localStorage.getItem("currentCanvasId");
    
    if (savedIndex !== null && typeof setCurrentCanvasIndex === 'function') {
      setCurrentCanvasIndex(parseInt(savedIndex));
    }
    
    if (savedCanvasId !== null && typeof setCurrentCanvasId === 'function') {
      setCurrentCanvasId(parseInt(savedCanvasId));
    }

    // Fetch canvases from API
    axios
      .get(`${config.API_BASE_URL}/api/kelola-dashboard/project/1/canvases`)
      .then((response) => {
        if (response.data.success) {
          // Filter canvases where is_deleted is false
          const activeCanvases = response.data.canvases;
          setCanvases(activeCanvases);
          setTotalCanvases(activeCanvases.length); // Update the total canvases count

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
  }, [setCanvases, setCurrentCanvasIndex, setCurrentCanvasId]);

  // Fungsi untuk pindah ke canvas berikutnya
  const goToNextCanvas = () => {
    if (currentCanvasIndex < totalCanvases - 1 && canvases.length > 0) {
      const newIndex = currentCanvasIndex + 1;
      const newCanvasId = canvases[newIndex].id;
      
      setCurrentCanvasIndex(newIndex);
      setCurrentCanvasId(newCanvasId);
      
      localStorage.setItem("currentCanvasIndex", newIndex);
      localStorage.setItem("currentCanvasId", newCanvasId);
      
      // Log canvas index and id_canvas when moving to the next canvas
      console.log(`Canvas Index: ${newIndex}, Canvas ID: ${newCanvasId}`);
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
      
      // Log canvas index and id_canvas when moving to the previous canvas
      console.log(`Canvas Index: ${newIndex}, Canvas ID: ${newCanvasId}`);
    }
  };

  const handleDelete = (index) => {
    const canvasId = canvases[index].id;
    if (window.confirm("Yakin ingin menghapus kanvas ini?")) {
      // Call the API to mark canvas as deleted
      axios
        .patch(`${config.API_BASE_URL}/api/kelola-dashboard/canvas/${canvasId}`)
        .then((res) => {
          if (res.data.success) {
            // Remove the deleted canvas from the state
            const updatedCanvases = canvases.filter((_, i) => i !== index);
            setCanvases(updatedCanvases);
            setTotalCanvases(updatedCanvases.length); // Update the total canvases count
            
            // Adjust currentCanvasIndex and currentCanvasId if the deleted canvas was the current one
            if (currentCanvasIndex === index) {
              if (updatedCanvases.length === 0) {
                setCurrentCanvasIndex(0); // No canvases left, set to index 0
                setCurrentCanvasId(null); // No canvases left
                localStorage.removeItem("currentCanvasId");
              } else if (index === updatedCanvases.length) {
                const newIndex = index - 1;
                setCurrentCanvasIndex(newIndex); // If deleting the last canvas, go to the previous one
                setCurrentCanvasId(updatedCanvases[newIndex].id);
                localStorage.setItem("currentCanvasId", updatedCanvases[newIndex].id);
              } else {
                // If deleting in the middle, keep same index but update canvas ID
                setCurrentCanvasId(updatedCanvases[currentCanvasIndex].id);
                localStorage.setItem("currentCanvasId", updatedCanvases[currentCanvasIndex].id);
              }
            }

            localStorage.setItem("currentCanvasIndex", currentCanvasIndex); // Store the updated index
          } else {
            console.error("Failed to delete the canvas:", res.data.message);
          }
        })
        .catch((err) => {
          console.error("Error deleting canvas:", err);
        });
    }
  };

  return (
    <header className="header fixed-top d-flex align-items-center p-3 bg-white shadow">
      <div className="logo me-3">
        <img src={logo} alt="Logo" width={10} height={10} />
      </div>
      <div className="d-flex flex-column">
        <span className="fw-bold">Tools Business Intelligence</span>
        <div className="d-flex justify-content-center align-items-center text-muted" style={{ cursor: 'pointer' }}>
          <span
            className="cursor-pointer"
            onClick={goToPreviousCanvas}
            style={{ padding: "0 10px", fontSize: "20px" }}
          >
            &#8592;
          </span>
          <span id="menu-canvas">
            Kanvas {currentCanvasIndex + 1} dari {totalCanvases}
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
            Pilih Visualisasi
          </span>

          <span className="mx-2">|</span>

          <span id="menu-query" className="cursor-pointer d-flex align-items-center">
            <TbSql className="me-1 mt-1" />
            Query
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;