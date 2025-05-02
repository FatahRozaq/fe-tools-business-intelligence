// import React, { useEffect, useState } from "react";
// import Chart from "react-apexcharts";
// import axios from "axios";
// import config from "../config";

// const VisualisasiChart = ({ requestPayload, selectedColors }) => {
//   const [chartData, setChartData] = useState(null);
//   const [status, setStatus] = useState({ loading: true, error: null });

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!requestPayload?.query) {
//         setStatus({ loading: false, error: "Query tidak boleh kosong." });
//         return;
//       }

//       setStatus({ loading: true, error: null });

//       try {
//         const res = await axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/visualisasi-data`, requestPayload);
//         const data = res.data?.data;

//         if (!Array.isArray(data) || data.length === 0)
//           throw new Error("Data kosong atau format tidak sesuai.");

//         const [firstRow] = data;
//         const keys = Object.keys(firstRow);

//         if (keys.length < 2) throw new Error("Data harus memiliki minimal dua kolom.");

//         const [labelKey, ...valueKeys] = keys;
//         const categories = data.map(item => item[labelKey]);
//         const chartType = requestPayload.chartType || "bar";

//         const parseValue = val => (typeof val === "number" ? val : parseFloat(val)) || 0;

//         const series = (chartType === "pie" || chartType === "donut")
//           ? [{
//               name: valueKeys[0],
//               data: data.map(item => parseValue(item[valueKeys[0]])),
//             }]
//           : valueKeys.map(key => ({
//               name: key,
//               data: data.map(item => parseValue(item[key])),
//             }));

//         const chartOptions = {
//           chart: {
//             id: "visualisasi-chart",
//             background: selectedColors?.background || "#ffffff",
//             fontFamily: selectedColors?.fontFamily || "Arial",
//             foreColor: "#333",
//           },
//           colors: selectedColors?.colors || ["#4CAF50", "#FF9800", "#2196F3"],
//           title: {
//             text: selectedColors?.title || "Visualisasi Data",
//             align: "center",
//             style: {
//               fontSize: selectedColors?.fontSize || "16px",
//               fontFamily: selectedColors?.fontFamily || "Arial",
//             },
//           },
//           ...(chartType === "pie" || chartType === "donut"
//             ? { labels: categories }
//             : { xaxis: { categories } }),
//         };

//         const chartPayload = {
//           series,
//           options: chartOptions,
//         };

//         setChartData(chartPayload);
//         setStatus({ loading: false, error: null });

//         // Simpan chart ke backend
//         await axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/save-chart`, {
//           id_canvas: 1,
//           id_datasource: requestPayload.id_datasource || 1,
//           name: requestPayload.name || selectedColors?.title || "Chart Visual",
//           chart_type: chartType,
//           query: requestPayload.query,
//           config: {
//             colors: selectedColors?.colors,
//             background: selectedColors?.background,
//             title: selectedColors?.title,
//             fontSize: selectedColors?.fontSize,
//             fontFamily: selectedColors?.fontFamily,
//             chartOptions: chartOptions,
//           },
//           width: 800,
//           height: 350,
//           position_x: 0,
//           position_y: 0,
//         });

//       } catch (err) {
//         console.error("Error:", err);
//         setStatus({
//           loading: false,
//           error: err.response?.data?.message || err.message || "Terjadi kesalahan.",
//         });
//       }
//     };

//     fetchData();
//   }, [requestPayload, selectedColors]);

//   if (status.loading) return <div className="p-4">Loading...</div>;
//   if (status.error) return <div className="p-4 text-danger">Error: {status.error}</div>;
//   if (!chartData?.series?.length) return <div className="p-4 text-warning">Data tidak cukup untuk ditampilkan.</div>;

//   return (
//     <div className="p-4">
//       <Chart
//         options={chartData.options}
//         series={chartData.series}
//         type={requestPayload.chartType || "bar"}
//         height={350}
//       />
//     </div>
//   );
// };

// export default VisualisasiChart;
