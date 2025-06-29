import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import config from "../config";
import FooterBar from "./FooterBar";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { GrDatabase } from "react-icons/gr";
import { FaPlus, FaFilter, FaTableColumns, FaCalendarDays, FaChartLine } from "react-icons/fa6";
import AddButton from "./Button/AddButton";
import SubmitButton from "./Button/SubmitButton";
import { Toast } from "primereact/toast";
import DateRangeSelector from "./DateRangeSelector";
import TopNSelector from "./TopNSelector";

const SidebarData = ({
  setCanvasData,
  // setCanvasQuery,
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

  useEffect(() => {
    if (editingPayload) {
      // Jika ada payload, isi form
      rehydrateStateFromPayload(editingPayload);
    } else {
      // Jika tidak ada payload, reset form untuk membuat viz baru
      resetForm();
    }
  }, [editingPayload]);

  // Fungsi untuk mem-parsing string "table.column" kembali ke format state
  const parseColumnString = (colStr) => {
    const parts = colStr.split('.');
    if (parts.length < 2) return null;
    const tableName = parts[0];
    const columnName = parts.slice(1).join('.'); // Handle jika nama kolom mengandung titik
    return JSON.stringify({ tableName, columnName });
  };

  // Fungsi untuk mengisi state dari payload yang ada
  const rehydrateStateFromPayload = (payload) => {
    // Dimensi
    if (payload.dimensi && payload.dimensi.length > 0) {
      const rehydratedDimensi = payload.dimensi.map(parseColumnString).filter(Boolean);
      setDimensiInputs(rehydratedDimensi);
    } else {
      setDimensiInputs([""]);
    }

    // Metrik
    if (payload.metriks && payload.metriks.length > 0) {
      const rehydratedMetriks = payload.metriks.map(metrikStr => {
        const [colPart, agg] = metrikStr.split('|');
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
    
    // Join
    // (Implementasi join rehydration jika diperlukan, untuk saat ini kita sederhanakan)
    setJoinDimensiData(payload.tabel_join || []);
    setJoinMetrikData([]); // Asumsi join hanya dari dimensi untuk saat ini

    // Filter
    const dateFilterFromPayload = payload.filters?.find(f => f.operator === 'between');
    const userFilters = payload.filters?.filter(f => f.operator !== 'between') || [];
    setFilters(userFilters.length > 0 ? userFilters : [{ mode: "INCLUDE", logic: "AND", column: "", operator: "=", value: "" }]);
    
    // Date Filter
    setDateFilter(payload.date_filter_details || null);

    // Top N
    setTopNConfig(payload.topN ? { value: payload.topN } : null);
    
    setReadyToCreateVisualization(true); // Tandai bahwa data siap
  };

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/kelola-dashboard/tables`)
      .then((response) => {
        if (response.data.success && Array.isArray(response.data.data)) {
          setTables(response.data.data);
        } else {
          showToast("error", "Error", "Failed to fetch tables");
        }
      })
      .catch(() => showToast("error", "Error", "Failed to load tables"));
  }, []);

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
  
  const handleOpenJoinDialog = async (type) => {
    setIsLoading(true);
    const existingTables = new Set();
    [...dimensiInputs, ...metrikInputs].forEach(item => {
      if (typeof item === 'string' && item.startsWith('{')) {
        try { existingTables.add(JSON.parse(item.split('|')[0]).tableName); } catch { }
      }
    });

    try {
      const response = await axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/get-joinable-tables`, {
        existing_tables: Array.from(existingTables)
      });
      if (response.data.success) {
        setJoinableTables(response.data.data);
        if (type === 'dimensi') {
          if (dimensiInputs.some(d => d.trim() === "")) {
            showToast("warn", "Peringatan", "Isi dulu dimensi yang kosong.");
          } else {
            setShowPopup(true);
          }
        } else {
          setShowPopupMetrik(true);
          setWaitingForConfirmation(true);
        }
      } else {
        showToast('error', 'Gagal Memuat', 'Tidak dapat memvalidasi tabel untuk join.');
      }
    } catch (error) {
      showToast('error', 'Error', 'Terjadi kesalahan saat validasi join.');
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

        const existingTables = new Set();
        [...dimensiInputs, ...metrikInputs].forEach(item => {
            if (typeof item === 'string' && item.startsWith('{')) {
                try {
                    const parsedItem = JSON.parse(item.split('|')[0]);
                    if (parsedItem.tableName) {
                        existingTables.add(parsedItem.tableName);
                    }
                } catch {}
            }
        });

        if (existingTables.size > 0 && !existingTables.has(droppedTableName)) {
            setIsLoading(true);
            try {
                const response = await axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/get-joinable-tables`, {
                    existing_tables: Array.from(existingTables)
                });

                if (response.data.success) {
                    const joinableTablesList = response.data.data;
                    if (!joinableTablesList.includes(droppedTableName)) {
                        showToast("error", "Error Relasi", `Tabel "${formatDisplayName(droppedTableName)}" tidak dapat digabungkan dengan tabel yang sudah ada.`);
                        setIsLoading(false);
                        return;
                    }
                } else {
                    showToast('error', 'Gagal Memvalidasi', 'Tidak dapat memvalidasi relasi tabel.');
                    setIsLoading(false);
                    return;
                }
            } catch (error) {
                showToast('error', 'Error', 'Terjadi kesalahan saat validasi join.');
                setIsLoading(false);
                return;
            } finally {
                setIsLoading(false);
            }
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
        showToast("success", "Success", `Kolom berhasil ditambahkan ke ${type}`);
    } catch (error) {
        showToast("error", "Error", "Gagal memproses data yang di-drop");
    } finally {
        setIsLoading(false);
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
    showToast("info", "Info", "Form reset for new visualization");
  };

  const sendDataToAPI = () => {
    // ... (kode untuk membangun payload, sama seperti sebelumnya) ...
    if (dimensiInputs.length === 1 && dimensiInputs[0].trim() === "" && metrikInputs.length === 0) {
      showToast("error", "Error", "Please add at least one dimension or metric");
      return;
    }
    let table = "";
    const firstValidInput = dimensiInputs.find(d => d.startsWith('{')) || metrikInputs.find(m => m.startsWith('{'));
    if (firstValidInput) {
      try {
        const parsed = JSON.parse(firstValidInput.split('|')[0]);
        table = parsed.tableName || "";
      } catch { }
    }
    if (!table && selectedTable) {
      table = selectedTable;
    }

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
      column: filter.column.includes(".") ? filter.column : `${table || selectedTable}.${filter.column}`,
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
      date_filter_details: dateFilter ? { ...dateFilter } : null
    };

    axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/fetch-data`, payload)
      .then((response) => {
        if (response.data.success) {
          // Panggil onBuildVisualization dengan payload dan hasilnya
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
    <div id="sidebar-data" className="sidebar-2" style={style}>
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
        <div className="form-group mt-4"><span className="fw-bold">Filters</span></div>
        <div className="form-group mt-2"><span className="fw-bold">Data Limit</span></div>
        <AddButton text="Set Top N" onClick={handleToggleTopNPopup} className="mt-2" icon={<FaChartLine size={12} />} />
        {topNConfig && (<div className="mt-2 p-2 border rounded bg-light"><small className="d-block text-muted">Active Top N:</small><span>Top {topNConfig.value} records</span></div>)}
        <Dialog header="Set Top N Data by Highest Values" visible={showTopNPopup} style={{ width: "60vw", maxWidth: "700px" }} onHide={() => setShowTopNPopup(false)} draggable={false} resizable={false} footer={null}><TopNSelector onTopNChange={handleTopNChange} initialTopN={topNConfig} /></Dialog>
        <AddButton text="Add Date Range" onClick={handleToggleDateRangePopup} className="mt-2 me-2" icon={<FaCalendarDays size={12} />} />
        <AddButton text="Add Filter" onClick={handleToggleFooter} className="mt-2" icon={<FaFilter size={12} />} />
        {dateFilter && (<div className="mt-2 p-2 border rounded bg-light"><small className="d-block text-muted">Active Date Range:</small><span>{`${dateFilter.column} BETWEEN ${dateFilter.value[0]} AND ${dateFilter.value[1]}`}</span></div>)}
        <Dialog header="Select Primary Date Range" visible={showDateRangePopup} style={{ width: "70vw", maxWidth: "800px" }} onHide={() => setShowDateRangePopup(false)} draggable={false} resizable={false} footer={null}><DateRangeSelector availableTables={tables} onDateRangeChange={handleDateRangeChange} initialDateFilter={dateFilter} /></Dialog>
        <div className="d-flex flex-column gap-2 mt-4"><Button label="Reset" className="p-button-secondary" onClick={resetForm} /><SubmitButton onClick={sendDataToAPI} text="Create" /></div>
      </div>
      {showFooter && (<FooterBar filters={filters} setFilters={setFilters} handleApplyFilters={handleApplyFilters} handleToggleFooter={handleToggleFooter} availableTables={tables} currentTable={selectedTable || ''} />)}
      <style jsx>{`
        .join-badge { background-color: #e3f2fd; color: #1565c0; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; margin-top: 4px; display: inline-block; text-transform: capitalize; }
        .sidebar-2 { max-height: 100vh; overflow-y: auto; padding-bottom: 60px; }
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