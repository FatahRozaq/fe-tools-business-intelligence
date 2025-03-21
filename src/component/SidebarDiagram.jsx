import React from "react";

const SidebarDiagram = () => {
  return (
    <div id="sidebar-diagram" className="sidebar-2">
      <div className="sub-title">
        <img src="/assets/img/icons/ChartPieOutline.png" alt="" />
        <span className="sub-text">Diagram</span>
      </div>
      <hr className="full-line" />
      <div className="form-diagram">
        <div className="form-group">
          <span>Batang</span>
          <div className="card-row">
            <div className="mini-card" />
            <div className="mini-card" />
            <div className="mini-card" />
            <div className="mini-card" />
          </div>
        </div>
        <div className="form-group">
          <span>Kolom</span>
          <div className="card-row">
            <div className="mini-card" />
            <div className="mini-card" />
            <div className="mini-card" />
            <div className="mini-card" />
          </div>
        </div>
        <div className="form-group">
          <span>Pie</span>
          <div className="card-row">
            <div className="mini-card" />
            <div className="mini-card" />
            <div className="mini-card" />
            <div className="mini-card" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarDiagram;
