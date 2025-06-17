import React, { useEffect, useState, useCallback, useRef } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import config from "../config"; // Assuming this path is correct
import { useDebouncedCallback } from 'use-debounce'; // IMPORT use-debounce

// Card Component for displaying single value
const CardComponent = ({ data, labelKey, valueKey, visualizationConfig }) => {
  if (!data || data.length === 0) {
    return <div className="p-4 text-gray-500">Data card tidak tersedia.</div>;
  }

  // Get the first row's value
  const firstRow = data[0];
  const label = firstRow[labelKey];
  const value = firstRow[valueKey];
  
  // Format value if it's a number
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
  
  // Get styling from config or use defaults
  const vc = visualizationConfig || {};
  const cardStyle = {
    backgroundColor: vc.backgroundColor || "#ffffff",
    color: vc.fontColor || "#333333",
    fontFamily: vc.fontFamily || "Arial",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    border: vc.borderType !== "none" ? `${vc.borderWidth || 1}px ${vc.borderType || "solid"} ${vc.borderColor || "#e0e0e0"}` : "none",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "1.5rem"
  };
  
  const titleStyle = {
    fontSize: `${vc.titleFontSize || 18}px`,
    fontWeight: "bold",
    color: vc.titleFontColor || "#333333",
    marginBottom: "0.5rem",
    textAlign: vc.titlePosition || "center"
  };
  
  const valueStyle = {
    fontSize: `${vc.valueFontSize || 32}px`,
    fontWeight: "bold",
    color: vc.valueFontColor || "#4CAF50",
    textAlign: "center",
    margin: "1rem 0"
  };
  
  const labelStyle = {
    fontSize: `${vc.categoryTitleFontSize || 14}px`,
    color: vc.categoryTitleFontColor || "#666666",
    textAlign: "center"
  };

  return (
    <div style={cardStyle}>
      {vc.title && <div style={titleStyle}>{vc.title}</div>}
      <div style={valueStyle}>{formattedValue}</div>
      <div style={labelStyle}>{label}</div>
    </div>
  );
};

