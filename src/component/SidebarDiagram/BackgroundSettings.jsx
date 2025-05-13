import React from "react";

const BackgroundSettings = ({ settings, onSettingChange }) => {
  return (
    <div className="mb-0">
      <label className="form-label form-label-sm fw-medium mb-1">Warna Background Chart:</label>
      <div className="d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{ width: '30px', height: '20px' }} value={settings.backgroundColor} onChange={(e) => onSettingChange("backgroundColor", e.target.value)} /><span className="ms-2 small text-muted">{settings.backgroundColor}</span></div>
    </div>
  );
};

export default BackgroundSettings;