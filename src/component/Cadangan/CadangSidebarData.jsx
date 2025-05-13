// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import config from "../config";
// import FooterBar from "./FooterBar";
// import { Button } from "primereact/button";
// import { Dialog } from "primereact/dialog";
// import { GrDatabase } from "react-icons/gr";
// import { FaPaperPlane } from "react-icons/fa";
// import AddButton from "./Button/AddButton";
// import SubmitButton from "./Button/SubmitButton";

// const SidebarData = ({
//   fetchData,
//   addDimensi,
//   setCanvasData,
//   setCanvasQuery,
//   selectedTable,
// }) => {
//   const [dimensiInputs, setDimensiInputs] = useState([""]);
//   const [metrikInputs, setMetrikInputs] = useState([]);
//   const [showFooter, setShowFooter] = useState(false);
//   const [filters, setFilters] = useState([
//     { mode: "INCLUDE", logic: "AND", column: "", operator: "=", value: "" },
//   ]);

//   const [showPopup, setShowPopup] = useState(false);
//   const [joinDimensiIndexes, setJoinDimensiIndexes] = useState([]);
//   const [tables, setTables] = useState([]);
//   const [selectedJoinTable, setSelectedJoinTable] = useState([]);

//   const [selectedJoinTableMetrik, setSelectedJoinTableMetrik] = useState([]);
//   const [showPopupMetrik, setShowPopupMetrik] = useState(false);

//   const [joinDimensiData, setJoinDimensiData] = useState([]); // Untuk join dimensi
//   const [joinMetrikData, setJoinMetrikData] = useState([]); // Untuk join metri

//   const [metrikAggregation, setMetrikAggregation] = useState([]);
//   const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);

//   const [selectedJoinType, setSelectedJoinType] = useState("INNER");
//   const [selectedJoinTypeMetrik, setSelectedJoinTypeMetrik] = useState("INNER");

//   useEffect(() => {
//     axios
//       .get(`${config.API_BASE_URL}/api/kelola-dashboard/fetch-table/1`)
//       .then((response) => {
//         if (response.data.success) {
//           setTables(response.data.data);
//         } else {
//           console.log("Gagal mengambil tabel", response.data.message);
//         }
//       })
//       .catch((error) => {
//         console.error("Terjadi kesalahan saat mengambil daftar tabel", error);
//       });
//   }, []);

//   useEffect(() => {
//     // Pastikan dimensi hanya berisi nama kolom, tanpa tabel
//     console.log("Dimensi yang terkirim:", dimensiInputs);
//   }, [dimensiInputs]);

//   const handleAddDimensi = () => {
//     const lastDimensi = dimensiInputs[dimensiInputs.length - 1];
//     if (lastDimensi.trim() === "") {
//       setDimensiInputs([...dimensiInputs, ""]);
//     } else {
//       setShowPopup(true);
//     }
//   };

//   const handleAddMetrik = () => {
//     setShowPopupMetrik(true); // Open the popup to select the table and join type for the metric
//     setWaitingForConfirmation(true); // Set waiting state to true
//   };

//   const formatColumnName = (data, type) => {
//     try {
//       // Memeriksa apakah data adalah string JSON, jika ya, parsing
//       if (typeof data === "string") {
//         const parsedData = JSON.parse(data);
//         return (
//           parsedData[type === "dimensi" ? "columnName" : "columnName"] || ""
//         ); // Ambil columnName
//       }

//       // Jika data sudah berupa objek, langsung ambil columnName
//       return data && data[type === "dimensi" ? "columnName" : "columnName"]
//         ? data[type === "dimensi" ? "columnName" : "columnName"]
//         : "";
//     } catch (error) {
//       // console.error('Error formatting columnName:', error);
//       return ""; // Kembalikan string kosong jika ada kesalahan
//     }
//   };

//   // Fungsi menampilkan FooterBar
//   const handleToggleFooter = () => {
//     setShowFooter(!showFooter);
//   };

//   const handleDimensiChange = (index, event) => {
//     const newDimensiInputs = [...dimensiInputs];
//     newDimensiInputs[index] = event.target.value; // Memasukkan format tableName.columnName
//     setDimensiInputs(newDimensiInputs);
//   };

//   const handleMetrikChange = (index, event) => {
//     const newMetrikInputs = [...metrikInputs];
//     newMetrikInputs[index] = event.target.value; // Menyimpan nilai input metriks
//     setMetrikInputs(newMetrikInputs);
//   };

//   const handleAggregationChange = (index, event) => {
//     const newAggregation = [...metrikAggregation];
//     newAggregation[index] = event.target.value; // Menyimpan jenis agregasi
//     setMetrikAggregation(newAggregation);

