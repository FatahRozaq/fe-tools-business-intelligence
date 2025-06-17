import React, { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { TbSql } from "react-icons/tb";
import SubmitButton from "./Button/SubmitButton";

const SidebarQuery = ({ onQuerySubmit, onVisualizationTypeChange }) => {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = () => {
    onQuerySubmit(query); // Kirim query ke parent component (Sidebar.jsx)
    onVisualizationTypeChange("bar");
  };

  return (
    <div id="sidebar-query" className="sidebar-2">
      <div className="sub-title">
        <TbSql size={48} className="text-muted" />
        <span className="sub-text">Query SQL</span>
      </div>
      <hr className="full-line" />
      <div className="form-query">
        <div className="form-group" style={{ width: "100%" }}>
          <textarea
            value={query}
            onChange={handleChange}
            placeholder="Masukkan query SQL di sini..."
            rows={6}
            className="query-input"
          />
        </div>

        <SubmitButton onClick={handleSubmit} text="Submit" />
      </div>
    </div>
  );
};

export default SidebarQuery;
