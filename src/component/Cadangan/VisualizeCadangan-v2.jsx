// import React, { useEffect, useState } from "react";
// import Chart from "react-apexcharts";
// import axios from "axios";
// import config from "../config";

// const VisualisasiChart = ({ requestPayload }) => {
//   const [chartData, setChartData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [errorMsg, setErrorMsg] = useState(null);

//   useEffect(() => {
//     if (!requestPayload || !requestPayload.query) {
//       setErrorMsg("Query tidak boleh kosong.");
//       setLoading(false);
//       return;
//     }

//     const chartType = requestPayload.chartType || "bar";
//     setLoading(true);
//     setErrorMsg(null);

//     axios
//       .post(`${config.API_BASE_URL}/api/kelola-dashboard/visualisasi-data`, requestPayload)
//       .then((response) => {
//         const responseData = response.data?.data;

//         console.log("API Response:", responseData);

//         if (!Array.isArray(responseData) || responseData.length === 0) {
//           throw new Error("Data kosong atau format tidak sesuai.");
//         }

//         const firstRow = responseData[0];

//         if (!firstRow || typeof firstRow !== "object") {
//           throw new Error("Format data tidak valid.");
//         }

//         const keys = Object.keys(firstRow);
//         if (keys.length < 2) {
//           throw new Error("Data harus memiliki minimal dua kolom.");
//         }

//         const labelKey = keys[0]; // kolom pertama sebagai kategori/label
//         const valueKeys = keys.slice(1); // kolom lainnya sebagai nilai

//         const categories = responseData.map((item) => item[labelKey]);

//         let chartSeries;
//         let chartOptions;

//         if (chartType === "pie" || chartType === "donut") {
//           // Untuk pie/donut: satu series array angka, dan labels array string
//           const values = responseData.map((item) => {
//             const val = Object.values(item)[1];
//             return typeof val === "number" ? val : parseFloat(val) || 0;
//           });

//           chartSeries = values;
//           chartOptions = {
//             chart: {
//               id: "visualisasi-chart",
//             },
//             labels: categories,
//           };
//         } else {
//           // Untuk bar/line: array of series object
//           chartSeries = valueKeys.map((key) => ({
//             name: key,
//             data: responseData.map((item) => {
//               const val = item[key];
//               return typeof val === "number" ? val : parseFloat(val) || 0;
//             }),
//           }));

//           chartOptions = {
//             chart: {
//               id: "visualisasi-chart",
//             },
//             xaxis: {
//               categories: categories,
//             },
//           };
//         }

//         setChartData({
//           options: chartOptions,
//           series: chartSeries,
//         });

//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error("Error mengambil data:", error);
//         setErrorMsg(error.response?.data?.message || error.message || "Terjadi kesalahan.");
//         setLoading(false);
//       });
//   }, [requestPayload]);

//   if (loading) {
//     return <div className="p-4">Loading...</div>;
//   }

//   if (errorMsg) {
//     return <div className="p-4 text-danger">Error: {errorMsg}</div>;
//   }

//   if (!chartData || !chartData.series || chartData.series.length === 0) {
//     return <div className="p-4 text-warning">Data tidak cukup untuk ditampilkan.</div>;
//   }

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