// DataTable Component
const DataTableComponent = ({ data, query }) => {
  if (!data || data.length === 0) {
    return <div className="p-4 text-gray-500">Data tabel tidak tersedia.</div>;
  }

  const [firstRow] = data;
  const keys = Object.keys(firstRow);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            {keys.map((key, index) => (
              <th key={index} className="border border-gray-300 p-2 text-left">
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              {keys.map((key, keyIndex) => (
                <td key={keyIndex} className="border border-gray-300 p-2">
                  {typeof row[key] === 'number' ? row[key].toLocaleString() : row[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Visualisasi = ({ requestPayload, visualizationType, visualizationConfig, currentCanvasIndex, currentCanvasId}) => {
  const [fetchedData, setFetchedData] = useState(null); // { raw: [], keys: [] }
  const [visualizationData, setVisualizationData] = useState(null); // { rawData, series, options, currentType, labelKey, valueKeys, colors }
  const [status, setStatus] = useState({ loading: true, error: null });
  const [savedVisualizationId, setSavedVisualizationId] = useState(null);
  const [activeVisualizationType, setActiveVisualizationType] = useState(
    visualizationType || requestPayload?.visualizationType || "bar"
  );

  const skipConfigUpdateRef = useRef(true);
  
  useEffect(() => {
    if (visualizationType) {
      setActiveVisualizationType(visualizationType);
    }
  }, [visualizationType]);

  const getTextStyleProperties = useCallback((styleName) => {
    const properties = {
      fontWeight: "normal",
      fontStyle: "normal",
      textDecoration: "none",
    };
    if (styleName === "italic") {
      properties.fontStyle = "italic";
    } else if (styleName === "underline") {
      properties.textDecoration = "underline";
    }
    return properties;
  }, []);

  const getChartOptions = useCallback((chartType, categories, chartColors) => {
    const vc = visualizationConfig || {}; 

    const titleTextStyleProps = getTextStyleProperties(vc.titleTextStyle);
    const subtitleTextStyleProps = getTextStyleProperties(vc.subtitleTextStyle);
    const categoryTitleTextStyleProps = getTextStyleProperties(vc.categoryTitleTextStyle);

    const options = {
      chart: {
        id: "visualisasi",
        background: vc.backgroundColor || "#ffffff",
        fontFamily: vc.fontFamily || "Arial",
        foreColor: vc.fontColor || "#333333",
      },
      colors: chartColors,
      title: {
        text: vc.title || "Visualisasi Data",
        align: vc.titlePosition || "center",
        margin: 10,
        offsetX: 0,
        offsetY: 0,
        floating: false,
        style: {
          fontSize: `${vc.titleFontSize || 18}px`,
          fontWeight: titleTextStyleProps.fontWeight,
          fontFamily: vc.titleFontFamily || "Arial",
          fontStyle: titleTextStyleProps.fontStyle,
          color: vc.titleFontColor || "#333333", 
        },
      },
      subtitle: {
        text: vc.subtitle || "Sub Judul Visualisasi",
        align: vc.subtitlePosition || "center",
        margin: 10,
        offsetX: 0,
        offsetY: vc.titleFontSize ? (parseInt(String(vc.titleFontSize).replace('px',''), 10) + 10) : 30,
        floating: false,
        style: {
          fontSize: `${vc.subtitleFontSize || 14}px`,
          fontWeight: subtitleTextStyleProps.fontWeight,
          fontFamily: vc.subtitleFontFamily || "Arial",
          fontStyle: subtitleTextStyleProps.fontStyle,
          color: vc.subtitleFontColor || "#333333",
        },
      },
      grid: {
        show: vc.gridType !== "none" && chartType !== "pie" && chartType !== "donut", 
        borderColor: vc.gridColor || "#E0E0E0",
        strokeDashArray: vc.gridType === "dashed" ? 4 : (vc.gridType === "dotted" ? 2 : 0),
        position: 'back',
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
      },
      fill: {
        type: vc.pattern === "solid" ? "solid" : "pattern",
        pattern: {
          style: vc.pattern === "striped" ? "horizontalLines" : (vc.pattern === "dotted" ? "circles" : undefined),
          width: vc.pattern === "solid" ? undefined : 6,
          height: vc.pattern === "solid" ? undefined : 6,
          strokeWidth: vc.pattern === "solid" ? undefined : 2,
        },
      },
      legend: {
        show: true, 
        fontSize: `${vc.fontSize || 14}px`,
        fontFamily: vc.fontFamily || "Arial",
        fontWeight: 400,
        labels: {
          colors: vc.fontColor || "#333333",
          useSeriesColors: false
        },
        position: 'top', 
        horizontalAlign: 'center', 
      },
      dataLabels: {
        enabled: vc.showValue !== undefined ? vc.showValue : true,
        style: {
          fontSize: '12px', 
          fontFamily: vc.fontFamily || "Arial",
          colors: [vc.valueFontColor || "#000000"],
        },
        background: {
          enabled: false,
        },
        dropShadow: {
          enabled: false,
        },
      },
      stroke: {
        show: vc.borderType !== "none",
        width: vc.borderWidth !== undefined && vc.borderType !== "none" ? vc.borderWidth : (chartType === 'line' ? 4 : 1),
        colors: vc.borderType !== "none" ? [vc.borderColor || "#000000"] : undefined, 
        curve: 'smooth', 
        lineCap: 'butt',
        dashArray: vc.borderType === "dashed" ? 4 : (vc.borderType === "dotted" ? 2 : 0),
      },
      tooltip: {
        enabled: true, 
        theme: 'light', 
      },
    };

    if (chartType === "pie" || chartType === "donut") {
      options.labels = categories;
      options.plotOptions = {
        pie: {
          dataLabels: { offset: 0, minAngleToShowLabel: 10 }
        }
      };
      if (chartType === "donut") {
        options.plotOptions.pie.donut = {
          size: '65%', 
          labels: {
            show: vc.showValue !== undefined ? vc.showValue : true,
            name: { show: true, fontSize: '16px', fontFamily: vc.fontFamily || "Arial", color: vc.fontColor || "#333333", offsetY: -10 },
            value: {
              show: true, fontSize: '20px', fontFamily: vc.fontFamily || "Arial", color: vc.valueFontColor || "#000000", offsetY: 10,
              formatter: function (val) { return typeof val === 'number' ? val.toLocaleString() : val; }
            },
            total: {
              show: true, showAlways: false, label: 'Total', fontSize: '16px', fontFamily: vc.fontFamily || "Arial", color: vc.fontColor || "#333333",
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return typeof total === 'number' ? total.toLocaleString() : total;
              }
            }
          }
        };
      }
      if(options.dataLabels){ 
        delete options.dataLabels.offsetY;
        delete options.dataLabels.offsetX;
        options.dataLabels.textAnchor = 'middle';
      }
    } else {
      options.xaxis = {
        categories: categories,
        title: {
          text: vc.categoryTitle || "Kategori", offsetY: 10,
          style: { fontSize: `${vc.categoryTitleFontSize || 14}px`, fontWeight: categoryTitleTextStyleProps.fontWeight, fontFamily: vc.categoryTitleFontFamily || "Arial", fontStyle: categoryTitleTextStyleProps.fontStyle, color: vc.categoryTitleFontColor || "#000000" },
        },
        labels: { style: { fontSize: `${vc.xAxisFontSize || 12}px`, fontFamily: vc.xAxisFontFamily || "Arial", colors: vc.xAxisFontColor || "#000000" } },
        axisBorder: { show: true, color: vc.gridColor || "#E0E0E0" },
        axisTicks: { show: true, color: vc.gridColor || "#E0E0E0" }
      };
      options.yaxis = {
        title: {},
        labels: {
          style: { fontSize: `${vc.yAxisFontSize || 12}px`, fontFamily: vc.yAxisFontFamily || "Arial", colors: vc.yAxisFontColor || "#000000" },
          formatter: function (value) { return typeof value === 'number' ? value.toLocaleString() : value; }
        },
      };
      if(options.dataLabels){ 
        options.dataLabels.textAnchor = 'middle';
        if (chartType === "bar") {
          options.plotOptions = {
            bar: { horizontal: false, columnWidth: '70%', borderRadius: 4, dataLabels: { position: vc.valuePosition || "top" } },
          };
          delete options.dataLabels.offsetY;
          delete options.dataLabels.offsetX;
        } else {
          if (vc.valuePosition === "top") options.dataLabels.offsetY = -10;
          else if (vc.valuePosition === "bottom") options.dataLabels.offsetY = 10;
          else options.dataLabels.offsetY = 0;
          options.dataLabels.offsetX = 0;
        }
      }
      if (chartType === "line") {
        options.stroke.width = vc.borderWidth !== undefined && vc.borderType !== "none" ? vc.borderWidth : 4;
        options.markers = { size: 5, hover: { size: 7 } };
      }
    }
    return options;
  }, [visualizationConfig, getTextStyleProperties]);

  // Effect 1: Fetch raw data when requestPayload (especially query) changes
  useEffect(() => {
    setFetchedData(null);       // Clear previous raw data
    setVisualizationData(null); // Clear previous display data
    setSavedVisualizationId(null); // Reset ID, as this is a new visualization context
    setStatus({ loading: true, error: null });

    if (!requestPayload?.query) {
      setStatus({ loading: false, error: "Query tidak boleh kosong." });
      return;
    }

    const loadRawData = async () => {
      try {
        console.log("Effect 1: Fetching new data due to requestPayload change...");
        const res = await axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/visualisasi-data`, requestPayload);
        const data = res.data?.data;

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("Data kosong atau format tidak sesuai.");
        }
        const [firstRow] = data;
        const keys = Object.keys(firstRow);
        if (keys.length < 2) { // Assuming at least one label and one value column
          throw new Error("Data harus memiliki minimal dua kolom (label dan setidaknya satu nilai).");
        }
        
        setFetchedData({ raw: data, keys: keys });
        setStatus({ loading: false, error: null }); 
      } catch (err) {
        console.error("Effect 1: Error fetching raw visualization data:", err);
        setStatus({
          loading: false,
          error: err.response?.data?.message || err.message || "Terjadi kesalahan saat memuat data mentah visualisasi.",
        });
        setFetchedData(null);
      }
    };
    loadRawData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestPayload]); // Only depends on requestPayload

  const debouncedUpdateVisualization = useDebouncedCallback(
    async (vizId, type, optionsToSave, colorsToSave, currentQuery) => {
        if (!vizId) return;
        try {
            const configPayload = { // Use the global visualizationConfig for base styles
                ...visualizationConfig, 
                colors: colorsToSave, // Override with chart-specific colors used
            };

            if (type && type !== "table" && type !== "card" && optionsToSave) {
                configPayload.visualizationOptions = optionsToSave;
            } else {
                delete configPayload.visualizationOptions; // No options for table/card
            }

            await axios.put(`${config.API_BASE_URL}/api/kelola-dashboard/update-visualization/${vizId}`, {
                visualization_type: type,
                query: currentQuery, 
                config: configPayload,
            });
            console.log(`(Debounced) Visualization (ID: ${vizId}) updated with type ${type}`);
        } catch (error) {
            console.error("Error (Debounced) updating visualization:", error);
        }
    },
    1000 // 1-second debounce
  );

  // Effect 2: Process fetchedData, handle initial save, or update existing visualization
  useEffect(() => {
    if (!fetchedData || !fetchedData.raw || status.loading) {
      // If still loading, or no raw data, or raw data was reset, do nothing here or clear visualization
      if (!status.loading && !fetchedData && visualizationData) setVisualizationData(null);
      return;
    }
    
    console.log("Effect 2: Processing data, current savedID:", savedVisualizationId);
    const { raw: rawData, keys } = fetchedData;
    const [labelKey, ...valueKeys] = keys;

    const currentChartColors = visualizationConfig?.colors || ["#4CAF50", "#FF9800", "#2196F3"];
    let chartOptions = {};
    let chartSeries = {}; // Can be array or object depending on chart type

    if (activeVisualizationType !== "table" && activeVisualizationType !== "card") {
      const categories = rawData.map(item => item[labelKey]);
      chartOptions = getChartOptions(activeVisualizationType, categories, currentChartColors);
      
      const parseValue = val => {
        const parsed = typeof val === "number" ? val : parseFloat(String(val).replace(/,/g, ''));
        return isNaN(parsed) ? 0 : parsed;
      };

      if (activeVisualizationType === "pie" || activeVisualizationType === "donut") {
        chartSeries = rawData.map(item => parseValue(item[valueKeys[0]])); // Use first valueKey for pie/donut
      } else {
        chartSeries = valueKeys.map((key, index) => ({
          name: key,
          data: rawData.map(item => parseValue(item[key])),
          color: currentChartColors[index % currentChartColors.length]
        }));
      }
    }
    
    setVisualizationData({
      rawData, labelKey, valueKeys,
      colors: currentChartColors,
      series: chartSeries,
      options: chartOptions,
      currentType: activeVisualizationType
    });

    // Persist: Initial Save or Update
    const persistConfig = { ...visualizationConfig, colors: currentChartColors };
    if (activeVisualizationType !== "table" && activeVisualizationType !== "card") {
        persistConfig.visualizationOptions = chartOptions;
    } else {
        delete persistConfig.visualizationOptions;
    }

    if (skipConfigUpdateRef.current) {
    skipConfigUpdateRef.current = false;
    return;
  }

    if (!savedVisualizationId) { // Initial Save because savedVisualizationId was reset
      // console.log("Effect 2: Attempting initial save...");
      console.log(
      `Config changed, updating visualization ID ${savedVisualizationId}`
    );
      const savePayload = {
          id_canvas: currentCanvasId, 
          id_visualization: requestPayload.id_visualization,
          id_datasource: requestPayload.id_datasource || 1,
          name: requestPayload.name || visualizationConfig?.title || "Visualisasi Baru",
          visualization_type: activeVisualizationType,
          query: requestPayload.query,
          config: persistConfig,
      };
      axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/save-visualization`, savePayload)
          .then(saveResponse => {
              if (saveResponse.data?.data?.id) {
                  setSavedVisualizationId(saveResponse.data.data.id);
                  console.log(`Effect 2: New visualization (ID: ${saveResponse.data.data.id}) saved.`);
              } else {
                  // console.error("Effect 2: Failed to save new visualization: No ID returned.");
                  // setStatus(prev => ({ ...prev, error: "Gagal menyimpan visualisasi baru."}));
              }
          })
          .catch(error => {
              console.error("Effect 2: Error saving new visualization:", error);
              setStatus(prev => ({ ...prev, error: error.response?.data?.message || error.message || "Error saat menyimpan visualisasi."}));
          });
    } else { // Update existing
      console.log(`Effect 2: Attempting debounced update for ID: ${savedVisualizationId}, type: ${activeVisualizationType}`);
      debouncedUpdateVisualization(
          savedVisualizationId,
          activeVisualizationType,
          chartOptions,
          currentChartColors,
          requestPayload.query 
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fetchedData, // Primary trigger when new raw data is available
    activeVisualizationType, // When type changes
    visualizationConfig, // When global config changes
  ]);

  const handleVisualizationTypeChange = (newType) => {
    // This will trigger Effect 2 because activeVisualizationType is in its dependency array
    setActiveVisualizationType(newType);
  };

  const renderChartControls = () => {
    const chartOptionsList = [
      { type: "bar", label: "Batang" }, { type: "line", label: "Line" },
      { type: "pie", label: "Pie" }, { type: "donut", label: "Donut" },
      { type: "table", label: "Tabel" }, { type: "card", label: "Card" }
    ];
    return (
      <div className="chart-controls flex mb-4 gap-2">
        {chartOptionsList.map((option) => (
          <button
            key={option.type}
            className={`px-3 py-1 rounded text-sm ${activeVisualizationType === option.type ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            onClick={() => handleVisualizationTypeChange(option.type)}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  };

  if (status.loading) return <div className="p-4 text-center">Memuat visualisasi...</div>;

  const chartContainerStyle = {
    backgroundColor: visualizationConfig?.backgroundColor || "#ffffff",
    paddingTop: "1rem",
    paddingLeft: "1rem", 
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
    borderRadius: "8px", 
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)", 
  };

  const chartWrapperStyle = { // Style untuk wrapper chart/table/card agar bisa grow
    flexGrow: 1,
    minHeight: 0, // Penting untuk flex-grow agar bisa menyusut
    position: 'relative', // Kadang dibutuhkan oleh library chart
    overflow: 'hidden' // Agar konten chart tidak meluber keluar wrapper ini
  };

  const scrollableContentWrapperStyle = { // Untuk tabel agar bisa scroll internal
    flexGrow: 1,
    minHeight: 0,
    overflow: 'auto', // Memungkinkan scroll internal untuk tabel/konten panjang
  };

  // Check for primary error or no data condition first
  if (status.error && !visualizationData?.rawData) { // Critical error that prevented data loading
    return (
      <div style={chartContainerStyle}>
         {renderChartControls()}
         <div className="p-4 text-red-600 text-center">Error: {status.error}</div>
      </div>
    );
  }
  if (!visualizationData?.rawData && !status.loading) { // No data available after load attempt
      return (
        <div style={chartContainerStyle}>
            {renderChartControls()}
            <div className="p-4 text-center text-gray-500" style={{minHeight: '300px', display: 'flex', alignItems:'center', justifyContent:'center'}}>
                {requestPayload?.query ? "Tidak ada data untuk ditampilkan atau konfigurasi belum lengkap." : "Silakan jalankan query untuk melihat visualisasi."}
                {status.error && <span className="block text-red-500 mt-2">Detail: {status.error}</span>}
            </div>
        </div>
      );
  }
  
  // If we have data, proceed to render the correct component
  if (!visualizationData) { // Should be caught by loading or error state, but as a fallback
    return <div className="p-4 text-center">Menyiapkan visualisasi...</div>;
  }

  if (activeVisualizationType === "table") { 
    return (
      <div style={chartContainerStyle}>
        {renderChartControls()}
        {status.error && <div className="p-2 mb-2 text-sm text-red-600 bg-red-100 border border-red-300 rounded">Error: {status.error}</div>}
        <div style={chartWrapperStyle}> 
          <DataTableComponent data={visualizationData.rawData} query={requestPayload?.query} />
        </div>
      </div>
    );
  }

  if (activeVisualizationType === "card") {
    return (
      <div style={chartContainerStyle}>
        {renderChartControls()}
        {status.error && <div className="p-2 mb-2 text-sm text-red-600 bg-red-100 border border-red-300 rounded">Error: {status.error}</div>}
        <div style={chartWrapperStyle}> 
          <CardComponent 
            data={visualizationData.rawData} 
            labelKey={visualizationData.labelKey} 
            valueKey={visualizationData.valueKeys[0]}
            visualizationConfig={visualizationConfig}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={chartContainerStyle}>
      {renderChartControls()}
      {status.error && <div className="p-2 mb-2 text-sm text-red-600 bg-red-100 border border-red-300 rounded">Error: {status.error}</div>}
      {visualizationData.options && visualizationData.series && 
       (activeVisualizationType !== "table" && activeVisualizationType !== "card") && (
        <div style={chartWrapperStyle}> 
        <Chart
          options={visualizationData.options}
          series={visualizationData.series}
          type={visualizationData.currentType || "bar"}
          height="100%"
          width="100%"
        />
        </div>
      )}
    </div>
  );
};

export default React.memo(Visualisasi);