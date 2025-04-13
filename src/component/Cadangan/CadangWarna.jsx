// import React, { useState } from "react";
// import column from "../assets/img/charts/column.png";
// import line from "../assets/img/charts/lines.png";
// import pie from "../assets/img/charts/pie.png";
// import table from "../assets/img/charts/table.png";
// import { HiOutlineChartPie } from "react-icons/hi";

// const SidebarDiagram = ({ onChartTypeChange, onColorChange }) => {
//   const chartOptions = [
//     { type: "bar", label: "Batang", image: column },
//     { type: "line", label: "Line", image: line },
//     { type: "pie", label: "Pie", image: pie },
//     { type: "", label: "Tabel", image: table },
//   ];

//   const [colors, setColors] = useState(["#4CAF50", "#FF9800", "#2196F3"]);

//   const handleColorChange = (index, newColor) => {
//     const newColors = [...colors];
//     newColors[index] = newColor;
//     setColors(newColors);
//     onColorChange(newColors); // Send to parent
//   };

//   return (
//     <div id="sidebar-diagram" className="sidebar-2">
//       <div className="sub-title">
//         <HiOutlineChartPie size={48} />
//         <span className="sub-text">Diagram</span>
//       </div>
//       <hr className="full-line" />

//       <div className="form-diagram">
//         <div className="card-row" style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-around" }}>
//           {chartOptions.map((chart, index) => (
//             <div key={index} onClick={() => onChartTypeChange(chart.type)} style={{ width: "85px", textAlign: "center", cursor: "pointer" }}>
//               <div style={{ backgroundColor: "#1E3A8A", padding: "10px", borderRadius: "8px" }}>
//                 <img src={chart.image} alt={`${chart.label} Chart`} style={{ width: "60px", height: "60px", objectFit: "contain" }} />
//               </div>
//               <div style={{ marginTop: "5px", color: "#1E3A8A", fontSize: "14px", fontWeight: "500" }}>{chart.label}</div>
//             </div>
//           ))}
//         </div>

//         <div className="color-pickers mt-4">
//           <label style={{ fontSize: "14px", fontWeight: "500", marginBottom: "6px", display: "block", color: "#1E3A8A" }}>
//             Pilih Warna Chart:
//           </label>
//           {colors.map((color, index) => (
//             <input
//               key={index}
//               type="color"
//               value={color}
//               onChange={e => handleColorChange(index, e.target.value)}
//               style={{ marginRight: "10px", cursor: "pointer" }}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SidebarDiagram;
