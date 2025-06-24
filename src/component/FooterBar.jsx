import React, { useState, useEffect } from "react";
import { Dropdown } from 'primereact/dropdown';

const FooterBar = ({ filters, setFilters, handleApplyFilters, handleToggleFooter, availableColumns }) => {
  const [globalLogic, setGlobalLogic] = useState("AND");

  useEffect(() => {
    if (filters.length > 0 && filters[0].logic) {
      setGlobalLogic(filters[0].logic);
    }
  }, [filters]);

  const handleFilterChange = (index, field, value) => {
    const newFilters = [...filters];
    
    if (field === "operator" && value === "between") {
      newFilters[index] = { 
        ...newFilters[index], 
        operator: value, 
        value: "",
        value1: newFilters[index].value1 || "", 
        value2: newFilters[index].value2 || "" 
      };
    } else {
      newFilters[index][field] = value;
      if (field === "operator" && newFilters[index].operator !== "between") {
        delete newFilters[index].value1;
        delete newFilters[index].value2;
      }
    }
    
    setFilters(newFilters);
  };

  const handleLogicChange = (value) => {
    setGlobalLogic(value);
    
    const updatedFilters = filters.map(filter => ({
      ...filter,
      logic: value
    }));
    setFilters(updatedFilters);
  };

  const addFilter = () => {
    setFilters([...filters, { 
      mode: "INCLUDE", 
      logic: globalLogic,
      column: "", 
      operator: "=", 
      value: "" 
    }]);
  };

  const applyFilters = () => {
    for (const filter of filters) {
      if (filter.operator === 'between' && (filter.value1 === '' || filter.value2 === '')) {
        alert('Please fill both values for "BETWEEN" operator.');
        return;
      }
    }
    handleApplyFilters(filters);
  };

  const closeBar = () => {
    handleToggleFooter();
  };

  const resetFilters = () => {
    setFilters([{ 
      mode: "INCLUDE", 
      logic: globalLogic, 
      column: "", 
      operator: "=", 
      value: "" 
    }]);
  };

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
            style={{flex: '1 1 100px'}}
            value={filter.mode} 
            onChange={(e) => handleFilterChange(index, "mode", e.target.value)}
          >
            <option value="INCLUDE">INCLUDE</option>
            <option value="EXCLUDE">EXCLUDE</option>
          </select>
          
          <Dropdown
            value={filter.column}
            options={availableColumns}
            onChange={(e) => handleFilterChange(index, "column", e.value)}
            placeholder="Select Column"
            filter
            showClear
            className="filter-input filter-dropdown"
            emptyMessage="No columns available"
          />

          <select 
            className="filter-input"
            style={{flex: '1 1 150px'}}
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
              style={{flex: '2 1 180px'}}
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
      <style jsx>{`
        .filter-dropdown {
          flex: 3 1 250px; /* Memberikan porsi ruang terbesar */
        }
        :global(.p-dropdown) {
          border-radius: 4px;
          width: 100%;
        }
        .filter-row {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 10px;
        }
        .filter-input {
          flex: 1 1 auto;
        }
        .between-container {
          display: flex;
          gap: 5px;
          align-items: center;
          flex: 2 1 180px;
        }
      `}</style>
    </div>
  );
};

export default FooterBar;