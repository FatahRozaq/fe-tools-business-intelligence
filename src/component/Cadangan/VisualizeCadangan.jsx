// import React, { useEffect, useState } from "react";
// import Chart from "react-apexcharts";
// import axios from "axios";
// import config from "../config";

// const VisualisasiChart = ({ requestPayload }) => {
//   const [chartData, setChartData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [errorMsg, setErrorMsg] = useState(null);

//   useEffect(() => {
//     if (
//       !requestPayload ||
//       !requestPayload.dimensi ||
//       requestPayload.dimensi.length === 0
//     ) {
//       setErrorMsg("Dimensi tidak boleh kosong.");
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     axios
//       .post(
//         `${config.API_BASE_URL}/api/kelola-dashboard/visualisasi-data`,
//         requestPayload
//       ) 
//       .then((response) => {
//         const { data, labels, series } = response.data;

//         const categories = data.map((item) => {
//           return labels
//             .map((label) => {
//               const key = label.includes(".") ? label.split(".").pop() : label;
//               return item[key] ?? "N/A";
//             })
//             .join(" - ");
//         });

//         const chartSeries = series.map((metric) => {
//           const col = metric.split(".").pop();
//           return {
//             name: `total_${col}`,
//             data: data.map((item) => item[`total_${col}`] ?? 0),
//           };
//         });

//         setChartData({
//           options: {
//             chart: {
//               id: "visualisasi-bar",
//             },
//             xaxis: {
//               categories: categories,
//             },
//           },
//           series: chartSeries,
//         });

//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error("Error mengambil data:", error);
//         setErrorMsg(error.response?.data?.message || "Terjadi kesalahan.");
//         setLoading(false);
//       });
//   }, [requestPayload]);

//   if (loading) return <div className="p-4">Loading...</div>;
//   if (errorMsg) return <div className="p-4 text-danger">Error: {errorMsg}</div>;
//   if (!chartData) return null;

//   return (
//     <div className="p-4">
//       <Chart
//         options={chartData.options}
//         series={chartData.series}
//         type="bar"
//         height={350}
//       />
//     </div>
//   );
// };

// export default VisualisasiChart;
