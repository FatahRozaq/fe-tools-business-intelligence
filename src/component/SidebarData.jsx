import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import config from "../config";
import FooterBar from "./FooterBar";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { GrDatabase } from "react-icons/gr";
import { FaPlus, FaFilter, FaTableColumns, FaCalendarDays, FaChartLine, FaSortDown } from "react-icons/fa6";
import AddButton from "./Button/AddButton";
import SubmitButton from "./Button/SubmitButton";
import { Toast } from "primereact/toast";
import DateRangeSelector from "./DateRangeSelector";
import TopNSelector from "./TopNSelector";
import SortBySelector from "./SortBySelector";

const SidebarData = ({
  setCanvasData,
  onBuildVisualization,
  selectedTable,
  onVisualizationTypeChange,
  editingPayload,
}) => {
  const toast = useRef(null);
  const [dimensiInputs, setDimensiInputs] = useState([""]);
  const [metrikInputs, setMetrikInputs] = useState([]);
  const [metrikAggregation, setMetrikAggregation] = useState([]);
  const [filters, setFilters] = useState([{ mode: "INCLUDE", logic: "AND", column: "", operator: "=", value: "" }]);
  const [showFooter, setShowFooter] = useState(false);
  const [joinDimensiIndexes, setJoinDimensiIndexes] = useState([]);
  const [joinDimensiData, setJoinDimensiData] = useState([]);
  const [joinMetrikData, setJoinMetrikData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupMetrik, setShowPopupMetrik] = useState(false);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [tables, setTables] = useState([]);
  const [joinableTables, setJoinableTables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJoinTable, setSelectedJoinTable] = useState("");
  const [selectedJoinTableMetrik, setSelectedJoinTableMetrik] = useState("");
  const [selectedJoinType, setSelectedJoinType] = useState("INNER");
  const [selectedJoinTypeMetrik, setSelectedJoinTypeMetrik] = useState("INNER");
  const [showTopNPopup, setShowTopNPopup] = useState(false);
  const [topNConfig, setTopNConfig] = useState(null);
  const [readyToCreateVisualization, setReadyToCreateVisualization] = useState(false);
  const [dragOver, setDragOver] = useState({ dimensi: [], metrik: [] });
  const [showDateRangePopup, setShowDateRangePopup] = useState(false);
  const [dateFilter, setDateFilter] = useState(null);
  const [activeTables, setActiveTables] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [orderBy, setOrderBy] = useState('asc');
  const [availableColumns, setAvailableColumns] = useState([]);

  useEffect(() => {
    if (editingPayload) {
      rehydrateStateFromPayload(editingPayload);
    } else {
      resetForm();
    }
  }, [editingPayload]);

  const parseColumnString = (colStr) => {
    const parts = colStr.split('.');
    if (parts.length < 2) return null;
    const tableName = parts[0];
    const columnName = parts.slice(1).join('.');
    return JSON.stringify({ tableName, columnName });
  };

  const rehydrateStateFromPayload = (payload) => {
    const allTablesInPayload = new Set();
    if (payload.tabel) {
        allTablesInPayload.add(payload.tabel);
    }
    
    if (payload.dimensi && payload.dimensi.length > 0) {
      const rehydratedDimensi = payload.dimensi.map(d => {
        allTablesInPayload.add(d.split('.')[0]);
        return parseColumnString(d);
      }).filter(Boolean);
      setDimensiInputs(rehydratedDimensi);
    } else {
      setDimensiInputs([""]);
    }

    if (payload.metriks && payload.metriks.length > 0) {
      const rehydratedMetriks = payload.metriks.map(metrikStr => {
        const [colPart, agg] = metrikStr.split('|');
        allTablesInPayload.add(colPart.split('.')[0]);
        const parsedCol = parseColumnString(colPart);
        return parsedCol ? `${parsedCol}|${agg}` : null;
      }).filter(Boolean);
      
      const rehydratedAggregations = payload.metriks.map(m => m.split('|')[1] || "COUNT");
      
      setMetrikInputs(rehydratedMetriks);
      setMetrikAggregation(rehydratedAggregations);
    } else {
      setMetrikInputs([]);
      setMetrikAggregation([]);
    }
    
    const joins = payload.tabel_join || [];
    joins.forEach(j => allTablesInPayload.add(j.tabel));
    setJoinDimensiData(joins);
    setJoinMetrikData([]);

    const userFilters = payload.filters?.filter(f => f.operator !== 'between') || [];
    setFilters(userFilters.length > 0 ? userFilters : [{ mode: "INCLUDE", logic: "AND", column: "", operator: "=", value: "" }]);
    
    setDateFilter(payload.date_filter_details || null);
    setTopNConfig(payload.topN ? { value: payload.topN } : null);
    
    setSortBy(payload.sortBy || '');
    setOrderBy(payload.orderBy || 'asc');

    setActiveTables(Array.from(allTablesInPayload));
    setReadyToCreateVisualization(true);
  };

  // useEffect(() => {
  //   axios
  //     .get(`${config.API_BASE_URL}/api/kelola-dashboard/tables`)
  //     .then((response) => {
  //       if (response.data.success && Array.isArray(response.data.data)) {
  //         setTables(response.data.data);
  //       } else {
  //         // showToast("error", "Error", "Failed to fetch tables");
  //       }
  //     })
  //     // .catch(() => showToast("error", "Error", "Failed to load tables"));
  // }, []);

    useEffect(() => {
    if (activeTables.length > 0) {
      const fetchColumnsForTables = async () => {
        const columnPromises = activeTables.map(tableName =>
          axios.get(`${config.API_BASE_URL}/api/kelola-dashboard/fetch-column/${tableName}`)
        );
  
        try {
          const responses = await Promise.all(columnPromises);
          const allColumns = [];
          
          responses.forEach((response, index) => {
            if (response.data.success) {
              const fullTableName = activeTables[index];
              const displayTableName = formatDisplayName(fullTableName);
              
              response.data.data.forEach(col => {
                const columnName = col.name || col.column_name;
                allColumns.push({
                  label: `${displayTableName}.${columnName}`, 
                  value: `${fullTableName}.${columnName}`   
                });
              });
            }
          });
          setAvailableColumns(allColumns);
        } catch (error) {
          console.error("Failed to fetch columns for active tables", error);
          setAvailableColumns([]);
        }
      };
  
      fetchColumnsForTables();
    } else {
      setAvailableColumns([]);
    }
  }, [activeTables]); 

  useEffect(() => {
    setDragOver({
      dimensi: Array(dimensiInputs.length).fill(false),
      metrik: Array(metrikInputs.length).fill(false),
    });
  }, [dimensiInputs.length, metrikInputs.length]);

  const showToast = (severity, summary, detail) => {
    toast.current?.show({ severity, summary, detail, life: 4000 });
  };

  const formatDisplayName = (tableName) => {
    if (!tableName) return "";
    const parts = tableName.split('__');
    return parts.length > 1 ? parts[1].replace(/_/g, ' ') : tableName.replace(/_/g, ' ');
  };
  
  const generateMetricAlias = (metrik) => {
    if (!metrik) return '';
    const [metrikValue, agg] = metrik.split('|');
    try {
        const parsedMetrik = JSON.parse(metrikValue);
        const columnName = parsedMetrik.columnName;
        const aggregationType = (agg || 'COUNT').toLowerCase();
        
        const columnAliasBase = String(columnName).replace(/\./g, '_').replace(/\*/g, 'all');
        const sanitizedAliasBase = columnAliasBase.replace(/[^a-zA-Z0-9_]/g, '');

        switch (aggregationType) {
            case 'sum': return `sum_${sanitizedAliasBase}`;
            case 'average': return `avg_${sanitizedAliasBase}`;
            case 'min': return `min_${sanitizedAliasBase}`;
            case 'max': return `max_${sanitizedAliasBase}`;
            case 'count':
            default:
                return columnName === '*' ? 'count_star' : `count_${sanitizedAliasBase}`;
        }
    } catch {
        return '';
    }
  };

  const sortableColumns = useMemo(() => {
    const columns = [];
    
    dimensiInputs.forEach(dim => {
        try {
            if (dim && dim.trim() !== "") {
                const parsedDim = JSON.parse(dim);
                const value = `${parsedDim.tableName}.${parsedDim.columnName}`;
                columns.push({ label: `Dim: ${parsedDim.columnName}`, value });
            }
        } catch {}
    });

    metrikInputs.forEach(metrik => {
        try {
            if (metrik && metrik.trim() !== "") {
                const [metrikValue] = metrik.split('|');
                const parsedMetrik = JSON.parse(metrikValue);
                const value = generateMetricAlias(metrik);
                columns.push({ label: `Metric: ${parsedMetrik.columnName}`, value });
            }
        } catch {}
    });

    return columns;
  }, [dimensiInputs, metrikInputs]);

  const handleOpenJoinDialog = async (type) => {
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/get-joinable-tables`, {
        existing_tables: activeTables 
      });

      if (response.data.success) {
        setJoinableTables(response.data.data);
        if (type === 'dimensi') {
          if (dimensiInputs.some(d => d.trim() === "")) {
            showToast("warn", "Warning", "Please fill the empty dimension slot first.");
            setIsLoading(false);
            return;
          }
          setShowPopup(true);
        } else {
          setShowPopupMetrik(true);
          setWaitingForConfirmation(true);
        }
      } else {
        showToast('error', 'Failed to Load', 'Could not validate tables for join.');
      }
    } catch (error) {
      showToast('error', 'Error', 'An error occurred during join validation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = async (e, type, index) => {
    e.preventDefault();
    setDragOver({ dimensi: [], metrik: [] });

    try {
        const data = e.dataTransfer.getData("text/plain");
        if (!data) return;
        const droppedColumnData = JSON.parse(data);
        const droppedTableName = droppedColumnData.tableName;

        if (activeTables.length > 0 && !activeTables.includes(droppedTableName)) {
            setIsLoading(true);
            try {
                const response = await axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/get-joinable-tables`, {
                    existing_tables: activeTables
                });
                if (response.data.success) {
                    const joinableTablesList = response.data.data;
                    if (!joinableTablesList.includes(droppedTableName)) {
                        showToast("error", "Relation Error", `Table "${formatDisplayName(droppedTableName)}" cannot be joined with the existing tables.`);
                        return;
                    }
                } else {
                    showToast('error', 'Validation Failed', 'Could not validate table relation.');
                    return;
                }
            } catch (error) {
                showToast('error', 'Error', 'An error occurred during join validation.');
                return;
            } finally {
                setIsLoading(false);
            }
        }

        if (!activeTables.includes(droppedTableName)) {
            setActiveTables(prev => [...prev, droppedTableName]);
        }

        const stringifiedColumnData = JSON.stringify(droppedColumnData);
        if (type === "dimensi") {
            const newDimensiInputs = [...dimensiInputs];
            newDimensiInputs[index] = stringifiedColumnData;
            setDimensiInputs(newDimensiInputs);
        } else {
            const newMetrikInputs = [...metrikInputs];
            const newMetrikAggregation = [...metrikAggregation];
            const aggregation = newMetrikAggregation[index] || "COUNT";
            newMetrikInputs[index] = `${stringifiedColumnData}|${aggregation}`;
            setMetrikInputs(newMetrikInputs);
            if (!newMetrikAggregation[index]) {
                newMetrikAggregation[index] = 'COUNT';
                setMetrikAggregation(newMetrikAggregation);
            }
        }
        showToast("success", "Success", `Column added to ${type}`);
    } catch (error) {
        showToast("error", "Error", "Failed to process dropped data");
    }
  };

  const formatColumnName = (data) => {
    try {
      if (typeof data === "string" && data.trim().startsWith("{")) {
        return JSON.parse(data).columnName || "";
      }
      return data?.columnName || "";
    } catch { return ""; }
  };

  const handleAggregationChange = (index, event) => {
    const newAggregation = [...metrikAggregation];
    newAggregation[index] = event.target.value;
    setMetrikAggregation(newAggregation);
    const newMetrikInputs = [...metrikInputs];
    const currentMetrik = newMetrikInputs[index];
    if (currentMetrik && typeof currentMetrik === "string") {
      const parts = currentMetrik.split("|");
      newMetrikInputs[index] = `${parts[0]}|${event.target.value}`;
    }
    setMetrikInputs(newMetrikInputs);
  };

  const handleToggleFooter = () => setShowFooter(!showFooter);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    showToast("success", "Success", "Filters applied successfully");
  };

  const handleDragOver = (e, type, index) => {
    e.preventDefault();
    const newDragOver = { dimensi: [], metrik: [] };
    if (type === "dimensi") newDragOver.dimensi[index] = true;
    else newDragOver.metrik[index] = true;
    setDragOver(newDragOver);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver({ dimensi: [], metrik: [] });
  };

  const handleJoinSelection = (type) => {
    const tableToAdd = selectedJoinTable;
    if (tableToAdd && !activeTables.includes(tableToAdd)) {
        setActiveTables(prev => [...prev, tableToAdd]);
    }
    
    const newJoinDimensiIndexes = [...joinDimensiIndexes];
    const lastDimensiIndex = dimensiInputs.length - 1;
    const newJoinData = [...joinDimensiData];
    newJoinData[lastDimensiIndex] = { tabel: selectedJoinTable, join_type: type };
    if (type !== "tanpa join") {
      newJoinDimensiIndexes.push(lastDimensiIndex);
    } else {
      const updatedIndexes = newJoinDimensiIndexes.filter((index) => index !== lastDimensiIndex);
      newJoinDimensiIndexes.splice(0, newJoinDimensiIndexes.length, ...updatedIndexes);
      newJoinData[lastDimensiIndex] = { tabel: "", join_type: "tanpa join" };
    }
    setJoinDimensiData(newJoinData);
    setJoinDimensiIndexes(newJoinDimensiIndexes);
    setDimensiInputs([...dimensiInputs, ""]);
    setShowPopup(false);
    showToast("success", "Success", "Dimension join added");
  };

  const handleJoinSelectionMetrik = (type) => {
    if (waitingForConfirmation) {
      const tableToAdd = selectedJoinTableMetrik;
      if (tableToAdd && !activeTables.includes(tableToAdd)) {
          setActiveTables(prev => [...prev, tableToAdd]);
      }

      const newJoinData = [...joinMetrikData];
      const lastMetrikIndex = metrikInputs.length;
      if (type !== "tanpa join") {
        newJoinData[lastMetrikIndex] = { tabel: selectedJoinTableMetrik, join_type: type };
      } else {
        newJoinData[lastMetrikIndex] = { tabel: "", join_type: "tanpa join" };
      }
      setJoinMetrikData(newJoinData);
      setMetrikInputs([...metrikInputs, ""]);
      setMetrikAggregation([...metrikAggregation, "COUNT"]);
      setShowPopupMetrik(false);
      setWaitingForConfirmation(false);
      showToast("success", "Success", "Metric join added");
    }
  };

  const resetForm = () => {
    setDimensiInputs([""]);
    setMetrikInputs([]);
    setMetrikAggregation([]);
    setFilters([{ mode: "INCLUDE", logic: "AND", column: "", operator: "=", value: "" }]);
    setJoinDimensiIndexes([]);
    setJoinDimensiData([]);
    setJoinMetrikData([]);
    setReadyToCreateVisualization(false);
    setDateFilter(null);
    setShowDateRangePopup(false);
    setTopNConfig(null);
    setShowTopNPopup(false);
    setSortBy('');
    setOrderBy('asc');
    setActiveTables([]);
    showToast("info", "Info", "Form reset for new visualization");
  };

  const sendDataToAPI = () => {
    if (dimensiInputs.length === 1 && dimensiInputs[0].trim() === "" && metrikInputs.length === 0) {
      showToast("error", "Error", "Please add at least one dimension or metric");
      return;
    }
    let table = activeTables.length > 0 ? activeTables[0] : selectedTable;

    const dimensi = dimensiInputs.map((dimensi) => {
      try {
        if (!dimensi || (typeof dimensi === 'string' && dimensi.trim() === "")) return "";
        const parsedDimensi = JSON.parse(dimensi);
        return `${parsedDimensi.tableName}.${parsedDimensi.columnName}`;
      } catch { return ""; }
    }).filter(Boolean);

    const metriks = metrikInputs.map((metrik) => {
      try {
        if (!metrik) return "";
        const [metrikValue, agg] = metrik.split("|");
        const parsedMetrik = JSON.parse(metrikValue);
        return `${parsedMetrik.tableName}.${parsedMetrik.columnName}|${agg}`;
      } catch { return ""; }
    }).filter(Boolean);

    const tabelJoin = [...joinDimensiData, ...joinMetrikData].filter(j => j && j.tabel && j.join_type !== "tanpa join");
    const userDefinedFilters = filters.filter(f => f.column && f.operator && f.value !== "").map(filter => ({
      column: filter.column.includes(".") ? filter.column : `${table}.${filter.column}`,
      ...filter
    }));
    let finalFilters = [...userDefinedFilters];
    if (dateFilter) finalFilters.unshift({ ...dateFilter });

    const payload = {
      tabel: table,
      dimensi,
      metriks,
      tabel_join: tabelJoin,
      filters: finalFilters,
      topN: topNConfig ? topNConfig.value : null,
      granularity: dateFilter?.granularity || 'asis',
      display_format: dateFilter?.displayFormat || 'auto',
      date_filter_details: dateFilter ? { ...dateFilter } : null,
      sortBy: sortBy,
      orderBy: orderBy,
    };

    axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/fetch-data`, payload)
      .then((response) => {
        if (response.data.success) {
          onBuildVisualization(payload, response.data.query, response.data.data);
          setReadyToCreateVisualization(true);
          showToast("success", "Success", "Data fetched successfully");
          onVisualizationTypeChange("bar");
        } else {
          showToast("error", "Error", `Failed to fetch data: ${response.data.message}`);
        }
      })
      .catch(() => showToast("error", "Error", "Failed to fetch data"));
  };

  const handleToggleDateRangePopup = () => setShowDateRangePopup(!showDateRangePopup);
  const handleDateRangeChange = (newDateFilter) => {
    setDateFilter(newDateFilter);
    showToast(newDateFilter ? "success" : "info", "Success", newDateFilter ? "Date range filter applied." : "Date range filter cleared.");
    setShowDateRangePopup(false);
  };
  const handleToggleTopNPopup = () => setShowTopNPopup(!showTopNPopup);
  const handleTopNChange = (newTopNConfig) => {
    setTopNConfig(newTopNConfig);
    showToast(newTopNConfig ? "success" : "info", "Success", newTopNConfig ? `Top ${newTopNConfig.value} applied.` : "Top N limit cleared.");
    setShowTopNPopup(false);
  };

  return (
    <div id="sidebar-data" className="sidebar-2">
      <Toast ref={toast} />
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2em' }}></i>
            <p className="mt-3">Mohon Tunggu, Memvalidasi Relasi Tabel...</p>
          </div>
        </div>
      )}
      <div className="sub-title"><GrDatabase size={48} className="text-muted" /><span className="sub-text">Data</span></div>
      <hr className="full-line" />
      <div className="form-diagram">
        {readyToCreateVisualization && (<div className="alert alert-success mb-3"><p>Data is ready! Select visualization type from the menu.</p><Button icon="pi pi-plus" label="Create New Visualization" className="p-button-sm mt-2" onClick={resetForm} /></div>)}
        <div className="form-group">
          <div className="d-flex justify-content-between align-items-center mb-2"><span className="fw-bold"><FaTableColumns className="me-2" />Dimensions</span></div>
          <div id="dimensi-container">
            {dimensiInputs.map((dimensi, index) => (
              <div key={index} className={`dimensi-row mb-2 drop-target ${dragOver.dimensi[index] ? "drag-over" : ""}`} onDragOver={(e) => handleDragOver(e, "dimensi", index)} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, "dimensi", index)}>
                <input style={{ width: "100%" }} type="text" className="dimensi-input form-control" value={formatColumnName(dimensi)} placeholder="Drag a column here" readOnly />
                {joinDimensiIndexes.includes(index) && joinDimensiData[index] && (<span className="join-badge">{joinDimensiData[index].join_type}{" "}{formatDisplayName(joinDimensiData[index].tabel)}</span>)}
              </div>
            ))}
          </div>
          <AddButton text="Add Dimension" onClick={() => handleOpenJoinDialog('dimensi')} className="mt-2" icon={<FaPlus size={12} />} disabled={isLoading} />
        </div>
        <Dialog header="Select Join Type" visible={showPopup} style={{ width: "50vw" }} onHide={() => setShowPopup(false)} draggable={false} resizable={false}>
          <div className="row">
            <div className="col-md-6"><h6>Join With Table</h6>
              <select className="form-select" value={selectedJoinTable} onChange={(e) => setSelectedJoinTable(e.target.value)}>
                <option value="">Select a table</option>
                {joinableTables.map((table, idx) => (
                  <option key={idx} value={table}>
                    {formatDisplayName(table)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6"><h6>Join Type</h6><select className="form-select" value={selectedJoinType} onChange={(e) => setSelectedJoinType(e.target.value)}><option value="INNER">INNER JOIN</option><option value="LEFT">LEFT JOIN</option><option value="RIGHT">RIGHT JOIN</option><option value="CROSS">CROSS JOIN</option><option value="FULL">FULL JOIN</option><option value="tanpa join">No Join</option></select></div>
          </div>
          <div className="mt-4 text-end"><Button label="Apply" icon="pi pi-check" onClick={() => handleJoinSelection(selectedJoinType)} className="p-button-success me-2" disabled={!selectedJoinTable && selectedJoinType !== 'tanpa join'} /><Button label="Cancel" icon="pi pi-times" onClick={() => setShowPopup(false)} className="p-button-secondary" /></div>
        </Dialog>
        <div className="form-group mt-4">
          <div className="d-flex justify-content-between align-items-center mb-2"><span className="fw-bold">Metrics</span></div>
          <div id="metrik-container">
            {metrikInputs.map((metrik, index) => (
              <div key={index} className={`metrik-row mb-2 d-flex drop-target ${dragOver.metrik[index] ? "drag-over" : ""}`} onDragOver={(e) => handleDragOver(e, "metrik", index)} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, "metrik", index)}>
                <input style={{ width: "75%" }} type="text" className="metrik-input form-control" value={formatColumnName(metrik.split('|')[0])} placeholder="Drag a column here" readOnly />
                <select style={{ width: "25%" }} className="form-select metrik-aggregation-dropdown" value={metrik.split('|')[1] || "COUNT"} onChange={(e) => handleAggregationChange(index, e)}><option value="COUNT">COUNT</option><option value="SUM">SUM</option><option value="AVERAGE">AVG</option><option value="MIN">MIN</option><option value="MAX">MAX</option></select>
                {joinMetrikData[index] && joinMetrikData[index].join_type !== "tanpa join" && (<span className="join-badge ms-2">{joinMetrikData[index].join_type}{" "}{formatDisplayName(joinMetrikData[index].tabel)}</span>)}
              </div>
            ))}
          </div>
          <AddButton text="Add Metric" onClick={() => handleOpenJoinDialog('metrik')} className="mt-2" icon={<FaPlus size={12} />} disabled={isLoading} />
        </div>
        <Dialog header="Select Metric Join" visible={showPopupMetrik} style={{ width: "50vw" }} onHide={() => setShowPopupMetrik(false)} draggable={false} resizable={false}>
          <div className="row">
            <div className="col-md-6"><h6>Join With Table</h6>
              <select className="form-select" value={selectedJoinTableMetrik} onChange={(e) => setSelectedJoinTableMetrik(e.target.value)}>
                <option value="">Select a table</option>
                {joinableTables.map((table, idx) => (
                  <option key={idx} value={table}>
                    {formatDisplayName(table)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6"><h6>Join Type</h6><select className="form-select" value={selectedJoinTypeMetrik} onChange={(e) => setSelectedJoinTypeMetrik(e.target.value)}><option value="INNER">INNER JOIN</option><option value="LEFT">LEFT JOIN</option><option value="RIGHT">RIGHT JOIN</option><option value="CROSS">CROSS JOIN</option><option value="FULL">FULL JOIN</option><option value="tanpa join">No Join</option></select></div>
          </div>
          <div className="mt-4 text-end"><Button label="Apply" icon="pi pi-check" onClick={() => handleJoinSelectionMetrik(selectedJoinTypeMetrik)} className="p-button-success me-2" disabled={!selectedJoinTableMetrik && selectedJoinTypeMetrik !== 'tanpa join'} /><Button label="Cancel" icon="pi pi-times" onClick={() => setShowPopupMetrik(false)} className="p-button-secondary" /></div>
        </Dialog>
        <div className="form-group mt-4">
          <div className="d-flex flex-col justify-content-between align-items-center">
            <span className="fw-bold">Sorting</span>
            {topNConfig && <small className="text-muted fst-italic">Disabled by Top N</small>}
          </div>
          <SortBySelector
            sortableColumns={sortableColumns}
            sortBy={sortBy}
            setSortBy={setSortBy}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            disabled={!!topNConfig}
          />
        </div>
        <div className="form-group mt-4"><span className="fw-bold">Filter</span></div>
        <AddButton text="Data Terbanyak" onClick={handleToggleTopNPopup} className="mt-2" icon={<FaChartLine size={12} />} />
        {topNConfig && (<div className="mt-2 p-2 border rounded bg-light"><small className="d-block text-muted">Active Top N:</small><span>Top {topNConfig.value} records</span></div>)}
        <Dialog header="Tetapkan Data dengan Nilai Tertinggi" visible={showTopNPopup} style={{ width: "60vw", maxWidth: "700px" }} onHide={() => setShowTopNPopup(false)} draggable={false} resizable={false} footer={null}><TopNSelector onTopNChange={handleTopNChange} initialTopN={topNConfig} /></Dialog>
        <AddButton text="Rentang Tanggal" onClick={handleToggleDateRangePopup} className="mt-2 me-2" icon={<FaCalendarDays size={12} />} />
        <AddButton text="Filter Satuan" onClick={handleToggleFooter} className="mt-2" icon={<FaFilter size={12} />} />
        {dateFilter && (<div className="mt-2 p-2 border rounded bg-light"><small className="d-block text-muted">Active Date Range:</small><span>{`${dateFilter.column} BETWEEN ${dateFilter.value[0]} AND ${dateFilter.value[1]}`}</span></div>)}
        <Dialog header="Select Primary Date Range" visible={showDateRangePopup} style={{ width: "70vw", maxWidth: "800px" }} onHide={() => setShowDateRangePopup(false)} draggable={false} resizable={false} footer={null}>
          <DateRangeSelector availableTables={activeTables} onDateRangeChange={handleDateRangeChange} initialDateFilter={dateFilter} />
        </Dialog>
        <div className="d-flex flex-column gap-2 mt-4"><Button label="Reset" className="p-button-secondary" onClick={resetForm} /><SubmitButton onClick={sendDataToAPI} className="p-button-primary" text="Create" /></div>
      </div>
      {showFooter && (<FooterBar filters={filters} setFilters={setFilters} handleApplyFilters={handleApplyFilters} handleToggleFooter={handleToggleFooter} availableColumns={availableColumns} />)}
      <style jsx>{`
        .join-badge { background-color: #e3f2fd; color: #1565c0; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; margin-top: 4px; display: inline-block; text-transform: capitalize; }
        .sidebar-2 { max-height: 100vh; overflow-y: auto; padding-bottom: 120px; margin-top: 15px;}
        .drop-target { border: 2px dashed transparent; border-radius: 4px; transition: all 0.2s; }
        .drag-over { border: 2px dashed #2196f3; background-color: rgba(33, 150, 243, 0.1); }
        .loading-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 9999; color: white; text-align: center; }
        .loading-content { display: flex; flex-direction: column; align-items: center; }
        .loading-content p { font-size: 1.1rem; }
        select option:disabled { color: #ccc; background-color: #f5f5f5; }
      `}</style>
    </div>
  );
};

export default SidebarData;