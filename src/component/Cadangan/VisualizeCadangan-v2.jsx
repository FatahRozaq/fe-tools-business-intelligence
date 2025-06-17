import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import config from "../config"; // Assuming this path is correct

// DataTableComponent remains the same
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

// New CardComponent
const CardComponent = ({ data, labelKey, valueKeys, config: vizConfigProp }) => {
  const vc = vizConfigProp || {};

  if (!data || data.length === 0) {
    return <div className="p-4 text-gray-500">Data kartu tidak tersedia.</div>;
  }

  // For simplicity, card usually shows a single aggregated value or key metric.
  // We'll use the first row and the first valueKey.
  // More complex logic could be added here based on specific card requirements or configurations.
  const firstRecord = data[0];
  const primaryValueKey = valueKeys && valueKeys.length > 0 ? valueKeys[0] : null;
  
  const displayValue = primaryValueKey && firstRecord.hasOwnProperty(primaryValueKey)
    ? firstRecord[primaryValueKey]
    : "N/A";
  
  const displayLabel = labelKey && firstRecord.hasOwnProperty(labelKey)
    ? firstRecord[labelKey]
    : (vc.title || "Metrik"); // Fallback label

  const cardStyle = {
    backgroundColor: vc.cardBackgroundColor || vc.backgroundColor || "#f9fafb", // Light gray fallback
    color: vc.cardTextColor || vc.fontColor || "#1f2937", // Dark gray fallback
    padding: vc.cardPadding || "20px",
    borderRadius: vc.cardBorderRadius || "8px",
    textAlign: vc.cardTextAlign || "center",
    fontFamily: vc.fontFamily || "Arial",
    // boxShadow: "0 2px 4px rgba(0,0,0,0.1)", // Optional shadow
  };

  const valueStyle = {
    fontSize: vc.cardValueFontSize || "2.5rem",
    fontWeight: vc.cardValueFontWeight || "bold",
    color: vc.cardValueColor || vc.valueFontColor || (vc.colors ? vc.colors[0] : "#2563eb"), // Use first series color or blue
    lineHeight: "1.2",
  };

  const labelStyle = {
    fontSize: vc.cardLabelFontSize || "1rem",
    color: vc.cardLabelColor || vc.fontColor || "#6b7280", // Medium gray fallback
    marginTop: "8px",
  };

  return (
    <div style={cardStyle} className="flex flex-col items-center justify-center h-full">
      {vc.title && <h3 className="text-lg font-semibold mb-2" style={{color: vc.titleFontColor || cardStyle.color}}>{vc.title}</h3>}
      {vc.subtitle && <p className="text-sm text-gray-500 mb-4" style={{color: vc.subtitleFontColor || labelStyle.color}}>{vc.subtitle}</p>}
      
      <div style={valueStyle}>
        {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
      </div>
      <div style={labelStyle}>
        {displayLabel}
      </div>
    </div>
  );
};


const Visualisasi = ({ requestPayload, visualizationType, visualizationConfig }) => {
  const [visualizationData, setVisualizationData] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: null });
  const [savedVisualizationId, setSavedVisualizationId] = useState(null);
  const [activeVisualizationType, setActiveVisualizationType] = useState(
    visualizationType || requestPayload?.visualizationType || "bar"
  );
  
  const parseValue = val => {
    const parsed = typeof val === "number" ? val : parseFloat(String(val).replace(/,/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  useEffect(() => {
    if (visualizationType) {
      setActiveVisualizationType(visualizationType);
    }
  }, [visualizationType]);

  useEffect(() => {
    setVisualizationData(null);
    setSavedVisualizationId(null);
    setStatus({ loading: true, error: null });
  }, [requestPayload]);

  const handleVisualizationTypeChange = (newType) => {
    setActiveVisualizationType(newType);
    // No explicit reformat call needed here, useEffect for activeVisualizationType will handle it
  };
  
  const reformatDataAndUpdate = (chartType, rawData, labelKey, valueKeys, currentColorsConfig) => {
    if (!rawData) return;

    const categories = rawData.map(item => item[labelKey]);
    const chartColors = (visualizationConfig || {}).colors || currentColorsConfig || ["#4CAF50", "#FF9800", "#2196F3"];
    let series;

    if (chartType === "pie" || chartType === "donut") {
      series = rawData.map(item => parseValue(item[valueKeys[0]]));
    } else if (chartType !== "table" && chartType !== "card") { 
      series = valueKeys.map((key, index) => ({
        name: key,
        data: rawData.map(item => parseValue(item[key])),
        color: chartColors[index % chartColors.length]
      }));
    } else {
      series = []; // No series data needed for table or card type in ApexCharts
    }

    // For 'card', options might be minimal but still generated for consistency in saving.
    const updatedOptions = getChartOptions(chartType, categories, chartColors);

    setVisualizationData({
      rawData,
      labelKey,
      valueKeys,
      colors: chartColors,
      series: series,
      options: updatedOptions,
      currentType: chartType
    });

    if (savedVisualizationId) {
      updateSavedVisualization(chartType, updatedOptions, chartColors);
    }
  };

  const updateSavedVisualization = async (chartType, options, currentColors) => {
    if (!savedVisualizationId) return;
    try {
      const baseConfig = visualizationConfig || {};
      const configToSave = {
        ...baseConfig,
        colors: currentColors,
        visualizationOptions: options, 
      };
      await axios.put(`${config.API_BASE_URL}/api/kelola-dashboard/update-visualization/${savedVisualizationId}`, {
        visualization_type: chartType,
        config: configToSave,
      });
    } catch (error) {
      console.error("Error updating visualization:", error);
    }
  };

  const getTextStyleProperties = (styleName) => {
    const properties = { fontWeight: "normal", fontStyle: "normal", textDecoration: "none" };
    if (styleName === "italic") properties.fontStyle = "italic";
    else if (styleName === "underline") properties.textDecoration = "underline";
    return properties;
  };
  
  const getChartOptions = (chartType, categories, chartColors) => {
    const vc = visualizationConfig || {}; 
    const titleTextStyleProps = getTextStyleProperties(vc.titleTextStyle);
    const subtitleTextStyleProps = getTextStyleProperties(vc.subtitleTextStyle);
    const categoryTitleTextStyleProps = getTextStyleProperties(vc.categoryTitleTextStyle);

    // Base options applicable to most types (including card for title/subtitle)
    const options = {
      chart: { id: "visualisasi", background: vc.backgroundColor || "#ffffff", fontFamily: vc.fontFamily || "Arial", foreColor: vc.fontColor || "#333333" },
      colors: chartColors, // Card might use this for its value color if not specified
      title: { text: vc.title || "Visualisasi Data", align: vc.titlePosition || "center", margin: 10,offsetX: 0,offsetY: 0,floating: false,style: { fontSize: `${vc.titleFontSize || 18}px`, fontWeight: titleTextStyleProps.fontWeight, fontFamily: vc.titleFontFamily || "Arial", fontStyle: titleTextStyleProps.fontStyle, color: vc.titleFontColor || "#333333" } },
      subtitle: { text: vc.subtitle || "Sub Judul Visualisasi", align: vc.subtitlePosition || "center", margin: 10, offsetX: 0, offsetY: vc.titleFontSize ? (parseInt(String(vc.titleFontSize).replace('px',''), 10) + 10) : 30, floating: false, style: { fontSize: `${vc.subtitleFontSize || 14}px`, fontWeight: subtitleTextStyleProps.fontWeight, fontFamily: vc.subtitleFontFamily || "Arial", fontStyle: subtitleTextStyleProps.fontStyle, color: vc.subtitleFontColor || "#333333" } },
      // These are chart-specific, so they will be added conditionally
      grid: {}, fill: {}, legend: {}, dataLabels: {}, stroke: {}, tooltip: { enabled: true, theme: 'light' },
    };

    // Remove or make chart-specific options conditional
    if (chartType !== "card" && chartType !== "table") {
      options.grid = { show: vc.gridType !== "none" && chartType !== "pie" && chartType !== "donut", borderColor: vc.gridColor || "#E0E0E0", strokeDashArray: vc.gridType === "dashed" ? 4 : (vc.gridType === "dotted" ? 2 : 0), position: 'back', xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } };
      options.fill = { type: vc.pattern === "solid" ? "solid" : "pattern", pattern: { style: vc.pattern === "striped" ? "horizontalLines" : (vc.pattern === "dotted" ? "circles" : undefined), width: vc.pattern === "solid" ? undefined : 6, height: vc.pattern === "solid" ? undefined : 6, strokeWidth: vc.pattern === "solid" ? undefined : 2,}, };
      options.legend = { show: true, fontSize: `${vc.fontSize || 14}px`, fontFamily: vc.fontFamily || "Arial", fontWeight: 400, labels: { colors: vc.fontColor || "#333333", useSeriesColors: false }, position: 'top', horizontalAlign: 'center' };
      options.dataLabels = { enabled: vc.showValue !== undefined ? vc.showValue : true, style: { fontSize: '12px', fontFamily: vc.fontFamily || "Arial", colors: [vc.valueFontColor || "#000000"] }, background: { enabled: false }, dropShadow: { enabled: false } };
      options.stroke = { show: vc.borderType !== "none", width: vc.borderWidth !== undefined && vc.borderType !== "none" ? vc.borderWidth : (chartType === 'line' ? 4 : 1), colors: vc.borderType !== "none" ? [vc.borderColor || "#000000"] : undefined, curve: 'smooth', lineCap: 'butt', dashArray: vc.borderType === "dashed" ? 4 : (vc.borderType === "dotted" ? 2 : 0), };
    } else {
      // For card and table, remove/disable options not applicable
      delete options.grid;
      delete options.fill;
      delete options.legend;
      delete options.dataLabels; // Card handles its own labels
      delete options.stroke;
      if (chartType === "card" || chartType === "table") {
        options.tooltip = { enabled: false }; // Tooltip not usually for card/table
      }
    }


    if (chartType === "pie" || chartType === "donut") {
      options.labels = categories;
      options.plotOptions = { pie: { dataLabels: { offset: 0, minAngleToShowLabel: 10 } } };
      if (chartType === "donut") {
        options.plotOptions.pie.donut = { size: '65%', labels: { show: vc.showValue !== undefined ? vc.showValue : true, name: { show: true, fontSize: '16px', fontFamily: vc.fontFamily || "Arial", color: vc.fontColor || "#333333", offsetY: -10 }, value: { show: true, fontSize: '20px', fontFamily: vc.fontFamily || "Arial", color: vc.valueFontColor || "#000000", offsetY: 10, formatter: function (val) { return typeof val === 'number' ? val.toLocaleString() : val; } }, total: { show: true, showAlways: false, label: 'Total', fontSize: '16px', fontFamily: vc.fontFamily || "Arial", color: vc.fontColor || "#333333", formatter: function (w) { const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0); return typeof total === 'number' ? total.toLocaleString() : total; } } } };
      }
      if(options.dataLabels){ // Ensure dataLabels exists before trying to delete from it
        delete options.dataLabels.offsetY; delete options.dataLabels.offsetX; options.dataLabels.textAnchor = 'middle';
      }
    } else if (chartType !== "table" && chartType !== "card") { 
      options.xaxis = { categories: categories, title: { text: vc.categoryTitle || "Kategori", offsetY: 1, style: { fontSize: `${vc.categoryTitleFontSize || 14}px`, fontWeight: categoryTitleTextStyleProps.fontWeight, fontFamily: vc.categoryTitleFontFamily || "Arial", fontStyle: categoryTitleTextStyleProps.fontStyle, color: vc.categoryTitleFontColor || "#000000" } }, labels: { style: { fontSize: `${vc.xAxisFontSize || 12}px`, fontFamily: vc.xAxisFontFamily || "Arial", colors: vc.xAxisFontColor || "#000000" } }, axisBorder: { show: true, color: vc.gridColor || "#E0E0E0" }, axisTicks: { show: true, color: vc.gridColor || "#E0E0E0" } };
      options.yaxis = { title: {}, labels: { style: { fontSize: `${vc.yAxisFontSize || 12}px`, fontFamily: vc.yAxisFontFamily || "Arial", colors: vc.yAxisFontColor || "#000000" }, formatter: function (value) { return typeof value === 'number' ? value.toLocaleString() : value; } } };
      if(options.dataLabels){
         options.dataLabels.textAnchor = 'middle';
      }
      if (chartType === "bar") {
        options.plotOptions = { bar: { horizontal: false, columnWidth: '70%', borderRadius: 4, dataLabels: { position: vc.valuePosition || "top" } } };
        if(options.dataLabels){
            delete options.dataLabels.offsetY; delete options.dataLabels.offsetX;
        }
      } else if (options.dataLabels) { // Check if dataLabels exists
        if (vc.valuePosition === "top") options.dataLabels.offsetY = -10;
        else if (vc.valuePosition === "bottom") options.dataLabels.offsetY = 10;
        else options.dataLabels.offsetY = 0;
        options.dataLabels.offsetX = 0;
      }
      if (chartType === "line") {
        options.stroke.width = vc.borderWidth !== undefined && vc.borderType !== "none" ? vc.borderWidth : 4; // Ensure stroke exists
        options.markers = { size: 5, hover: { size: 7 } };
      }
    }
    return options;
  };

  useEffect(() => {
    const fetchDataAndSaveInitially = async () => {
      if (!requestPayload?.query) {
        setStatus({ loading: false, error: "Query tidak boleh kosong." });
        setVisualizationData(null); return;
      }
      setStatus({ loading: true, error: null });
      setVisualizationData(null); 

      try {
        const res = await axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/visualisasi-data`, requestPayload);
        const data = res.data?.data;
        if (!Array.isArray(data) || data.length === 0) throw new Error("Data kosong atau format tidak sesuai.");
        
        const [firstRow] = data;
        const keys = Object.keys(firstRow);
        if (keys.length < (activeVisualizationType === "card" ? 1 : 2) ) { // Card might only need one column if label is static
             throw new Error( activeVisualizationType === "card" ? "Data untuk kartu minimal memiliki satu kolom nilai." : "Data harus memiliki minimal dua kolom.");
        }

        // For card, if only one column, it's value. If two, first is label, second is value.
        // For others, first is label, rest are values.
        let labelKey, valueKeys;
        if (activeVisualizationType === "card") {
            if (keys.length === 1) {
                labelKey = "Label Kartu"; // Default or configured static label
                valueKeys = [keys[0]];
            } else {
                [labelKey, ...valueKeys] = keys;
            }
        } else {
             [labelKey, ...valueKeys] = keys;
        }

        const currentChartColors = (visualizationConfig || {}).colors || ["#4CAF50", "#FF9800", "#2196F3"];
        const initialCategories = data.map(item => item[labelKey]); // May be undefined for single-column card, handled by CardComponent
        const initialOptions = getChartOptions(activeVisualizationType, initialCategories, currentChartColors);
        
        let initialSeries;
        if (activeVisualizationType === "pie" || activeVisualizationType === "donut") {
            initialSeries = data.map(item => parseValue(item[valueKeys[0]]));
        } else if (activeVisualizationType !== "table" && activeVisualizationType !== "card") {
            initialSeries = valueKeys.map((key, index) => ({
                name: key,
                data: data.map(item => parseValue(item[key])),
                color: currentChartColors[index % currentChartColors.length]
            }));
        } else {
            initialSeries = [];
        }

        setVisualizationData({
          rawData: data, labelKey, valueKeys, colors: currentChartColors,
          series: initialSeries, options: initialOptions, currentType: activeVisualizationType
        });
        setStatus({ loading: false, error: null });

        const configForInitialSave = {
          ...(visualizationConfig || {}),
          colors: currentChartColors,
          visualizationOptions: initialOptions,
        };
        
        const savePayload = {
          id_canvas: requestPayload.id_canvas || 1, 
          id_datasource: requestPayload.id_datasource || 1,
          name: requestPayload.name || (visualizationConfig || {}).title || "Visualisasi Baru",
          visualization_type: activeVisualizationType,
          query: requestPayload.query,
          config: configForInitialSave, 
        };
        
        const saveResponse = await axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/save-visualization`, savePayload);
        if (saveResponse.data?.data?.id) {
          setSavedVisualizationId(saveResponse.data.data.id);
        }

      } catch (err) {
        console.error("Error fetching/processing/saving initial visualization:", err);
        setStatus({ loading: false, error: err.response?.data?.message || err.message || "Terjadi kesalahan." });
        setVisualizationData(null);
      }
    };

    if (requestPayload?.query) {
      fetchDataAndSaveInitially();
    } else {
      setStatus({ loading: false, error: null }); 
      setVisualizationData(null); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestPayload]); 

  useEffect(() => {
    if (visualizationData && visualizationData.rawData && activeVisualizationType) {
      reformatDataAndUpdate(
        activeVisualizationType,
        visualizationData.rawData,
        visualizationData.labelKey,
        visualizationData.valueKeys,
        visualizationData.colors 
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVisualizationType, visualizationConfig]); 


  const renderChartControls = () => { 
    const chartOptionsList = [
      { type: "bar", label: "Batang" }, { type: "line", label: "Line" },
      { type: "pie", label: "Pie" }, { type: "donut", label: "Donut" },
      { type: "table", label: "Tabel" },
      { type: "card", label: "Kartu" } // Added Card option
    ];
    return (
      <div className="chart-controls flex mb-4 gap-2 flex-wrap"> {/* Added flex-wrap */}
        {chartOptionsList.map((option) => (
          <button
            key={option.type} type="button"
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              activeVisualizationType === option.type
                ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700 focus:ring-indigo-500"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 focus:ring-slate-400"
            }`}
            onClick={() => handleVisualizationTypeChange(option.type)}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  };

  if (status.loading) return <div className="p-4 text-center">Memuat visualisasi...</div>;
  if (status.error) return <div className="p-4 text-red-600 text-center">Error: {status.error}</div>;
  if (!visualizationData || !visualizationData.rawData) { 
    return (
      <div className="p-4 text-center text-gray-500" style={{minHeight: '300px', display: 'flex', alignItems:'center', justifyContent:'center'}}>
        {requestPayload?.query ? "Tidak ada data untuk ditampilkan atau konfigurasi belum lengkap." : "Silakan jalankan query untuk melihat visualisasi."}
      </div>
    );
  }
  
  const chartContainerStyle = { 
    backgroundColor: (visualizationConfig || {}).backgroundColor || "#ffffff",
    padding: "1rem", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", 
    minHeight: '300px', // Ensure container has some height
    display: 'flex',
    flexDirection: 'column',
    margin: '-10px'
  };

  return (
    <div style={chartContainerStyle}>
      {renderChartControls()}
      <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}> {/* Added wrapper for centering content */}
        {activeVisualizationType === "table" && (
          <DataTableComponent data={visualizationData.rawData} query={requestPayload?.query} />
        )}
        {activeVisualizationType === "card" && (
          <CardComponent
            data={visualizationData.rawData}
            labelKey={visualizationData.labelKey}
            valueKeys={visualizationData.valueKeys}
            config={visualizationConfig} // Pass the full visualizationConfig
          />
        )}
        {activeVisualizationType !== "table" && activeVisualizationType !== "card" && visualizationData.options && visualizationData.series && (
          <Chart
            options={visualizationData.options}
            series={visualizationData.series}
            type={visualizationData.currentType || "bar"}
            height={400} // Make chart fill the available space
            width={400}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(Visualisasi);