//     // Gabungkan nilai metrik dengan agregasi yang dipilih
//     const newMetrikInputs = [...metrikInputs];
//     newMetrikInputs[index] = `${newMetrikInputs[index]}|${event.target.value}`; // Format menjadi columnName|AGGREGATION
//     setMetrikInputs(newMetrikInputs);
//   };

//   const handleApplyFilters = (newFilters, appliedFilters) => {
//     console.log("Filters applied:", appliedFilters);
//     setFilters(newFilters);
//     sendDataToAPI(); // Kirim ulang data setelah filter diterapkan
//   };

//   const handleJoinSelection = (type) => {
//     // Menambahkan tipe join dan tabel saat pengguna mengklik OK
//     const newJoinDimensiIndexes = [...joinDimensiIndexes];
//     const lastDimensiIndex = dimensiInputs.length - 1;

//     const newJoinData = [...joinDimensiData];
//     const selectedTableForJoin = selectedJoinTable;

//     // Update join data dengan tabel yang dipilih dan tipe join
//     newJoinData[lastDimensiIndex] = {
//       tabel: selectedTableForJoin,
//       join_type: type,
//     };

//     if (type !== "tanpa join") {
//       newJoinDimensiIndexes.push(lastDimensiIndex); // Menambahkan ke index join jika bukan "tanpa join"
//     } else {
//       const updatedIndexes = newJoinDimensiIndexes.filter(
//         (index) => index !== lastDimensiIndex
//       );
//       newJoinDimensiIndexes.splice(
//         0,
//         newJoinDimensiIndexes.length,
//         ...updatedIndexes
//       );
//       newJoinData[lastDimensiIndex] = { tabel: "", join_type: "tanpa join" };
//     }

//     // Set data join dan update index join
//     setJoinDimensiData(newJoinData);
//     setJoinDimensiIndexes(newJoinDimensiIndexes);

//     // Menambahkan input Dimensi baru dengan menambahkan string kosong ke array dimensiInputs
//     setDimensiInputs([...dimensiInputs, ""]);

//     setShowPopup(false); // Menutup popup setelah konfirmasi
//   };

//   const handleJoinSelectionMetrik = (type) => {
//     // Add join type and table when user clicks OK
//     if (waitingForConfirmation) {
//       const newJoinData = [...joinMetrikData];
//       const lastMetrikIndex = metrikInputs.length;

//       if (type !== "tanpa join") {
//         newJoinData[lastMetrikIndex] = {
//           tabel: selectedJoinTableMetrik,
//           join_type: type,
//         };
//       } else {
//         newJoinData[lastMetrikIndex] = {
//           tabel: "",
//           join_type: "tanpa join",
//         };
//       }

//       setJoinMetrikData(newJoinData);
//       setMetrikInputs([...metrikInputs, ""]); // Add new input after confirmation
//       setShowPopupMetrik(false); // Close the popup after confirmation
//       setWaitingForConfirmation(false); // Reset waiting state
//     }
//   };

//   const sendDataToAPI = () => {
//     const firstDimensi = dimensiInputs[0];
//     let table = "";

//     if (firstDimensi) {
//       // Jika dimensi pertama ada, ambil tabel dari dimensi pertama
//       try {
//         const parsedDimensi = JSON.parse(firstDimensi);
//         table = parsedDimensi.tableName || "";
//       } catch (e) {
//         console.error("Failed to parse firstDimensi:", e);
//       }
//     } else {
//       // Jika dimensi tidak ada, gunakan tabel dari metriks pertama
//       const firstMetrik = metrikInputs[0];
//       if (firstMetrik) {
//         try {
//           const parsedMetrik = JSON.parse(firstMetrik);
//           table = parsedMetrik.tableName || ""; // Ambil tabel dari metriks pertama
//         } catch (e) {
//           console.error("Failed to parse firstMetrik:", e);
//         }
//       }
//     }

//     const dimensi = dimensiInputs
//       .map((dimensi) => {
//         try {
//           const parsedDimensi = JSON.parse(dimensi);
//           return parsedDimensi.tableName && parsedDimensi.columnName
//             ? `${parsedDimensi.tableName}.${parsedDimensi.columnName}`
//             : "";
//         } catch (e) {
//           console.error("Failed to parse dimensi item:", e);
//           return "";
//         }
//       })
//       .filter((input) => input && input.trim() !== "");

