// import React, { useState, useEffect } from "react";
// import column from "../assets/img/charts/column.png";
// import line from "../assets/img/charts/lines.png";
// import pie from "../assets/img/charts/pie.png";
// import table from "../assets/img/charts/table-v2.png";
// import donut from "../assets/img/charts/donut.png";
// import { HiOutlineChartPie } from "react-icons/hi";
// import { SketchPicker } from "react-color"; // <-- Import react-color

// const SidebarDiagram = ({ onChartTypeChange, onColorChange }) => {
//   const chartOptions = [
//     { type: "bar", label: "Batang", image: column },
//     { type: "line", label: "Line", image: line },
//     { type: "pie", label: "Pie", image: pie },
//     { type: "donut", label: "Donut", image: donut },
//     { type: "", label: "Tabel", image: table },
//   ];

//   const [colors, setColors] = useState(["#4CAF50", "#FF9800", "#2196F3"]);
//   const [activePicker, setActivePicker] = useState(null); // Untuk toggle picker
//   const [chartTitle, setChartTitle] = useState("");
//   const [backgroundColor, setBackgroundColor] = useState("#ffffff");
//   const [fontSize, setFontSize] = useState("14px");
//   const [fontFamily, setFontFamily] = useState("Arial");

//   const [chartSettings, setChartSettings] = useState({
//     title: "",
//     titleFontSize: 18,
//     titleFontFamily: "Arial",
//     fontSize: 14,
//     fontFamily: "Arial",
//     fontColor: "#000000",
//     gridColor: "#E0E0E0",
//   });

//   const handleColorChange = (index, newColor) => {
//     const newColors = [...colors];
//     newColors[index] = newColor.hex;
//     setColors(newColors);
//     onColorChange(newColors);
//   };

//   // useEffect(() => {
//   //   onColorChange({
//   //     colors,
//   //     ...chartSettings,
//   //   });
//   // }, [colors, chartSettings]);

//   useEffect(() => {
//     const config = {
//       title: chartTitle,
//       background: backgroundColor,
//       fontSize,
//       fontFamily,
//       colors,
//     };
//     onColorChange(config);
//   }, [chartTitle, backgroundColor, fontSize, fontFamily, colors]);

//   return (
//     <div id="sidebar-diagram" className="sidebar-2">
//       <div className="sub-title">
//         <HiOutlineChartPie size={48} className="text-muted" />
//         <span className="sub-text">Diagram</span>
//       </div>
//       <hr className="full-line" />

//       <div className="form-diagram">
//         <div
//           className="card-row"
//           style={{
//             display: "flex",
//             flexWrap: "wrap",
//             gap: "10px",
//             justifyContent: "space-around",
//           }}
//         >
//           {chartOptions.map((chart, index) => (
//             <div
//               key={index}
//               onClick={() => onChartTypeChange(chart.type)}
//               style={{
//                 width: "85px",
//                 textAlign: "center",
//                 cursor: "pointer",
//               }}
//             >
//               <div
//                 style={{
//                   backgroundColor: "#1E3A8A",
//                   padding: "10px",
//                   borderRadius: "8px",
//                 }}
//               >
//                 <img
//                   src={chart.image}
//                   alt={`${chart.label} Chart`}
//                   style={{
//                     width: "60px",
//                     height: "60px",
//                     objectFit: "contain",
//                   }}
//                 />
//               </div>
//               <div
//                 style={{
//                   marginTop: "5px",
//                   color: "#1E3A8A",
//                   fontSize: "14px",
//                   fontWeight: "500",
//                 }}
//               >
//                 {chart.label}
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="color-pickers mt-4">
//           <label
//             style={{
//               fontSize: "14px",
//               fontWeight: "500",
//               marginBottom: "6px",
//               display: "block",
//               color: "#1E3A8A",
//             }}
//           >
//             Pilih Warna Chart:
//           </label>
//           <div style={{ display: "flex", gap: "15px" }}>
//             {colors.map((color, index) => (
//               <div key={index} style={{ position: "relative" }}>
//                 <div
//                   onClick={() =>
//                     setActivePicker(activePicker === index ? null : index)
//                   }
//                   style={{
//                     backgroundColor: color,
//                     width: "36px",
//                     height: "36px",
//                     borderRadius: "4px",
//                     cursor: "pointer",
//                     border: "1px solid #ccc",
//                   }}
//                 />
//                 {activePicker === index && (
//                   <div style={{ position: "absolute", zIndex: 2 }}>
//                     <SketchPicker
//                       color={color}
//                       onChange={(newColor) =>
//                         handleColorChange(index, newColor)
//                       }
//                     />
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="mt-4">
//           <label>Judul Chart:</label>
//           <input
//             type="text"
//             value={chartTitle}
//             onChange={(e) => setChartTitle(e.target.value)}
//             className="form-control"
//           />

//           <label className="mt-3">Warna Background:</label>
//           <input
//             type="color"
//             value={backgroundColor}
//             onChange={(e) => setBackgroundColor(e.target.value)}
//           />

//           <label className="mt-3">Ukuran Font:</label>
//           <input
//             type="text"
//             value={fontSize}
//             onChange={(e) => setFontSize(e.target.value)}
//             placeholder="Contoh: 14px"
//             className="form-control"
//           />

//           <label className="mt-3">Font Family:</label>
//           <input
//             type="text"
//             value={fontFamily}
//             onChange={(e) => setFontFamily(e.target.value)}
//             placeholder="Contoh: Arial"
//             className="form-control"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SidebarDiagram;
