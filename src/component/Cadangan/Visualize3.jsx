import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import config from "../config"; // Assuming this path is correct

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

const Visualisasi = ({ requestPayload, visualizationType, visualizationConfig }) => {
  const [visualizationData, setVisualizationData] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: null });
  const [savedVisualizationId, setSavedVisualizationId] = useState(null);
  const [activeVisualizationType, setActiveVisualizationType] = useState(
    visualizationType || requestPayload?.visualizationType || "bar"
  );
  
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
    if (visualizationData) {
      // Only reformat chart data for chart types, not for table or card
      if (newType !== "table" && newType !== "card") {
        reformatChartData(newType, visualizationData.rawData, visualizationData.labelKey, visualizationData.valueKeys, visualizationData.colors);
      }
    }
  };
  
  const reformatChartData = (chartType, rawData, labelKey, valueKeys, currentColors) => {
    if (!rawData) return;

    const categories = rawData.map(item => item[labelKey]);
    const parseValue = val => {
      const parsed = typeof val === "number" ? val : parseFloat(String(val).replace(/,/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    };

    let series;
    const chartColors = visualizationConfig?.colors || currentColors || ["#4CAF50", "#FF9800", "#2196F3"];

    if (chartType === "pie" || chartType === "donut") {
      series = rawData.map(item => parseValue(item[valueKeys[0]]));
    } else {
      series = valueKeys.map((key, index) => ({
        name: key,
        data: rawData.map(item => parseValue(item[key])),
        color: chartColors[index % chartColors.length]
      }));
    }

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
    try {
      const configToSave = {
        ...visualizationConfig,
        colors: currentColors,
      };

      await axios.put(`${config.API_BASE_URL}/api/kelola-dashboard/update-visualization/${savedVisualizationId}`, {
        visualization_type: chartType,
        config: { ...configToSave, visualizationOptions: options },
      });
    } catch (error) {
      console.error("Error updating visualization:", error);
    }
  };

  const getTextStyleProperties = (styleName) => {
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
  };
  
  const getChartOptions = (chartType, categories, chartColors) => {
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
          dataLabels: {
            offset: 0,
            minAngleToShowLabel: 10
          }
        }
      };

      if (chartType === "donut") {
        options.plotOptions.pie.donut = {
          size: '65%', 
          labels: {
            show: vc.showValue !== undefined ? vc.showValue : true,
            name: {
              show: true,
              fontSize: '16px',
              fontFamily: vc.fontFamily || "Arial",
              color: vc.fontColor || "#333333",
              offsetY: -10
            },
            value: {
              show: true,
              fontSize: '20px',
              fontFamily: vc.fontFamily || "Arial",
              color: vc.valueFontColor || "#000000",
              offsetY: 10,
              formatter: function (val) {
                return typeof val === 'number' ? val.toLocaleString() : val;
              }
            },
            total: {
              show: true,
              showAlways: false,
              label: 'Total',
              fontSize: '16px',
              fontFamily: vc.fontFamily || "Arial",
              color: vc.fontColor || "#333333",
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a, b) => {
                  return a + b;
                }, 0);
                return typeof total === 'number' ? total.toLocaleString() : total;
              }
            }
          }
        };
      }

      delete options.dataLabels.offsetY;
      delete options.dataLabels.offsetX;
      options.dataLabels.textAnchor = 'middle';

    } else {
      options.xaxis = {
        categories: categories,
        title: {
          text: vc.categoryTitle || "Kategori",
          offsetY: 10,
          style: {
            fontSize: `${vc.categoryTitleFontSize || 14}px`,
            fontWeight: categoryTitleTextStyleProps.fontWeight,
            fontFamily: vc.categoryTitleFontFamily || "Arial",
            fontStyle: categoryTitleTextStyleProps.fontStyle,
            color: vc.categoryTitleFontColor || "#000000",
          },
        },
        labels: {
          style: {
            fontSize: `${vc.xAxisFontSize || 12}px`,
            fontFamily: vc.xAxisFontFamily || "Arial",
            colors: vc.xAxisFontColor || "#000000",
          },
        },
        axisBorder: { show: true, color: vc.gridColor || "#E0E0E0" },
        axisTicks: { show: true, color: vc.gridColor || "#E0E0E0" }
      };
      options.yaxis = {
        title: {},
        labels: {
          style: {
            fontSize: `${vc.yAxisFontSize || 12}px`,
            fontFamily: vc.yAxisFontFamily || "Arial",
            colors: vc.yAxisFontColor || "#000000",
          },
          formatter: function (value) {
            return typeof value === 'number' ? value.toLocaleString() : value;
          }
        },
      };

      options.dataLabels.textAnchor = 'middle';
      if (chartType === "bar") {
        options.plotOptions = {
          bar: {
            horizontal: false, 
            columnWidth: '70%', 
            borderRadius: 4,
            dataLabels: {
              position: vc.valuePosition || "top", 
            },
          },
        };
        delete options.dataLabels.offsetY;
        delete options.dataLabels.offsetX;
      } else {
        if (vc.valuePosition === "top") options.dataLabels.offsetY = -10;
        else if (vc.valuePosition === "bottom") options.dataLabels.offsetY = 10;
        else options.dataLabels.offsetY = 0;
        options.dataLabels.offsetX = 0;
      }
      
      if (chartType === "line") {
        options.stroke.width = vc.borderWidth !== undefined && vc.borderType !== "none" ? vc.borderWidth : 4;
        options.markers = { 
            size: 5,
            hover: { size: 7 }
        };
      }
    }
    return options;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!requestPayload?.query) {
        setStatus({ loading: false, error: "Query tidak boleh kosong." });
        setVisualizationData(null); 
        return;
      }

      setStatus({ loading: true, error: null });
      setVisualizationData(null); 

      try {
        const res = await axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/visualisasi-data`, requestPayload);
        const data = res.data?.data;

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("Data kosong atau format tidak sesuai.");
        }

        const [firstRow] = data;
        const keys = Object.keys(firstRow);

        if (keys.length < 2) {
          throw new Error("Data harus memiliki minimal dua kolom (label dan setidaknya satu nilai).");
        }

        const [labelKey, ...valueKeys] = keys;
        
        const currentChartColors = visualizationConfig?.colors || ["#4CAF50", "#FF9800", "#2196F3"];
        
        // Store raw data for all visualization types
        setVisualizationData({
          rawData: data,
          labelKey,
          valueKeys,
          colors: currentChartColors
        });
        
        // Only reformat for chart types, not for table or card
        if (activeVisualizationType !== "table" && activeVisualizationType !== "card") {
          reformatChartData(activeVisualizationType, data, labelKey, valueKeys, currentChartColors);
        }
        
        setStatus({ loading: false, error: null });
        
        const categoriesForSave = data.map(item => item[labelKey]);
        const initialOptionsForSave = getChartOptions(activeVisualizationType, categoriesForSave, currentChartColors);

        const visualizationConfigToSave = {
          ...visualizationConfig, 
          colors: currentChartColors,
        };
        
        const savePayload = {
          id_canvas: requestPayload.id_canvas || 1, 
          id_datasource: requestPayload.id_datasource || 1,
          name: requestPayload.name || visualizationConfig?.title || "Visualisasi Baru",
          visualization_type: activeVisualizationType,
          query: requestPayload.query,
          config: visualizationConfigToSave, 
        };
        
        const saveResponse = await axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/save-visualization`, savePayload);

        if (saveResponse.data?.data?.id) {
          setSavedVisualizationId(saveResponse.data.data.id);
        }

      } catch (err) {
        console.error("Error fetching or processing visualization data:", err);
        setStatus({
          loading: false,
          error: err.response?.data?.message || err.message || "Terjadi kesalahan saat memuat data visualisasi.",
        });
        setVisualizationData(null);
      }
    };

    if (requestPayload?.query) {
      fetchData();
    } else {
        setStatus({ loading: false, error: null }); 
        setVisualizationData(null); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestPayload, visualizationConfig]);


  useEffect(() => {
    if (visualizationData && visualizationData.rawData && activeVisualizationType !== "table" && activeVisualizationType !== "card") {
      reformatChartData(
        activeVisualizationType,
        visualizationData.rawData,
        visualizationData.labelKey,
        visualizationData.valueKeys,
        visualizationConfig?.colors || visualizationData.colors 
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVisualizationType]);


  const renderChartControls = () => {
    const chartOptionsList = [
      { type: "bar", label: "Batang" },
      { type: "line", label: "Line" },
      { type: "pie", label: "Pie" },
      { type: "donut", label: "Donut" },
      { type: "table", label: "Tabel" },
      { type: "card", label: "Card" } // Tambahkan opsi Card
    ];

    return (
      <div className="chart-controls flex mb-4 gap-2">
        {chartOptionsList.map((option) => (
          <button
            key={option.type}
            className={`px-3 py-1 rounded text-sm ${
              activeVisualizationType === option.type
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
    backgroundColor: visualizationConfig?.backgroundColor || "#ffffff",
    padding: "1rem", 
    borderRadius: "8px", 
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)", 
  };

  // For table view
  if (activeVisualizationType === "table") { 
    return (
      <div style={chartContainerStyle}>
        {renderChartControls()}
        <DataTableComponent data={visualizationData.rawData} query={requestPayload?.query} />
      </div>
    );
  }

  // For card view
  if (activeVisualizationType === "card") {
    return (
      <div style={chartContainerStyle}>
        {renderChartControls()}
        <CardComponent 
          data={visualizationData.rawData} 
          labelKey={visualizationData.labelKey} 
          valueKey={visualizationData.valueKeys[0]}
          visualizationConfig={visualizationConfig}
        />
      </div>
    );
  }

  // For chart views (bar, line, pie, donut)
  return (
    <div style={chartContainerStyle}>
      {renderChartControls()}
      {visualizationData.options && visualizationData.series && (
        <Chart
          options={visualizationData.options}
          series={visualizationData.series}
          type={visualizationData.currentType || "bar"}
          height={380}
          width="100%"
        />
      )}
    </div>
  );
};

export default React.memo(Visualisasi);