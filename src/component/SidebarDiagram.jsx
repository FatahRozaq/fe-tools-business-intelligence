import React, { useState, useEffect } from "react";
import column from "../assets/img/charts/column.png";
import line from "../assets/img/charts/lines.png";
import pie from "../assets/img/charts/pie.png";
import table from "../assets/img/charts/table-v2.png";
import donut from "../assets/img/charts/donut.png";
import { HiOutlineChartPie } from "react-icons/hi";
import { SketchPicker } from "react-color";

const SidebarDiagram = ({ onVisualizationTypeChange, onVisualizationConfigChange }) => {
  const visualizationOptions = [
    { type: "bar", label: "Batang", image: column },
    { type: "line", label: "Line", image: line },
    { type: "pie", label: "Pie", image: pie },
    { type: "donut", label: "Donut", image: donut },
    { type: "", label: "Tabel", image: table },
  ];

  const [colors, setColors] = useState(["#4CAF50", "#FF9800", "#2196F3"]);
  const [activePicker, setActivePicker] = useState(null);
  const [visualizationSettings, setVisualizationSettings] = useState({
    title: "",
    titleFontSize: 18,
    titleFontFamily: "Arial",
    fontSize: 14,
    fontFamily: "Arial",
    fontColor: "#000000",
    gridColor: "#E0E0E0",
    backgroundColor: "#ffffff",
    xAxisFontSize: 12,
    xAxisFontFamily: "Arial",
    yAxisFontSize: 12,
    yAxisFontFamily: "Arial",
    pattern: "solid", // default pattern Visualization
  });

  const handleColorChange = (index, newColor) => {
    const newColors = [...colors];
    newColors[index] = newColor.hex;
    setColors(newColors);
  };

  useEffect(() => {
    // Pass both colors and visualizationSettings to parent component
    onVisualizationConfigChange({ ...visualizationSettings, colors });
  }, [colors, visualizationSettings, onVisualizationConfigChange]);

  // Function to handle clicking outside the color picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activePicker !== null &&
        !event.target.closest(".color-picker-container")
      ) {
        setActivePicker(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activePicker]);

  return (
    <div
      id="sidebar-diagram"
      className="sidebar-2 text-sm text-blue-900"
      style={{
        height: "100vh",
        overflowY: "auto",
        scrollbarWidth: "thin",
        scrollbarColor: "#888 #f1f1f1",
      }}
    >
      <div className="sub-title">
        <HiOutlineChartPie size={48} className="text-muted" />
        <span className="sub-text">Diagram</span>
      </div>
      <hr className="full-line" />

      {/* Chart Type Selector */}
      <div className="mb-4">
        <label className="font-medium mb-2 block">Pilih Jenis Visualisasi:</label>
        <div
          className="card-row"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "space-around",
          }}
        >
          {visualizationOptions.map((visualization, index) => (
            <div
              key={index}
              onClick={() => onVisualizationTypeChange(visualization.type)}
              style={{
                width: "85px",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  backgroundColor: "#1E3A8A",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              >
                <img
                  src={visualization.image}
                  alt={`${visualization.label} Visualization`}
                  style={{
                    width: "60px",
                    height: "60px",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: "5px",
                  color: "#1E3A8A",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {visualization.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Improved Color Pickers - Horizontal Layout */}
      <div className="mb-5">
        <label className="font-medium block mb-2">Warna Visualization:</label>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "10px",
            alignItems: "flex-start",
          }}
        >
          {colors.map((color, index) => (
            <div
              key={index}
              className="color-picker-container relative"
              style={{ marginBottom: "15px" }}
            >
              <div
                onClick={() =>
                  setActivePicker(activePicker === index ? null : index)
                }
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: color,
                  border: "2px solid #ddd",
                  borderRadius: "6px",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
                title={`Color ${index + 1}: ${color}`}
              />
              {activePicker === index && (
                <div
                  className="absolute z-10"
                  style={{ top: "45px", left: "0" }}
                >
                  <div className="fixed z-50">
                    <SketchPicker
                      color={color}
                      onChange={(newColor) =>
                        handleColorChange(index, newColor)
                      }
                      disableAlpha={true}
                    />
                  </div>
                </div>
              )}
              <span className="block text-center mt-1 text-xs">{`${
                index + 1
              }`}</span>
            </div>
          ))}

          {/* Add color button */}
          {colors.length < 6 && (
            <div
              onClick={() => {
                // Add a new color
                const newColors = [...colors, "#666666"];
                setColors(newColors);
              }}
              style={{
                width: "40px",
                height: "40px",
                border: "2px dashed #aaa",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                color: "#666",
              }}
              title="Add color"
            >
              +
            </div>
          )}

          {/* Remove color button - only show if more than 1 color */}
          {colors.length > 1 && (
            <div
              onClick={() => {
                // Remove the last color
                const newColors = colors.slice(0, -1);
                setColors(newColors);
                // If active picker is the removed color, reset it
                if (activePicker === colors.length - 1) {
                  setActivePicker(null);
                }
              }}
              style={{
                width: "40px",
                height: "40px",
                border: "2px dashed #aaa",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                color: "#666",
              }}
              title="Remove color"
            >
              -
            </div>
          )}
        </div>
      </div>

      {/* Title Settings */}
      <div className="mb-4">
        <label className="font-medium block mb-1">Judul Visualization:</label>
        <input
          type="text"
          className="input w-full border p-2 rounded"
          value={visualizationSettings.title}
          onChange={(e) =>
            setVisualizationSettings({ ...visualizationSettings, title: e.target.value })
          }
        />
        <div className="flex gap-2 mt-2">
          <input
            type="number"
            className="input w-1/2 border p-2 rounded"
            placeholder="Ukuran (px)"
            value={visualizationSettings.titleFontSize}
            onChange={(e) =>
              setVisualizationSettings({
                ...visualizationSettings,
                titleFontSize: parseFloat(e.target.value),
              })
            }
          />
          <select
            className="input w-1/2 border p-2 rounded"
            value={visualizationSettings.titleFontFamily}
            onChange={(e) =>
              setVisualizationSettings({
                ...visualizationSettings,
                titleFontFamily: e.target.value,
              })
            }
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
            <option value="Georgia">Georgia</option>
          </select>
        </div>
      </div>

      {/* Legend Settings */}
      <div className="mb-4">
        <label className="font-medium block mb-1">Font Legend:</label>
        <div className="flex gap-2">
          <input
            type="number"
            className="input w-1/2 border p-2 rounded"
            placeholder="Ukuran (px)"
            value={visualizationSettings.fontSize}
            onChange={(e) =>
              setVisualizationSettings({
                ...visualizationSettings,
                fontSize: parseFloat(e.target.value),
              })
            }
          />
          <select
            className="input w-1/2 border p-2 rounded"
            value={visualizationSettings.fontFamily}
            onChange={(e) =>
              setVisualizationSettings({ ...visualizationSettings, fontFamily: e.target.value })
            }
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
            <option value="Georgia">Georgia</option>
          </select>
        </div>
      </div>

      {/* Font Color & Grid Color */}
      <div className="mb-4">
        <label className="font-medium block mb-1">Warna Font:</label>
        <div className="flex items-center">
          <input
            type="color"
            className="w-12 h-10 p-0 border cursor-pointer"
            value={visualizationSettings.fontColor}
            onChange={(e) =>
              setVisualizationSettings({ ...visualizationSettings, fontColor: e.target.value })
            }
          />
          <span className="ml-2">{visualizationSettings.fontColor}</span>
        </div>
      </div>

      <div className="mb-4">
        <label className="font-medium block mb-1">Warna Grid:</label>
        <div className="flex items-center">
          <input
            type="color"
            className="w-12 h-10 p-0 border cursor-pointer"
            value={visualizationSettings.gridColor}
            onChange={(e) =>
              setVisualizationSettings({ ...visualizationSettings, gridColor: e.target.value })
            }
          />
          <span className="ml-2">{visualizationSettings.gridColor}</span>
        </div>
      </div>

      {/* Axis Font Settings */}
      <div className="mb-4">
        <label className="font-medium block mb-1">X-Axis Font:</label>
        <div className="flex gap-2">
          <input
            type="number"
            className="input w-1/2 border p-2 rounded"
            value={visualizationSettings.xAxisFontSize}
            onChange={(e) =>
              setVisualizationSettings({
                ...visualizationSettings,
                xAxisFontSize: parseFloat(e.target.value),
              })
            }
          />
          <select
            className="input w-1/2 border p-2 rounded"
            value={visualizationSettings.xAxisFontFamily}
            onChange={(e) =>
              setVisualizationSettings({
                ...visualizationSettings,
                xAxisFontFamily: e.target.value,
              })
            }
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
            <option value="Georgia">Georgia</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="font-medium block mb-1">Y-Axis Font:</label>
        <div className="flex gap-2">
          <input
            type="number"
            className="input w-1/2 border p-2 rounded"
            value={visualizationSettings.yAxisFontSize}
            onChange={(e) =>
              setVisualizationSettings({
                ...visualizationSettings,
                yAxisFontSize: parseFloat(e.target.value),
              })
            }
          />
          <select
            className="input w-1/2 border p-2 rounded"
            value={visualizationSettings.yAxisFontFamily}
            onChange={(e) =>
              setVisualizationSettings({
                ...visualizationSettings,
                yAxisFontFamily: e.target.value,
              })
            }
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
            <option value="Georgia">Georgia</option>
          </select>
        </div>
      </div>

      {/* Background Color & Pattern */}
      <div className="mb-4">
        <label className="font-medium block mb-1">Background Visualization:</label>
        <div className="flex items-center">
          <input
            type="color"
            className="w-12 h-10 p-0 border cursor-pointer"
            value={visualizationSettings.backgroundColor}
            onChange={(e) =>
              setVisualizationSettings({
                ...visualizationSettings,
                backgroundColor: e.target.value,
              })
            }
          />
          <span className="ml-2">{visualizationSettings.backgroundColor}</span>
        </div>
      </div>

      <div className="mb-6">
        <label className="font-medium block mb-1">Pola Visualization:</label>
        <select
          className="input w-full border p-2 rounded"
          value={visualizationSettings.pattern}
          onChange={(e) =>
            setVisualizationSettings({ ...visualizationSettings, pattern: e.target.value })
          }
        >
          <option value="solid">Solid</option>
          <option value="striped">Striped</option>
          <option value="dotted">Dotted</option>
        </select>
      </div>

      {/* Add bottom padding to ensure scrolling works well */}
      <div style={{ height: "20px" }}></div>
    </div>
  );
};

export default SidebarDiagram;
