import React from "react";

const SidebarData = ({ fetchData, addDimensi }) => {
  return (
    <div id="sidebar-data" className="sidebar-2">
      <div className="sub-title">
        <img src="/assets/img/icons/ChartPieOutline.png" alt="" />
        <span className="sub-text">Data</span>
      </div>
      <hr className="full-line" />
      <div className="form-diagram">
        <div className="form-group">
          <span>Dimensi</span>
          <div id="dimensi-container">
            <input type="text" className="dimensi-input" onChange={fetchData} />
          </div>
          <button
            type="button"
            className="btn btn-secondary mt-2"
            onClick={addDimensi}
          >
            Tambah Dimensi
          </button>
        </div>
        <div className="form-group">
          <span>Metrik</span>
          <input type="text" id="metrik-input" onChange={fetchData} />
        </div>
        <div className="form-group">
          <span>Tanggal</span>
          <input type="text" id="tanggal-input" onChange={fetchData} />
        </div>
        <div className="form-group">
          <span>Filter</span>
          <input type="text" id="filter-input" onChange={fetchData} />
        </div>
      </div>
    </div>
  );
};

export default SidebarData;
