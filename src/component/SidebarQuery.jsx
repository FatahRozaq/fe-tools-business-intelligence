import React, { useState } from "react";

const SidebarQuery = ({ onQuerySubmit }) => {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = () => {
    onQuerySubmit(query); // Kirim query ke parent component (Sidebar.jsx)
  };

  return (
    <div id="sidebar-query" className="sidebar-2">
      <div className="sub-title">
        <img src="/assets/img/icons/QueryIcon.png" alt="" />
        <span className="sub-text">Query SQL</span>
      </div>
      <hr className="full-line" />
      <div className="form-query">
        <div className="form-group" style={{width: '100%'}}>
          <textarea
            value={query}
            onChange={handleChange}
            placeholder="Masukkan query SQL di sini..."
            rows={6}
            className="query-input"
          />
        </div>
        <button onClick={handleSubmit} className="submit-query-btn">
          Kirim Data
        </button>
      </div>
    </div>
  );
};

export default SidebarQuery;
