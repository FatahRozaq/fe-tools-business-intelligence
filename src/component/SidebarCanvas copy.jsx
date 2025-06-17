import React, { useState, useEffect, useRef } from "react";
import config from "../config";
import { CiViewList } from "react-icons/ci";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import SubmitButton from "./Button/SubmitButton";

const SidebarCanvas = ({ currentCanvasIndex, setCurrentCanvasIndex, currentCanvasId, setCurrentCanvasId }) => {
  const [canvases, setCanvases] = useState([]);
  const [menuVisibleIndex, setMenuVisibleIndex] = useState(null);
  const [editIndex, setEditIndex] = useState(null); // Track the index of the canvas being edited
  const [newName, setNewName] = useState(""); // Track the new name input value
  const menuRef = useRef(null);
  const inputRef = useRef(null); // Reference to the input field for autofocus
  const [isAddingCanvas, setIsAddingCanvas] = useState(false); // Track if canvas is being added
  const [addingCanvas, setAddingCanvas] = useState(false); // To control the newly added canvas

  // Fetch canvases on component mount and after adding a new canvas
  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/kelola-dashboard/project/1/canvases`)
      .then((res) => {
        if (res.data.success) {
          const sortedCanvases = res.data.canvases.sort((a, b) => a.id - b.id);
          setCanvases(sortedCanvases);

          // If we are adding a canvas, maintain the current canvas index and id
          if (isAddingCanvas) {
            setCurrentCanvasId(sortedCanvases[sortedCanvases.length - 1].id);
            setCurrentCanvasIndex(sortedCanvases.length - 1);
            localStorage.setItem("currentCanvasId", sortedCanvases[sortedCanvases.length - 1].id);
            localStorage.setItem("currentCanvasIndex", sortedCanvases.length - 1);
            setIsAddingCanvas(false); // Reset adding canvas state
          }
        } else {
          console.error("Gagal mengambil daftar canvas");
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  }, [isAddingCanvas, setCurrentCanvasIndex, setCurrentCanvasId]);

  const handleCanvasClick = (canvas, index) => {
    if (menuVisibleIndex === null) {
      setCurrentCanvasIndex(index);
      setCurrentCanvasId(canvas.id);
      localStorage.setItem("currentCanvasIndex", index);
      localStorage.setItem("currentCanvasId", canvas.id);
      console.log("Canvas selected:", { index, id: canvas.id });
    }
  };

  const handleRename = (index) => {
    setEditIndex(index);
    setNewName(canvases[index].name);
  };

  const handleSaveName = (index) => {
    if (newName.trim() === "") return;
    axios
      .put(`${config.API_BASE_URL}/api/kelola-dashboard/canvas/update/${canvases[index].id}`, {
        name: newName,
      })
      .then((res) => {
        if (res.data.success) {
          const updatedCanvases = [...canvases];
          updatedCanvases[index].name = newName;
          setCanvases(updatedCanvases);
          setEditIndex(null);
          setNewName("");
        } else {
          console.error("Failed to update the canvas name:", res.data.message);
        }
      })
      .catch((err) => {
        console.error("Error updating canvas name:", err);
      });
  };

  const handleDelete = (index) => {
  const canvasId = canvases[index].id;
  if (window.confirm("Yakin ingin menghapus kanvas ini?")) {
    axios
      .put(`${config.API_BASE_URL}/api/kelola-dashboard/canvas/delete/${canvasId}`)
      .then((res) => {
        if (res.data.success) {
          // Remove the deleted canvas from the state
          const updatedCanvases = canvases.filter((_, i) => i !== index);
          setCanvases(updatedCanvases);

          // Set the previous canvas index as the current index
          let newIndex = currentCanvasIndex;
          if (updatedCanvases.length > 0) {
            // If there are canvases remaining, select the previous canvas
            if (currentCanvasIndex === index) {
              newIndex = currentCanvasIndex > 0 ? currentCanvasIndex - 1 : 0;
            }
          } else {
            // If no canvases remain, set to -1 or null
            newIndex = -1;
          }

          // Update state and localStorage with the new index and ID
          setCurrentCanvasIndex(newIndex);
          setCurrentCanvasId(updatedCanvases.length > 0 ? updatedCanvases[newIndex].id : null);
          localStorage.setItem("currentCanvasIndex", newIndex);
          localStorage.setItem("currentCanvasId", updatedCanvases.length > 0 ? updatedCanvases[newIndex].id : null);

          // Reset menu visibility
          setMenuVisibleIndex(null);

          // Log the canvas index and id_canvas after deletion
          console.log(`Canvas Index: ${newIndex}, Canvas ID: ${updatedCanvases.length > 0 ? updatedCanvases[newIndex].id : 'None'}`);
        } else {
          console.error("Failed to delete the canvas:", res.data.message);
        }
      })
      .catch((err) => {
        console.error("Error deleting canvas:", err);
      });
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

  useEffect(() => {
    if (editIndex !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editIndex]);

  const handleAddCanvas = () => {
    setAddingCanvas(true);
    setNewName(""); // Clear name input
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value); // Update the name input
  };

  const saveNewCanvas = () => {
  if (newName.trim() === "") return;

  axios
    .post(`${config.API_BASE_URL}/api/kelola-dashboard/canvas`, {
      name: newName,
      id_project: 1,
      created_by: "admin",
      created_time: new Date().toISOString(),
      is_deleted: false,
    })
    .then((res) => {
      if (res.data.success) {
        const newCanvas = res.data.canvas;
        const newCanvases = [...canvases, newCanvas];
        setCanvases(newCanvases);

        // Set the newly created canvas as current
        setIsAddingCanvas(true); // Trigger the re-fetch with the current canvas data
        setNewName(""); // Clear the name input

        // Set the current canvas index and ID
        const newIndex = newCanvases.length - 1;
        setCurrentCanvasIndex(newIndex);
        setCurrentCanvasId(newCanvas.id);
        localStorage.setItem("currentCanvasIndex", newIndex);
        localStorage.setItem("currentCanvasId", newCanvas.id);

        // Close the "add canvas" input
        setAddingCanvas(false); // Hide the input after adding

        console.log(`Canvas Index: ${newIndex}, Canvas ID: ${newCanvas.id}`);
      } else {
        console.error("Failed to add the new canvas:", res.data.message);
      }
    })
    .catch((err) => {
      console.error("Error adding new canvas:", err);
    });
};


  const cancelAddCanvas = () => {
    setAddingCanvas(false);
    setNewName(""); // Reset the input field
  };

  return (
    <div id="sidebar-canvas" className="sidebar-2" style={{ position: "relative", overflow: "visible" }}>
      <div className="sub-title">
        <CiViewList size={48} className="text-muted" />
        <span className="sub-text">Daftar Canvas</span>
      </div>
      <hr className="full-line" />

      {canvases.length > 0 ? (
        <div className="canvas-list" style={{ padding: "0px" }}>
          {canvases.map((canvas, index) => (
            <div
              key={canvas.id} // Use canvas id as the unique key
              className={`canvas-item d-flex justify-content-between align-items-center ${
                index === currentCanvasIndex ? "active" : ""
              }`}
              style={{
                cursor: "pointer",
                fontSize: "16px",
                padding: "12px 16px",
                backgroundColor: index === currentCanvasIndex ? "#007bff" : "#fff",
                color: index === currentCanvasIndex ? "#fff" : "#333",
                fontWeight: index === currentCanvasIndex ? "bold" : "normal",
                border: "1px solid #dee2e6",
                borderRadius: "6px",
                marginBottom: "6px",
                position: "relative",
              }}
              onClick={() => handleCanvasClick(canvas, index)}
            >
              {editIndex === index ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => handleSaveName(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveName(index);
                    }
                  }}
                  style={{
                    fontSize: "1.1rem",
                    border: "none",
                    outline: "none",
                    width: "calc(100% - 40px)",
                  }}
                  autoFocus
                />
              ) : (
                <span>{canvas.name || `Kanvas ${index + 1}`}</span>
              )}

              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuVisibleIndex(menuVisibleIndex === index ? null : index);
                }}
                style={{
                  fontSize: "18px",
                  color: index === currentCanvasIndex ? "#fff" : "#666",
                  cursor: "pointer",
                  zIndex: 1000,
                  padding: "5px",
                  position: "relative",
                }}
              >
                <BsThreeDotsVertical />
              </span>
              
              {menuVisibleIndex === index && (
                <div
                  ref={menuRef}
                  style={{
                    position: "absolute",
                    top: "calc(50% + 4px)",
                    left: "90%",
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    padding: "5px 0",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    zIndex: 9999,
                    width: "150px",
                    transform: "translateX(0)",
                  }}
                  onClick={(e) => e.stopPropagation()}
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

      {/* Add Canvas Input and Button Below Canvas List */}
      <div className="d-flex justify-content-center mt-3">
        {!addingCanvas ? (
          <SubmitButton onClick={handleAddCanvas} text="Tambah Canvas" />
        ) : (
          <div className="d-flex flex-column">
            <input
              type="text"
              value={newName}
              onChange={handleNameChange}
              placeholder="Masukkan nama canvas"
              autoFocus
              style={{ fontSize: "1rem", padding: "8px 12px", width: "100%" }}
            />
            <SubmitButton onClick={saveNewCanvas} text="Simpan Canvas" />
            <button
              onClick={cancelAddCanvas}
              style={{
                marginTop: "8px",
                padding: "8px 12px",
                fontSize: "1rem",
                backgroundColor: "#f0f0f0",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                color: "#666",
              }}
            >
              Batal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarCanvas;
