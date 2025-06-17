import { useState } from "react";

const FooterBar = ({ filters, setFilters, handleApplyFilters, handleToggleFooter, dimensiInputs }) => {
  // State untuk menyimpan logika global antar filter
  const [globalLogic, setGlobalLogic] = useState("AND");

  const handleFilterChange = (index, field, value) => {
    const newFilters = [...filters];
    
    if (field === "operator" && value === "between") {
      // Pastikan value1 dan value2 ada ketika BETWEEN dipilih
      newFilters[index] = { ...newFilters[index], operator: value, value1: "", value2: "" };
    } else {
      newFilters[index][field] = value;
    }
    
    setFilters(newFilters);
  };

  // Handler untuk mengubah logika global
  const handleLogicChange = (value) => {
    setGlobalLogic(value);
    
    // Update semua filter dengan logika baru
    const updatedFilters = filters.map(filter => ({
      ...filter,
      logic: value
    }));
    
    setFilters(updatedFilters);
  };

  const addFilter = () => {
    // Tambahkan filter baru dengan logika global yang dipilih
    setFilters([...filters, { 
      mode: "INCLUDE", 
      logic: globalLogic, // Gunakan logika global
      column: "", 
      operator: "=", 
      value: "" 
    }]);
  };

  const applyFilters = () => {
    handleApplyFilters(filters);
  };

  const closeBar = () => {
    handleToggleFooter();
  };

  const resetFilters = () => {
    // Reset ke filter default dengan logika global saat ini
    setFilters([{ 
      mode: "INCLUDE", 
      logic: globalLogic, 
      column: "", 
      operator: "=", 
      value: "" 
    }]);
  };

    const getDimensiColumns = () => {
    if (!dimensiInputs || dimensiInputs.length === 0) return [];

    return dimensiInputs.map(dimensi => {
      try {
        if (typeof dimensi === 'string' && dimensi.startsWith('{')) {
          const parsed = JSON.parse(dimensi);
          return parsed.columnName || parsed.column || dimensi;
        }

        return dimensi;
      } catch (e) {
        return dimensi;
      }
    }).filter(Boolean);
  }

  const dimensiColumns = getDimensiColumns();

  return (
    <div className="footer-bar">
      <div className="footer-bar-header">
        <span className="footer-bar-title">FILTER</span>
        <button className="footer-bar-close" onClick={closeBar}>✖</button>
      </div>
      <div className="filter-container">
      {filters.map((filter, index) => (
        <div key={index} className="filter-row">
          <select 
            className="filter-input" 
            value={filter.mode} 
            onChange={(e) => handleFilterChange(index, "mode", e.target.value)}
          >
            <option value="INCLUDE">INCLUDE</option>
            <option value="EXCLUDE">EXCLUDE</option>
          </select>
          <select
            className="filter-input"
            value={filter.column}
            onChange={(e) => handleFilterChange(index, "column", e.target.value)}
          >
            <option value="">Pilih Kolom</option>
            {dimensiColumns.map((column, colIdx) => (
              <option key={colIdx} value={column}>
                {column}
              </option>
            ))}
          </select>
          {/* <input
            type="text"
            placeholder="Column"
            value={filter.column}
            onChange={(e) => handleFilterChange(index, "column", e.target.value)}
            className="filter-input"
          /> */}
          <select 
            className="filter-input" 
            value={filter.operator} 
            onChange={(e) => handleFilterChange(index, "operator", e.target.value)}
          >
            <option value="=">SAMA DENGAN</option>
            <option value="!=">TIDAK SAMA DENGAN</option>
            <option value=">">LEBIH BESAR</option>
            <option value="<">LEBIH KECIL</option>
            <option value="like">LIKE</option>
            <option value="between">BETWEEN</option>
          </select>
          {filter.operator !== "between" ? (
            <input
              type="text"
              placeholder="Value"
              value={filter.value}
              onChange={(e) => handleFilterChange(index, "value", e.target.value)}
              className="filter-input"
            />
          ) : (
            <div className="between-container">
              <input
                type="text"
                placeholder="Value 1"
                value={filter.value1 || ""}
                onChange={(e) => handleFilterChange(index, "value1", e.target.value)}
                className="filter-input"
              />
              <span className="between-text">dan</span>
              <input
                type="text"
                placeholder="Value 2"
                value={filter.value2 || ""}
                onChange={(e) => handleFilterChange(index, "value2", e.target.value)}
                className="filter-input"
              />
            </div>
          )}
        </div>
      ))}
      </div>
      <div className="footer-buttons">
        <div className="left-buttons">
          <button type="button" className="btn btn-secondary mt-2" onClick={addFilter}>
            Tambah Filter
          </button>
          <select 
            className="logic-dropdown" 
            value={globalLogic} 
            onChange={(e) => handleLogicChange(e.target.value)}
          >
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </select>
        </div>

        <div className="right-buttons">
          <button type="button" className="btn btn-secondary mt-2" onClick={applyFilters}>
            Terapkan Filter
          </button>
          <button type="button" className="btn btn-secondary mt-2" onClick={resetFilters}>
            Reset Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default FooterBar;