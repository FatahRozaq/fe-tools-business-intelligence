import React, { useEffect, useState, useCallback } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import config from "../config"; // Assuming this path is correct
import { useDebouncedCallback } from 'use-debounce'; // IMPORT use-debounce

// Card Component for displaying single value
const CardComponent = ({ data, labelKey, valueKey, visualizationConfig }) => {
  if (!data || data.length === 0) {
    return <div className="p-4 text-gray-500">Data card tidak tersedia.</div>;
  }

  const firstRow = data[0];
  const label = firstRow[labelKey];
  const value = firstRow[valueKey];
  
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
  
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
  const [fetchedData, setFetchedData] = useState(null);
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
        id: `visualisasi-${currentCanvasIndex}-${currentCanvasId}`,
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
        text: vc.subtitle || "",
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
        show: vc.showLegend !== undefined ? vc.showLegend : true, 
        fontSize: `${vc.legendFontSize || 14}px`,
        fontFamily: vc.legendFontFamily || vc.fontFamily || "Arial",
        fontWeight: vc.legendFontWeight || 400,
        labels: {
          colors: vc.legendFontColor || vc.fontColor || "#333333",
          useSeriesColors: false
        },
        position: vc.legendPosition || 'top', 
        horizontalAlign: vc.legendHorizontalAlign || 'center', 
      },
      dataLabels: {
        enabled: vc.showValue !== undefined ? vc.showValue : true,
        style: {
          fontSize: `${vc.valueLabelFontSize || 12}px`, 
          fontFamily: vc.valueLabelFontFamily || vc.fontFamily || "Arial",
          colors: [vc.valueFontColor || "#000000"],
        },
        background: {
          enabled: false,
        },
        dropShadow: {
          enabled: false,
        },
        formatter: function (val) {
          return typeof val === 'number' ? val.toLocaleString() : val;
        }
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
        enabled: vc.showTooltip !== undefined ? vc.showTooltip : true, 
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
          size: vc.donutSize || '65%', 
          labels: {
            show: vc.showValue !== undefined ? vc.showValue : true,
            name: { show: true, fontSize: `${vc.donutNameFontSize || 16}px`, fontFamily: vc.donutNameFontFamily || vc.fontFamily || "Arial", color: vc.donutNameFontColor || vc.fontColor || "#333333", offsetY: -10 },
            value: {
              show: true, fontSize: `${vc.donutValueFontSize || 20}px`, fontFamily: vc.donutValueFontFamily || vc.fontFamily || "Arial", color: vc.donutValueFontColor || vc.valueFontColor || "#000000", offsetY: 10,
              formatter: function (val) { return typeof val === 'number' ? val.toLocaleString() : val; }
            },
            total: {
              show: vc.donutShowTotal !== undefined ? vc.donutShowTotal : true, 
              showAlways: false, 
              label: vc.donutTotalLabel || 'Total', 
              fontSize: `${vc.donutTotalFontSize || 16}px`, 
              fontFamily: vc.donutTotalFontFamily || vc.fontFamily || "Arial", 
              color: vc.donutTotalFontColor || vc.fontColor || "#333333",
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
        options.dataLabels.formatter = function(val, opts) {
          const seriesName = opts.w.globals.labels[opts.seriesIndex];
          const percentage = opts.w.globals.seriesPercent[opts.seriesIndex][0]; // Assuming single series for pie data
          return `${seriesName}: ${percentage.toFixed(1)}% (${(typeof val === 'number' ? val.toLocaleString() : val)})`;
        }
      }
    } else if (chartType === "heatmap") {
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
        options.yaxis = { // Y-axis labels come from series names in heatmap
            labels: {
                style: { fontSize: `${vc.yAxisFontSize || 12}px`, fontFamily: vc.yAxisFontFamily || "Arial", colors: vc.yAxisFontColor || "#000000" },
                // No specific formatter needed here as series names are used by default.
            },
        };
        options.plotOptions = {
            heatmap: {
                shadeIntensity: vc.heatmapShadeIntensity || 0.65,
                radius: vc.heatmapRadius || 0,
                enableShades: vc.heatmapEnableShades !== undefined ? vc.heatmapEnableShades : true,
                colorScale: {
                    ranges: vc.heatmapColorRanges || [], // User can define vc.heatmapColorRanges in config
                },
                 useFillColorAsStroke: vc.heatmapUseFillColorAsStroke || false
            }
        };
        if (options.dataLabels) { 
            delete options.dataLabels.offsetY;
            delete options.dataLabels.offsetX;
            options.dataLabels.style = {
                ...options.dataLabels.style,
                colors: vc.heatmapValueFontColor ? [vc.heatmapValueFontColor] : (vc.valueFontColor ? [vc.valueFontColor] : ["#333333"])
            };
        }
    } else { // For bar, line, scatter, area etc.
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
        title: {
            text: vc.valueTitle || "", offsetY: 0, // Provide a way to set Y-axis title
            style: { fontSize: `${vc.valueTitleFontSize || 14}px`, fontWeight: getTextStyleProperties(vc.valueTitleTextStyle).fontWeight, fontFamily: vc.valueTitleFontFamily || "Arial", fontStyle: getTextStyleProperties(vc.valueTitleTextStyle).fontStyle, color: vc.valueTitleFontColor || "#000000" },
        },
        labels: {
          style: { fontSize: `${vc.yAxisFontSize || 12}px`, fontFamily: vc.yAxisFontFamily || "Arial", colors: vc.yAxisFontColor || "#000000" },
          formatter: function (value) { return typeof value === 'number' ? value.toLocaleString() : value; }
        },
      };
      
      if(options.dataLabels){ 
        options.dataLabels.textAnchor = 'middle';
        if (chartType === "bar") {
          options.plotOptions = {
            bar: { horizontal: vc.barHorizontal || false, columnWidth: vc.barColumnWidth || '70%', borderRadius: vc.barBorderRadius || 4, dataLabels: { position: vc.valuePosition || "top" } },
          };
          delete options.dataLabels.offsetY;
          delete options.dataLabels.offsetX;
        } else { // line, scatter, area
          if (vc.valuePosition === "top") options.dataLabels.offsetY = -10;
          else if (vc.valuePosition === "bottom") options.dataLabels.offsetY = 10;
          else options.dataLabels.offsetY = 0;
          options.dataLabels.offsetX = 0;
        }
      }
      
      if (chartType === "line") {
        options.stroke.width = vc.borderWidth !== undefined && vc.borderType !== "none" ? vc.borderWidth : (vc.lineWidth || 4);
        options.markers = { size: vc.markerSize || 5, hover: { sizeOffset: vc.markerHoverSizeOffset || 2 } };
      } else if (chartType === "scatter") {
        options.stroke.width = vc.borderWidth !== undefined && vc.borderType !== "none" ? vc.borderWidth : (vc.markerBorderWidth || 1); // For marker borders
        options.markers = { size: vc.markerSize || 6, hover: { sizeOffset: vc.markerHoverSizeOffset || 2 } };
      }
    }
    return options;
  }, [visualizationConfig, getTextStyleProperties, currentCanvasId, currentCanvasIndex]);

  useEffect(() => {
    setFetchedData(null);
    setVisualizationData(null);
    setSavedVisualizationId(null); 
    setStatus({ loading: true, error: null });

    if (!requestPayload?.query) {
      setStatus({ loading: false, error: "Query tidak boleh kosong." });
      return;
    }

    const loadRawData = async () => {
      try {
        const res = await axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/visualisasi-data`, requestPayload);
        const data = res.data?.data;

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("Data kosong atau format tidak sesuai.");
        }
        const [firstRow] = data;
        const keys = Object.keys(firstRow);
        if (keys.length < 1) { // Card can have 1 col, table can have 1, others need >= 2
            if (activeVisualizationType !== 'card' && activeVisualizationType !== 'table' && keys.length < 2) {
                 throw new Error("Data harus memiliki minimal dua kolom (label dan setidaknya satu nilai) untuk tipe chart ini.");
            }
        }
        
        setFetchedData({ raw: data, keys: keys });
        setStatus({ loading: false, error: null }); 
      } catch (err) {
        setStatus({
          loading: false,
          error: err.response?.data?.message || err.message || "Terjadi kesalahan saat memuat data mentah visualisasi.",
        });
        setFetchedData(null);
      }
    };
    loadRawData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestPayload]);

  const debouncedUpdateVisualization = useDebouncedCallback(
    async (vizId, type, optionsToSave, colorsToSave, currentQuery) => {
        if (!vizId) return;
        try {
            const configPayload = {
                ...visualizationConfig, 
                colors: colorsToSave,
            };

            if (type && type !== "table" && type !== "card" && optionsToSave) {
                configPayload.visualizationOptions = optionsToSave;
            } else {
                delete configPayload.visualizationOptions;
            }

            await axios.put(`${config.API_BASE_URL}/api/kelola-dashboard/update-visualization/${vizId}`, {
                visualization_type: type,
                query: currentQuery, 
                config: configPayload,
            });
        } catch (error) {
            console.error("Error (Debounced) updating visualization:", error);
        }
    },
    1000
  );

  const detectDataStructure = (rawData) => {
  if (!rawData || rawData.length === 0) return null;
  
  const firstRow = rawData[0];
  const keys = Object.keys(firstRow);
  
  // Cek apakah ada pola data grouped (3+ kolom dengan kolom yang berisi angka)
  const numericKeys = keys.filter(key => {
    return rawData.some(row => !isNaN(parseFloat(row[key])) && isFinite(row[key]));
  });
  
  const textKeys = keys.filter(key => !numericKeys.includes(key));
  
  // Untuk data time series grouped seperti contoh Anda
  // Format: period_label, month_start, aktivitas, count_pendaftar_id_pendaftar
  if (keys.length >= 3 && numericKeys.length >= 1 && textKeys.length >= 2) {
    
    // Cari kolom yang berisi periode/tanggal untuk sumbu X
    const periodKey = textKeys.find(key => 
      key.toLowerCase().includes('period') || 
      key.toLowerCase().includes('label') ||
      key.toLowerCase().includes('month') ||
      key.toLowerCase().includes('date')
    ) || textKeys[0];
    
    // Cari kolom kategori (biasanya bukan period/date)
    const categoryKey = textKeys.find(key => 
      key !== periodKey && 
      !key.toLowerCase().includes('start') &&
      !key.toLowerCase().includes('end') &&
      !key.toLowerCase().includes('time')
    ) || textKeys.find(key => key !== periodKey);
    
    // Ambil kolom numerik utama (biasanya yang terakhir atau yang mengandung 'count')
    const valueKey = numericKeys.find(key => 
      key.toLowerCase().includes('count') ||
      key.toLowerCase().includes('total') ||
      key.toLowerCase().includes('sum')
    ) || numericKeys[numericKeys.length - 1];
    
    return {
      type: 'grouped',
      labelKey: periodKey,     // Untuk sumbu X (period_label)
      categoryKey: categoryKey, // Untuk grouping (aktivitas)
      valueKey: valueKey,      // Untuk values (count_pendaftar_id_pendaftar)
      structure: { labelKey: periodKey, categoryKey, valueKey }
    };
  }
  
  // Data sederhana: label + value(s)
  return {
    type: 'simple',
    labelKey: keys[0],
    valueKeys: keys.slice(1),
    structure: { labelKey: keys[0], valueKeys: keys.slice(1) }
  };
};

// Perbaikan untuk transformGroupedData
// Perbaikan untuk transformGroupedData dengan pengurutan tanggal yang benar
const transformGroupedData = (rawData, labelKey, categoryKey, valueKey) => {
  // Kelompokkan data berdasarkan kategori
  const grouped = rawData.reduce((acc, item) => {
    const category = item[categoryKey] || 'Tidak Diketahui';
    if (!acc[category]) {
      acc[category] = {};
    }
    acc[category][item[labelKey]] = parseFloat(item[valueKey]) || 0;
    return acc;
  }, {});

  // Dapatkan semua label unik untuk sumbu X
  const allLabels = [...new Set(rawData.map(item => item[labelKey]))];
  
  // Fungsi untuk mendeteksi dan mengurutkan berbagai format tanggal
  const sortDateLabels = (labels) => {
    return labels.sort((a, b) => {
      // Coba parsing berbagai format tanggal
      const parseDate = (dateStr) => {
        if (!dateStr) return new Date(0);
        
        const str = String(dateStr).trim();
        
        // Format: December-24, January-25, etc.
        const monthYearMatch = str.match(/^([A-Za-z]+)-(\d{2,4})$/);
        if (monthYearMatch) {
          const [, monthName, year] = monthYearMatch;
          const fullYear = year.length === 2 ? (parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year)) : parseInt(year);
          return new Date(fullYear, getMonthNumber(monthName), 1);
        }
        
        // Format: 2024-12, 2025-01, etc.
        const yearMonthMatch = str.match(/^(\d{4})-(\d{1,2})$/);
        if (yearMonthMatch) {
          const [, year, month] = yearMonthMatch;
          return new Date(parseInt(year), parseInt(month) - 1, 1);
        }
        
        // Format: 12-2024, 01-2025, etc.
        const monthYearNumMatch = str.match(/^(\d{1,2})-(\d{4})$/);
        if (monthYearNumMatch) {
          const [, month, year] = monthYearNumMatch;
          return new Date(parseInt(year), parseInt(month) - 1, 1);
        }
        
        // Format: Week 1 2024, Week 52 2023, etc.
        const weekMatch = str.match(/^Week\s+(\d+)\s+(\d{4})$/i);
        if (weekMatch) {
          const [, week, year] = weekMatch;
          const date = new Date(parseInt(year), 0, 1);
          date.setDate(date.getDate() + (parseInt(week) - 1) * 7);
          return date;
        }
        
        // Format: Q1 2024, Q2 2024, etc.
        const quarterMatch = str.match(/^Q(\d)\s+(\d{4})$/i);
        if (quarterMatch) {
          const [, quarter, year] = quarterMatch;
          return new Date(parseInt(year), (parseInt(quarter) - 1) * 3, 1);
        }
        
        // Format standar yang bisa diparsing langsung
        const standardDate = new Date(str);
        if (!isNaN(standardDate.getTime())) {
          return standardDate;
        }
        
        // Jika tidak bisa diparse, kembalikan tanggal default
        return new Date(0);
      };
      
      const dateA = parseDate(a);
      const dateB = parseDate(b);
      
      return dateA.getTime() - dateB.getTime();
    });
  };
  
  // Helper function untuk mengkonversi nama bulan ke angka
  const getMonthNumber = (monthName) => {
    const months = {
      'january': 0, 'jan': 0, 'januari': 0,
      'february': 1, 'feb': 1, 'februari': 1,
      'march': 2, 'mar': 2, 'maret': 2,
      'april': 3, 'apr': 3, 'april': 3,
      'may': 4, 'mei': 4,
      'june': 5, 'jun': 5, 'juni': 5,
      'july': 6, 'jul': 6, 'juli': 6,
      'august': 7, 'aug': 7, 'agustus': 7,
      'september': 8, 'sep': 8, 'sept': 8,
      'october': 9, 'oct': 9, 'oktober': 9,
      'november': 10, 'nov': 10,
      'december': 11, 'dec': 11, 'desember': 11
    };
    
    return months[monthName.toLowerCase()] || 0;
  };
  
  // Urutkan labels berdasarkan tanggal
  const sortedLabels = sortDateLabels(allLabels);
  
  console.log('Debug - Original Labels:', allLabels);
  console.log('Debug - Sorted Labels:', sortedLabels);
  console.log('Debug - Grouped Data:', grouped);
  
  // Buat series untuk setiap kategori dengan urutan yang benar
  const series = Object.keys(grouped).map(category => ({
    name: category,
    data: sortedLabels.map(label => grouped[category][label] || 0)
  }));

  console.log('Debug - Series:', series);
  
  return { series, categories: sortedLabels };
};

  useEffect(() => {
  if (!fetchedData || !fetchedData.raw || status.loading) {
    if (!status.loading && !fetchedData && visualizationData) setVisualizationData(null);
    return;
  }
  
  const { raw: rawData, keys } = fetchedData;
  
  console.log('Debug - Raw Data:', rawData);
  console.log('Debug - Keys:', keys);
  
  // Deteksi struktur data
  const dataStructure = detectDataStructure(rawData);
  console.log('Debug - Data Structure:', dataStructure);
  
  if (!dataStructure) {
    setStatus(prev => ({ ...prev, error: "Struktur data tidak dapat dideteksi.", loading: false }));
    return;
  }

  let labelKey, valueKeys, categories, chartSeries;
  const currentChartColors = visualizationConfig?.colors || ["#4CAF50", "#FF9800", "#2196F3", "#F44336", "#9C27B0", "#00BCD4"];

  if (dataStructure.type === 'grouped') {
    // Untuk data yang sudah di-GROUP BY
    const { labelKey: detectedLabelKey, categoryKey, valueKey } = dataStructure.structure;
    labelKey = detectedLabelKey;
    
    console.log('Debug - Using keys:', { labelKey, categoryKey, valueKey });
    
    const transformed = transformGroupedData(rawData, labelKey, categoryKey, valueKey);
    categories = transformed.categories;
    chartSeries = transformed.series.map((series, index) => ({
      ...series,
      color: currentChartColors[index % currentChartColors.length]
    }));
    valueKeys = [valueKey]; // Untuk keperluan lain
    
    console.log('Debug - Final Categories:', categories);
    console.log('Debug - Final Series:', chartSeries);
    
  } else {
    // Untuk data sederhana (existing logic)
    labelKey = dataStructure.structure.labelKey;
    valueKeys = dataStructure.structure.valueKeys;
    
    if ((activeVisualizationType !== 'card' && activeVisualizationType !== 'table') && valueKeys.length === 0) {
      setStatus(prev => ({ ...prev, error: "Data tidak cukup untuk chart. Perlu minimal 1 kolom nilai.", loading: false }));
      setVisualizationData({ rawData, labelKey, valueKeys:[], series:[], options:{}, currentType: activeVisualizationType, colors: [] });
      return;
    }

    categories = rawData.map(item => item[labelKey]);
    
    // Series untuk data sederhana
    const parseValue = val => {
      const parsed = typeof val === "number" ? val : parseFloat(String(val).replace(/,/g, ''));
      return isNaN(parsed) ? (activeVisualizationType === 'heatmap' || activeVisualizationType === 'scatter' ? null : 0) : parsed;
    };

    if (activeVisualizationType === "pie" || activeVisualizationType === "donut") {
      if (valueKeys.length > 0) {
        chartSeries = rawData.map(item => parseValue(item[valueKeys[0]]));
      }
    } else if (activeVisualizationType === "heatmap") {
      chartSeries = valueKeys.map((valueKeyName) => ({
        name: valueKeyName,
        data: rawData.map(row => ({
          x: String(row[labelKey]),
          y: parseValue(row[valueKeyName])
        }))
      }));
    } else {
      chartSeries = valueKeys.map((key, index) => ({
        name: key,
        data: rawData.map(item => parseValue(item[key])),
        color: currentChartColors[index % currentChartColors.length]
      }));
    }
  }

  let chartOptions = {};
  if (activeVisualizationType !== "table" && activeVisualizationType !== "card") {
    chartOptions = getChartOptions(activeVisualizationType, categories, currentChartColors);
  }
  
  setVisualizationData({
    rawData, 
    labelKey, 
    valueKeys,
    colors: currentChartColors,
    series: chartSeries,
    options: chartOptions,
    currentType: activeVisualizationType,
    dataStructure // Simpan info struktur data
  });

    const persistConfig = { ...visualizationConfig, colors: currentChartColors };
    if (activeVisualizationType !== "table" && activeVisualizationType !== "card") {
        persistConfig.visualizationOptions = chartOptions;
    } else {
        delete persistConfig.visualizationOptions;
    }

    if (!savedVisualizationId && currentCanvasId && requestPayload.query) {
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
              }
          })
          .catch(error => {
              console.error("Error saving new visualization:", error);
              setStatus(prev => ({ ...prev, error: error.response?.data?.message || error.message || "Error saat menyimpan visualisasi."}));
          });
    } else if (savedVisualizationId) {
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
    fetchedData, 
    activeVisualizationType, 
    visualizationConfig, 
    // savedVisualizationId is intentionally not here to avoid loop with setSavedVisualizationId
    // currentCanvasId & requestPayload.query ensure save logic runs with these available
    currentCanvasId, requestPayload?.query // Include to re-trigger save if these essential IDs/data change for initial save
    // getChartOptions is memoized
  ]);

  const handleVisualizationTypeChange = (newType) => {
    setActiveVisualizationType(newType === "table" ? "" : newType); // Treat "" as table internally for selection consistency
  };

  const renderChartControls = () => {
    const chartOptionsList = [
      { type: "bar", label: "Batang" }, { type: "line", label: "Garis" },
      { type: "pie", label: "Pie" }, { type: "donut", label: "Donut" },
      { type: "scatter", label: "Scatter" }, { type: "heatmap", label: "Heatmap" },
      { type: "", label: "Tabel" }, { type: "card", label: "Card" } // "" represents Table
    ];
    // Normalize activeVisualizationType for comparison: "" means table.
    const currentSelection = activeVisualizationType === "" ? "" : activeVisualizationType;
    return (
      <div className="chart-controls flex mb-4 gap-2 flex-wrap">
        {chartOptionsList.map((option) => (
          <button
            key={option.type}
            className={`px-3 py-1 rounded text-sm ${currentSelection === option.type ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
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
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
    borderRadius: "8px", 
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)", 
  };

  const chartWrapperStyle = {
    flexGrow: 1,
    minHeight: 0, 
    position: 'relative',
    overflow: 'hidden' 
  };

  if (status.error && !visualizationData?.rawData) {
    return (
      <div style={chartContainerStyle}>
         {renderChartControls()}
         <div className="p-4 text-red-600 text-center flex-grow flex items-center justify-center">Error: {status.error}</div>
      </div>
    );
  }
  if (!visualizationData?.rawData && !status.loading) {
      return (
        <div style={chartContainerStyle}>
            {renderChartControls()}
            <div className="p-4 text-center text-gray-500 flex-grow flex items-center justify-center" style={{minHeight: '200px'}}>
                {requestPayload?.query ? "Tidak ada data untuk ditampilkan atau konfigurasi belum lengkap." : "Silakan jalankan query untuk melihat visualisasi."}
                {status.error && <span className="block text-red-500 mt-2">Detail: {status.error}</span>}
            </div>
        </div>
      );
  }
  
  if (!visualizationData) {
    return (
        <div style={chartContainerStyle}>
             {renderChartControls()}
            <div className="p-4 text-center">Menyiapkan visualisasi...</div>
        </div>
    );
  }
  
  // activeVisualizationType "" (empty string) means Table
  if (activeVisualizationType === "" || activeVisualizationType === "table") { 
    return (
      <div style={chartContainerStyle}>
        {renderChartControls()}
        {status.error && <div className="p-2 mb-2 text-sm text-red-600 bg-red-100 border border-red-300 rounded">Error: {status.error}</div>}
        <div style={{...chartWrapperStyle, overflow: 'auto' }}> 
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
            valueKey={visualizationData.valueKeys[0] || visualizationData.labelKey} // Fallback to labelKey if no valueKeys for single col card
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
       (activeVisualizationType !== "" && activeVisualizationType !== "table" && activeVisualizationType !== "card") && (
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