//     const metriks = metrikInputs
//       .map((metrik, index) => {
//         try {
//           const parsedMetrik = JSON.parse(metrik);
//           const aggregation = metrikAggregation[index] || "COUNT"; // Default to 'COUNT' if no aggregation is selected
//           return parsedMetrik.tableName && parsedMetrik.columnName
//             ? `${parsedMetrik.tableName}.${parsedMetrik.columnName}|${aggregation}`
//             : "";
//         } catch (e) {
//           console.error("Failed to parse metrik item:", e);
//           return "";
//         }
//       })
//       .filter((input) => input && input.trim() !== "");

//     const tabelJoin = [
//       ...joinDimensiData.filter(
//         (dimensiJoin) =>
//           dimensiJoin.tabel && dimensiJoin.join_type !== "tanpa join"
//       ),
//       ...joinMetrikData.filter(
//         (metrikJoin) =>
//           metrikJoin.tabel && metrikJoin.join_type !== "tanpa join"
//       ),
//     ];

//     const parsedFilters = filters
//       .filter((filter) => filter.column && filter.operator)
//       .map((filter) => {
//         const column = filter.column.includes("")
//           ? filter.column
//           : `${selectedTable}.${filter.column}`;
//         return {
//           column,
//           operator: filter.operator,
//           value: filter.value,
//           mode: filter.mode?.toLowerCase() || "include",
//           logic: filter.logic?.toLowerCase() || "and",
//         };
//       });

//     // Kirim data ke API
//     axios
//       .post(`${config.API_BASE_URL}/api/kelola-dashboard/fetch-data`, {
//         tabel: table, // Gunakan tabel dari dimensi pertama atau metriks pertama
//         dimensi,
//         metriks, // Kirim metriks yang sudah terformat
//         tabel_join: tabelJoin, // Gabungkan join dimensi dan join metrik
//         filters: parsedFilters, // Kirim filter
//       })
//       .then((response) => {
//         if (response.data.success) {
//           console.log("Data berhasil dikirim", response.data.data);
//           setCanvasData(response.data.data);
//           setCanvasQuery(response.data.query);
//         } else {
//           console.log("Gagal mengirim data", response.data.message);
//         }
//       })
//       .catch((error) => {
//         console.error("Terjadi kesalahan saat mengirim data", error);
//       });
//   };

//   return (
//     <div id="sidebar-data" className="sidebar-2">
//       <div className="sub-title">
//         <GrDatabase size={48} className="text-muted" />
//         <span className="sub-text">Data</span>
//       </div>
//       <hr className="full-line" />
//       <div className="form-diagram">
//         <div className="form-group">
//           <span>Dimensi</span>
//           <div id="dimensi-container">
//             {dimensiInputs.map((dimensi, index) => (
//               <div key={index} className="dimensi-row">
//                 <input
//                   style={{ width: "100%" }}
//                   type="text"
//                   className="dimensi-input"
//                   value={formatColumnName(dimensi, "dimensi")}
//                   onChange={(e) => handleDimensiChange(index, e)}
//                 />
//                 {joinDimensiIndexes.includes(index) &&
//                   joinDimensiData[index] && (
//                     <span className="join-text">
//                       {joinDimensiData[index].join_type}{" "}
//                       {joinDimensiData[index].tabel}
//                     </span>
//                   )}
//               </div>
//             ))}
//           </div>
//           <AddButton
//             text="Tambah Dimensi"
//             onClick={handleAddDimensi}
//             className="mt-2"
//           />
//         </div>

//         {/* Dialog PopUp Join Dimensi */}
//         <Dialog
//           header="Pilih Jenis Dimensi"
//           visible={showPopup}
//           style={{ width: "50vw" }}
//           onHide={() => setShowPopup(false)}
//         >
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//             }}
//           >
//             <div style={{ width: "45%" }}>
//               <h6>
//                 Gabungkan Tabel{" "}
//                 {joinDimensiData.length > 0 &&
//                 joinDimensiData[joinDimensiData.length - 1].tabel
//                   ? joinDimensiData[joinDimensiData.length - 1].tabel
//                   : dimensiInputs.length > 0 && dimensiInputs[0]
//                   ? JSON.parse(dimensiInputs[0]).tableName
//                   : "Pilih Tabel"}
//               </h6>
//               <select
//                 onChange={(e) => setSelectedJoinTable(e.target.value)}
//                 style={{ width: "100%" }}
//               >
//                 <option value="">Pilih Tabel</option>
//                 {tables.map((table, idx) => (
//                   <option key={idx} value={table}>
//                     {table}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div style={{ width: "45%" }}>
//               <h6>Join Tipe</h6>
//               <select
//                 onChange={(e) => setSelectedJoinType(e.target.value)}
//                 style={{ width: "100%" }}
//               >
//                 <option value="">Pilih tipe join</option>
//                 <option value="INNER">INNER JOIN</option>
//                 <option value="LEFT">LEFT JOIN</option>
//                 <option value="RIGHT">RIGHT JOIN</option>
//                 <option value="CROSS">CROSS JOIN</option>
//                 <option value="FULL">FULL JOIN</option>
//                 <option value="tanpa join">Tanpa Join</option>
//               </select>
//             </div>
//           </div>
//           <div style={{ marginTop: "20px", textAlign: "right" }}>
//             <Button
//               label="OK"
//               icon="pi pi-check"
//               onClick={() => handleJoinSelection(selectedJoinType)}
//               style={{ marginRight: "10px" }}
//             />

