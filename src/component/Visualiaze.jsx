import React, { useEffect, useState, useCallback, useRef } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import config from "../config";
import { useDebouncedCallback } from 'use-debounce';
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const CardComponent = ({ data, labelKey, valueKey, visualizationConfig}) => {
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
  const [controlsVisible, setControlsVisible] = useState(false);
  
  const [savedVisualizationId, setSavedVisualizationId] = useState(requestPayload?.id_visualization || null);
  const [activeVisualizationType, setActiveVisualizationType] = useState(
    visualizationType || requestPayload?.visualizationType || "bar"
  );
  const [localConfig, setLocalConfig] = useState(visualizationConfig || {});

  const isInitialMount = useRef(true);

  const [userAccessLevel, setUserAccessLevel] = useState('view');
  useEffect(() => {
      const access = localStorage.getItem('access') || 'view' ;
      setUserAccessLevel(access);
      if (access !== 'view') {
          setControlsVisible(true);
      }
    }, []);

  useEffect(() => {
    if (visualizationType) {
      setActiveVisualizationType(visualizationType);
    }
  }, [visualizationType]);

  useEffect(() => {
    setLocalConfig(visualizationConfig || {});
  }, [visualizationConfig]);

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
    const vc = localConfig || {}; 

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
        width: vc.borderWidth !== undefined && vc.borderType !== "none" ? vc.borderWidth : (chartType === 'line' || chartType === 'area' || chartType === 'combo' ? 4 : 1),
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
          const percentage = opts.w.globals.seriesPercent[opts.seriesIndex][0];
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
        options.yaxis = {
            labels: {
                style: { fontSize: `${vc.yAxisFontSize || 12}px`, fontFamily: vc.yAxisFontFamily || "Arial", colors: vc.yAxisFontColor || "#000000" },
            },
        };
        options.plotOptions = {
            heatmap: {
                shadeIntensity: vc.heatmapShadeIntensity || 0.65,
                radius: vc.heatmapRadius || 0,
                enableShades: vc.heatmapEnableShades !== undefined ? vc.heatmapEnableShades : true,
                colorScale: {
                    ranges: vc.heatmapColorRanges || [],
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
        title: {
            text: vc.valueTitle || "", offsetY: 0,
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
        } else {
          if (vc.valuePosition === "top") options.dataLabels.offsetY = -10;
          else if (vc.valuePosition === "bottom") options.dataLabels.offsetY = 10;
          else options.dataLabels.offsetY = 0;
          options.dataLabels.offsetX = 0;
        }
      }
      
      if (chartType === "line" || chartType === 'combo' || chartType === 'area') {
        options.stroke.width = vc.borderWidth !== undefined && vc.borderType !== "none" ? vc.borderWidth : (vc.lineWidth || 4);
        options.markers = { size: vc.markerSize || 5, hover: { sizeOffset: vc.markerHoverSizeOffset || 2 } };
      } else if (chartType === "scatter") {
        options.stroke.width = vc.borderWidth !== undefined && vc.borderType !== "none" ? vc.borderWidth : (vc.markerBorderWidth || 1);
        options.markers = { size: vc.markerSize || 6, hover: { sizeOffset: vc.markerHoverSizeOffset || 2 } };
      }
    }
    return options;
  }, [localConfig, getTextStyleProperties, currentCanvasId, currentCanvasIndex]);

  useEffect(() => {
    setFetchedData(null);
    setVisualizationData(null);
    setSavedVisualizationId(requestPayload?.id_visualization || null); 
    setStatus({ loading: true, error: null });

    isInitialMount.current = true;

    if (!requestPayload?.query) {
      setStatus({ loading: false, error: "Query tidak boleh kosong." });
      return;
    }

    const loadRawData = async () => {
      try {
        if (!requestPayload.id_visualization && !requestPayload.query) {
            setStatus({ loading: false, error: "Tidak ada data untuk ditampilkan." });
            return;
        }

        const res = await axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/visualisasi-data`, requestPayload);
        const data = res.data?.data;

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("Data kosong atau format tidak sesuai.");
        }
        const [firstRow] = data;
        const keys = Object.keys(firstRow);
        if (keys.length < 1) {
          if (activeVisualizationType !== 'card' && activeVisualizationType !== 'table' && keys.length < 2) {
            throw new Error("Data harus memiliki minimal dua kolom untuk tipe chart ini.");
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
  }, [requestPayload]);

  const debouncedSaveOrUpdateVisualization = useDebouncedCallback(
    async (vizId, type, optionsToSave, colorsToSave, currentQuery, configToSave) => {
        const payload = {
            visualization_type: type,
            query: currentQuery, 
            config: { ...configToSave, colors: colorsToSave },
        };

        if (type === "table" || type === "card") {
            delete payload.config.visualizationOptions;
        } else {
            payload.config.visualizationOptions = optionsToSave;
        }

        try {
                const savePayload = {
                    ...payload,
                    id_canvas: currentCanvasId, 
                    id_datasource: requestPayload.id_datasource || 1,
                    name: requestPayload.name || configToSave?.title || "Visualisasi Baru",
                };
                const saveResponse = await axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/save-visualization`, savePayload);
                if (saveResponse.data?.data?.id) {
                    setSavedVisualizationId(saveResponse.data.data.id);
                }
            
        } catch (error) {
            console.error("Error (Debounced) saving/updating visualization:", error);
            setStatus(prev => ({...prev, error: "Gagal menyimpan perubahan."}));
        }
    },
    1500
  );

  const detectDataStructure = (rawData) => {
    if (!rawData || rawData.length === 0) return null;
    
    const firstRow = rawData[0];
    const keys = Object.keys(firstRow);
    
    const numericKeys = keys.filter(key => {
      return rawData.some(row => !isNaN(parseFloat(row[key])) && isFinite(row[key]));
    });
    
    const textKeys = keys.filter(key => !numericKeys.includes(key));
    
    if (keys.length >= 3 && numericKeys.length >= 1 && textKeys.length >= 2) {
      const periodKey = textKeys.find(key => 
        key.toLowerCase().includes('period') || 
        key.toLowerCase().includes('label') ||
        key.toLowerCase().includes('month') ||
        key.toLowerCase().includes('date')
      ) || textKeys[0];
      
      const categoryKey = textKeys.find(key => 
        key !== periodKey && 
        !key.toLowerCase().includes('start') &&
        !key.toLowerCase().includes('end') &&
        !key.toLowerCase().includes('time')
      ) || textKeys.find(key => key !== periodKey);
      
      const valueKey = numericKeys.find(key => 
        key.toLowerCase().includes('count') ||
        key.toLowerCase().includes('total') ||
        key.toLowerCase().includes('sum')
      ) || numericKeys[numericKeys.length - 1];
      
      return {
        type: 'grouped',
        structure: { labelKey: periodKey, categoryKey, valueKey }
      };
    }
    
    return {
      type: 'simple',
      structure: { labelKey: keys[0], valueKeys: keys.slice(1) }
    };
  };

  const transformGroupedData = (rawData, labelKey, categoryKey, valueKey) => {
    const grouped = rawData.reduce((acc, item) => {
      const category = item[categoryKey] || 'Tidak Diketahui';
      if (!acc[category]) {
        acc[category] = {};
      }
      acc[category][item[labelKey]] = parseFloat(item[valueKey]) || 0;
      return acc;
    }, {});

    const allLabels = [...new Set(rawData.map(item => item[labelKey]))];
    
    const sortDateLabels = (labels) => {
      return labels.sort((a, b) => {
        const parseDate = (dateStr) => {
          if (!dateStr) return new Date(0);
          const str = String(dateStr).trim();
          
          const monthYearMatch = str.match(/^([A-Za-z]+)-(\d{2,4})$/);
          if (monthYearMatch) {
            const [, monthName, year] = monthYearMatch;
            const fullYear = year.length === 2 ? (parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year)) : parseInt(year);
            return new Date(fullYear, getMonthNumber(monthName), 1);
          }
          
          const yearMonthMatch = str.match(/^(\d{4})-(\d{1,2})$/);
          if (yearMonthMatch) {
            const [, year, month] = yearMonthMatch;
            return new Date(parseInt(year), parseInt(month) - 1, 1);
          }
          
          const monthYearNumMatch = str.match(/^(\d{1,2})-(\d{4})$/);
          if (monthYearNumMatch) {
            const [, month, year] = monthYearNumMatch;
            return new Date(parseInt(year), parseInt(month) - 1, 1);
          }

          const weekMatch = str.match(/^Week\s+(\d+)\s+(\d{4})$/i);
          if (weekMatch) {
              const [, week, year] = weekMatch;
              const date = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7);
              return date;
          }

          const quarterMatch = str.match(/^Q(\d)\s+(\d{4})$/i);
          if (quarterMatch) {
              const [, quarter, year] = quarterMatch;
              return new Date(parseInt(year), (parseInt(quarter) - 1) * 3, 1);
          }
          
          const standardDate = new Date(str);
          if (!isNaN(standardDate.getTime())) return standardDate;
          
          return new Date(0);
        };
        
        return parseDate(a).getTime() - parseDate(b).getTime();
      });
    };
    
    const getMonthNumber = (monthName) => {
      const months = {'january':0,'jan':0,'januari':0,'february':1,'feb':1,'februari':1,'march':2,'mar':2,'maret':2,'april':3,'apr':3,'april':3,'may':4,'mei':4,'june':5,'jun':5,'juni':5,'july':6,'jul':6,'juli':6,'august':7,'aug':7,'agustus':7,'september':8,'sep':8,'sept':8,'october':9,'oct':9,'oktober':9,'november':10,'nov':10,'december':11,'dec':11,'desember':11};
      return months[monthName.toLowerCase()] ?? 0;
    };
    
    const sortedLabels = sortDateLabels(allLabels);
    
    const series = Object.keys(grouped).map(category => ({
      name: category,
      data: sortedLabels.map(label => grouped[category][label] || 0)
    }));

    return { series, categories: sortedLabels };
  };

  useEffect(() => {
    if (!fetchedData || !fetchedData.raw || status.loading) {
      if (!status.loading && !fetchedData && visualizationData) setVisualizationData(null);
      return;
    }
  
    const { raw: rawData, keys } = fetchedData;
    const dataStructure = detectDataStructure(rawData);

    if (!dataStructure) {
      setStatus(prev => ({ ...prev, error: "Struktur data tidak dapat dideteksi.", loading: false }));
      return;
    }

    let labelKey, valueKeys, categories, chartSeries;
    const currentChartColors = localConfig?.colors || ["#4CAF50", "#FF9800", "#2196F3", "#F44336", "#9C27B0", "#00BCD4"];

    const parseValue = val => {
      const parsed = typeof val === "number" ? val : parseFloat(String(val).replace(/,/g, ''));
      return isNaN(parsed) ? null : parsed;
    };

    if (dataStructure.type === 'grouped') {
        const { labelKey: detectedLabelKey, categoryKey, valueKey } = dataStructure.structure;
        labelKey = detectedLabelKey;
        const transformed = transformGroupedData(rawData, labelKey, categoryKey, valueKey);
        categories = transformed.categories;
        valueKeys = transformed.series.map(s => s.name);

        if (activeVisualizationType === 'combo') {
            chartSeries = transformed.series.map((s, index) => {
                const seriesCfg = localConfig.seriesConfig?.find(sc => sc.name === s.name);
                return {
                    ...s,
                    type: seriesCfg?.type || 'bar',
                    color: currentChartColors[index % currentChartColors.length]
                };
            });
        } else {
            chartSeries = transformed.series.map((s, index) => ({
                ...s,
                color: currentChartColors[index % currentChartColors.length]
            }));
        }
    } else {
        labelKey = dataStructure.structure.labelKey;
        valueKeys = dataStructure.structure.valueKeys;
        if ((activeVisualizationType !== 'card' && activeVisualizationType !== 'table') && valueKeys.length === 0) {
          setStatus(prev => ({ ...prev, error: "Data tidak cukup untuk chart. Perlu minimal 1 kolom nilai.", loading: false }));
          setVisualizationData({ rawData, labelKey, valueKeys:[], series:[], options:{}, currentType: activeVisualizationType, colors: [] });
          return;
        }
        categories = rawData.map(item => item[labelKey]);
        
        const parseValue = val => {
        const parsed = typeof val === "number" ? val : parseFloat(String(val).replace(/,/g, ''));
        return isNaN(parsed) ? (activeVisualizationType === 'heatmap' || activeVisualizationType === 'scatter' ? null : 0) : parsed;
        };
        
        if (activeVisualizationType === "combo") {
            chartSeries = valueKeys.map((key, index) => {
                const seriesCfg = localConfig.seriesConfig?.find(s => s.name === key);
                return {
                    name: key,
                    type: seriesCfg?.type || 'bar',
                    data: rawData.map(item => parseValue(item[key])),
                    color: currentChartColors[index % currentChartColors.length]
                };
            });
        } else if (activeVisualizationType === "pie" || activeVisualizationType === "donut") {
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
      dataStructure
    });

    if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
    }
    
    debouncedSaveOrUpdateVisualization(
        savedVisualizationId,
        activeVisualizationType,
        chartOptions,
        currentChartColors,
        requestPayload.query,
        localConfig
    );

  }, [
    fetchedData, 
    activeVisualizationType, 
    localConfig
  ]);

  const handleVisualizationTypeChange = (newType) => {
    setActiveVisualizationType(newType === "table" ? "" : newType);
  };

  const handleSeriesTypeChange = (seriesName, newType) => {
    setLocalConfig(prevConfig => {
        const existingSeriesConfig = prevConfig.seriesConfig || [];
        const seriesExists = existingSeriesConfig.some(s => s.name === seriesName);
        let newSeriesConfig;

        if (seriesExists) {
            newSeriesConfig = existingSeriesConfig.map(s => 
                s.name === seriesName ? { ...s, type: newType } : s
            );
        } else {
            newSeriesConfig = [...existingSeriesConfig, { name: seriesName, type: newType }];
        }
        
        return { ...prevConfig, seriesConfig: newSeriesConfig };
    });
  };

  const renderChartControls = () => {
    const chartOptionsList = [
        { type: "bar", label: "Batang" }, 
        { type: "line", label: "Garis" },
        { type: "area", label: "Area" },
        { type: "pie", label: "Pie" }, 
        { type: "donut", label: "Donut" },
        { type: "scatter", label: "Scatter" }, 
        { type: "heatmap", label: "Heatmap" },
        { type: "combo", label: "Kombinasi" },
        { type: "", label: "Tabel" }, 
        { type: "card", label: "Card" }
    ];

    const comboSeriesOptions = [
        { type: "bar", label: "Batang"},
        { type: "line", label: "Garis"},
        { type: "area", label: "Area"},
        { type: "scatter", label: "Scatter"},
    ];
    
    const currentSelection = activeVisualizationType === "" ? "table" : activeVisualizationType;
    
    return (
        <div className="chart-controls p-3 mb-4 border border-gray-200 rounded-md bg-gray-50/50 backdrop-blur-sm shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Visualisasi:
            </label>
            <select
                value={currentSelection}
                onChange={(e) => handleVisualizationTypeChange(e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
                {chartOptionsList.map((option) => (
                    <option key={option.type} value={option.type}>
                    {option.label}
                    </option>
                ))}
            </select>

            {activeVisualizationType === 'combo' && visualizationData?.valueKeys && (
                <div className="mt-4 p-3 border border-gray-200 rounded-md bg-gray-50">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Konfigurasi Seri Kombinasi</h4>
                    <div className="space-y-2">
                        {visualizationData.valueKeys.map(key => {
                            const currentSeriesConfig = localConfig.seriesConfig?.find(s => s.name === key);
                            const currentSeriesType = currentSeriesConfig?.type || 'bar';

                            return (
                                <div key={key} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 font-medium">{key}</span>
                                    <select 
                                        value={currentSeriesType}
                                        onChange={(e) => handleSeriesTypeChange(key, e.target.value)}
                                        className="w-1/2 max-w-xs px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                    >
                                        {comboSeriesOptions.map(opt => (
                                            <option key={opt.type} value={opt.type}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

  const chartContainerStyle = {
    backgroundColor: localConfig?.backgroundColor || "#ffffff",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
    borderRadius: "8px", 
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)", 
    position: 'relative'
  };

  const chartWrapperStyle = {
    flexGrow: 1,
    minHeight: 0, 
    position: 'relative',
    overflow: 'hidden' 
  };

  const toggleButtonStyle = {
    position: 'absolute',
    top: '12px',
    left: '12px',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(4px)',
    border: '1px solid #e0e0e0',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  };
  
  if (status.loading) return <div className="p-4 text-center">Memuat visualisasi...</div>;

  if (status.error && !visualizationData?.rawData) {
    return (
      <div style={chartContainerStyle}>
         {userAccessLevel !== 'view' && renderChartControls()}
         <div className="p-4 text-red-600 text-center flex-grow flex items-center justify-center">Error: {status.error}</div>
      </div>
    );
  }
  if (!visualizationData?.rawData && !status.loading) {
      return (
        <div style={chartContainerStyle}>
            {userAccessLevel !== 'view' && renderChartControls()}
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
             {userAccessLevel !== 'view' && renderChartControls()}
            <div className="p-4 text-center">Menyiapkan visualisasi...</div>
        </div>
    );
  }

  const renderContent = () => {
    if (activeVisualizationType === "" || activeVisualizationType === "table") {
        return (
            <div style={{...chartWrapperStyle, overflow: 'auto' }}> 
                <DataTableComponent data={visualizationData.rawData} query={requestPayload?.query} />
            </div>
        );
    }
    
    if (activeVisualizationType === "card") {
        return (
            <div style={chartWrapperStyle}> 
                <CardComponent 
                    data={visualizationData.rawData} 
                    labelKey={visualizationData.labelKey} 
                    valueKey={visualizationData.valueKeys[0] || visualizationData.labelKey}
                    visualizationConfig={localConfig}
                />
            </div>
        );
    }
  
    if (visualizationData.options && visualizationData.series) {
        return (
            <div style={chartWrapperStyle}> 
                <Chart
                    options={visualizationData.options}
                    series={visualizationData.series}
                    type={activeVisualizationType === 'combo' ? 'line' : visualizationData.currentType || 'bar'}
                    height="100%"
                    width="100%"
                />
            </div>
        );
    }

    return null;
  };

  return (
    <div style={chartContainerStyle}>
        {userAccessLevel !== 'view' && (
            <button
                style={toggleButtonStyle}
                onClick={() => setControlsVisible(!controlsVisible)}
                title={controlsVisible ? "Sembunyikan Opsi" : "Tampilkan Opsi"}
              >
                {controlsVisible ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
              </button>
        )}

        {userAccessLevel !== 'view' && controlsVisible && renderChartControls()}
      
        {status.error && <div className="p-2 mb-2 text-sm text-red-600 bg-red-100 border border-red-300 rounded">Error: {status.error}</div>}
      
        {renderContent()}
    </div>
  );
};

export default React.memo(Visualisasi);