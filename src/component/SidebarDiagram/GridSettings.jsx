import React from "react";

const GridSettings = ({ settings, onSettingChange }) => {
  return (
    <>
      <div className="row g-2 mb-2 align-items-center">
        <div className="col-4"><label className="form-label form-label-sm mb-0">Warna:</label></div>
        <div className="col-8 d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{ width: '30px', height: '20px' }} value={settings.gridColor} onChange={(e) => onSettingChange("gridColor", e.target.value)} /><span className="ms-2 small text-muted">{settings.gridColor}</span></div>
      </div>
      <div className="row g-2 align-items-center">
        <div className="col-4"><label className="form-label form-label-sm mb-0">Tipe:</label></div>
        <div className="col-8"><select className="form-select form-select-sm" value={settings.gridType} onChange={(e) => onSettingChange("gridType", e.target.value)}><option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option><option value="none">None</option></select></div>
      </div>
    </>
  );
};

export default GridSettings;