//             <Button
//               label="Batal"
//               icon="pi pi-times"
//               onClick={() => setShowPopup(false)}
//             />
//           </div>
//         </Dialog>

//         <div className="form-group">
//           <span>Metrik</span>
//           <div id="metrik-container">
//             {metrikInputs.map((metrik, index) => (
//               <div key={index} className="metrik-row">
//                 {joinMetrikData[index] && (
//                   <span className="join-text">
//                     {joinMetrikData[index].join_type}{" "}
//                     {joinMetrikData[index].tabel}
//                   </span>
//                 )}
//                 <input
//                   style={{ width: "80%" }}
//                   type="text"
//                   className="metrik-input"
//                   value={formatColumnName(metrik, "metrik")}
//                   onChange={(e) => handleMetrikChange(index, e)}
//                 />
//                 <select
//                   style={{ width: "20%" }}
//                   className="metrik-aggregation-dropdown"
//                   value={metrikAggregation[index] || "COUNT"}
//                   onChange={(e) => handleAggregationChange(index, e)}
//                 >
//                   <option value="COUNT">COUNT</option>
//                   <option value="SUM">SUM</option>
//                   <option value="AVERAGE">AVERAGE</option>
//                 </select>
//               </div>
//             ))}
//           </div>

//           <AddButton
//             text="Tambah Metrik"
//             onClick={handleAddMetrik}
//             className="mt-2"
//           />
//         </div>

//         {/* Dialog PopUp Join Metrik */}
//         <Dialog
//           header="Pilih Jenis Metrik"
//           visible={showPopupMetrik}
//           style={{ width: "50vw" }}
//           onHide={() => setShowPopupMetrik(false)}
//         >
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//             }}
//           >
//             <div style={{ width: "45%" }}>
//               <h6>Gabungkan Tabel</h6>
//               <select
//                 onChange={(e) => setSelectedJoinTableMetrik(e.target.value)}
//                 style={{ width: "100%" }}
//               >
//                 <option value="">Pilih Tabel</option>
//                 {tables.map((table, idx) => (
//                   <option key={idx} value={table}>
//                     {table}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div style={{ width: "45%" }}>
//               <h6>Join Tipe</h6>
//               <select
//                 onChange={(e) => setSelectedJoinTypeMetrik(e.target.value)}
//                 style={{ width: "100%" }}
//               >
//                 <option value="">Pilih Tabel</option>
//                 <option value="INNER">INNER JOIN</option>
//                 <option value="LEFT">LEFT JOIN</option>
//                 <option value="RIGHT">RIGHT JOIN</option>
//                 <option value="SELF">SELF JOIN</option>
//                 <option value="CROSS">CROSS JOIN</option>
//                 <option value="FULL">FULL JOIN</option>
//                 <option value="tanpa join">Tanpa Join</option>
//               </select>
//             </div>
//           </div>
//           <div style={{ marginTop: "20px", textAlign: "right" }}>
//             <Button
//               label="OK"
//               icon="pi pi-check"
//               onClick={() => handleJoinSelectionMetrik(selectedJoinTypeMetrik)}
//               style={{ marginRight: "10px" }}
//             />

//             <Button
//               label="Batal"
//               icon="pi pi-times"
//               onClick={() => setShowPopupMetrik(false)}
//             />
//           </div>
//         </Dialog>

//         <div className="form-group">
//           <span>Tanggal</span>
//           <input type="text" id="tanggal-input" onChange={fetchData} />
//         </div>
//         <div className="form-group">
//           <span>Filter</span>
//           <AddButton
//             text="Tambah Filter"
//             onClick={handleToggleFooter}
//             className="mt-2"
//           />
//         </div>

//         <SubmitButton onClick={sendDataToAPI} text="Submit" />
//       </div>
//       {showFooter && (
//         <FooterBar
//           filters={filters}
//           setFilters={setFilters}
//           handleApplyFilters={handleApplyFilters}
//           handleToggleFooter={handleToggleFooter}
//         />
//       )}
//     </div>
//   );
// };

// export default SidebarData;
