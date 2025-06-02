import React, { useEffect, useState, useRef } from "react";
import config from "../config";
import { CiViewList } from "react-icons/ci";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";

const SidebarCanvas = ({ currentCanvasIndex, setCurrentCanvasIndex }) => {
  const [canvases, setCanvases] = useState([]);
  const [menuVisibleIndex, setMenuVisibleIndex] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/kelola-dashboard/project/1/canvases`)
      .then((res) => {
        if (res.data.success) {
          setCanvases(res.data.canvases);
        } else {
          console.error("Gagal mengambil daftar canvas");
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  }, []);

  const handleRename = (index) => {
    const newName = prompt("Masukkan nama baru untuk kanvas ini:");
    if (newName) {
      const updatedCanvases = [...canvases];
      updatedCanvases[index].name = newName;
      setCanvases(updatedCanvases);
      setMenuVisibleIndex(null);
    }
  };

  const handleDelete = (index) => {
    if (window.confirm("Yakin ingin menghapus kanvas ini?")) {
      const updated = canvases.filter((_, i) => i !== index);
      setCanvases(updated);
      setMenuVisibleIndex(null);
      if (currentCanvasIndex === index) {
        setCurrentCanvasIndex(0);
      }
    }
  };

  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setMenuVisibleIndex(null);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div id="sidebar-canvas" className="sidebar" style={{ position: "relative" }}>
      <div className="sub-title">
        <CiViewList size={48} className="text-muted" />
        <span className="sub-text">Daftar Canvas</span>
      </div>
      <hr className="full-line" />

      {canvases.length > 0 ? (
        <div className="canvas-list" style={{ padding: "10px" }}>
          {canvases.map((canvas, index) => (
            <div
              key={index}
              className={`canvas-item d-flex justify-content-between align-items-center ${
                index === currentCanvasIndex ? "active" : ""
              }`}
              style={{
                cursor: "pointer",
                fontSize: "1.1rem",
                padding: "12px 16px",
                backgroundColor: index === currentCanvasIndex ? "#007bff" : "#fff",
                color: index === currentCanvasIndex ? "#fff" : "#333",
                fontWeight: index === currentCanvasIndex ? "bold" : "normal",
                border: "1px solid #dee2e6",
                borderRadius: "6px",
                marginBottom: "6px",
                position: "relative",
                zIndex: 10, // Set zIndex to make sure it's clickable
              }}
              onClick={() => {
                if (menuVisibleIndex === null) {
                  setCurrentCanvasIndex(index);
                  localStorage.setItem("currentCanvasIndex", index);
                }
              }}
            >
              <span>{canvas.name || `Kanvas ${index + 1}`}</span>

              {/* Three Dots Icon */}
              <span
                onClick={(e) => {
                  e.stopPropagation(); // Prevent list item click
                  setMenuVisibleIndex(menuVisibleIndex === index ? null : index);
                }}
                style={{
                  fontSize: "18px",
                  color: index === currentCanvasIndex ? "#fff" : "#666",
                  cursor: "pointer",
                  zIndex: 100, // Ensure icon is above the item
                  backgroundColor: "#f0f0f0", // Debugging: background color
                  padding: "5px", // Debugging: padding for better visibility
                  position: "relative", // Ensure the icon has a correct position
                }}
              >
                <BsThreeDotsVertical />
              </span>

              {/* Popup Menu */}
              {menuVisibleIndex === index && (
                <div
                  ref={menuRef}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    right: "10px",
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    padding: "5px 0",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    zIndex: 9999, // Ensure the dropdown is above other content
                    width: "150px",
                  }}
                  onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                >
                  <div
                    onClick={() => handleRename(index)}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      color: "#333",
                      fontSize: "14px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    Ganti Nama
                  </div>
                  <div
                    onClick={() => handleDelete(index)}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      color: "#dc3545",
                      fontSize: "14px",
                    }}
                  >
                    Hapus Kanvas
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted">Tidak ada kanvas ditemukan.</p>
      )}
    </div>
  );
};

export default SidebarCanvas;
