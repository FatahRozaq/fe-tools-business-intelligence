import { useState } from "react";

const FooterBar = ({ onApplyFilters }) => {
    const [filters, setFilters] = useState([
    { logic: "AND", column: "", operator: "=", value: "" }
    ]);

  const handleFilterChange = (index, field, value) => {
    const newFilters = [...filters];
    newFilters[index][field] = value;
    setFilters(newFilters);
  };

  const handleAddFilter = () => {
    setFilters([...filters, { logic: "AND", column: "", operator: "=", value: "" }]);
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  const handleClose = () => {
    setFilters([{ logic: "AND", column: "", operator: "=", value: "" }]); // Reset filter
    onApplyFilters(filters);
  };

  return (
    <div className="footer-bar">
      {filters.map((filter, index) => (
        <div key={index} className="filter-row">
          <select value={filter.logic} onChange={(e) => handleFilterChange(index, "logic", e.target.value)}>
            <option value="and">AND</option>
            <option value="or">OR</option>
          </select>
          <input
            type="text"
            placeholder="Column"
            value={filter.column}
            onChange={(e) => handleFilterChange(index, "column", e.target.value)}
            className="border p-1"
          />
          <select value={filter.operator} onChange={(e) => handleFilterChange(index, "operator", e.target.value)}>
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">{">"}</option>
            <option value="<">{"<"}</option>
          </select>
          <input
            type="text"
            placeholder="Value"
            value={filter.value}
            onChange={(e) => handleFilterChange(index, "value", e.target.value)}
            className="border p-1"
          />
        </div>
      ))}
      {/* <button type="button" className="btn btn-secondary mt-2" onClick={handleAddFilter}>
        Tambah Filter
      </button> */}
      <button type="button" className="btn btn-secondary mt-2" onClick={handleApplyFilters}>
        Terapkan Filter
      </button>
      <button type="button" className="btn btn-secondary mt-2" onClick={handleClose}>
        Reset Filter
      </button>
    </div>
  );
};

export default FooterBar;
