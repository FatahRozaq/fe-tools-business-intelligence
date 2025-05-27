import React from "react";

const TitleSettings = ({ settings, onSettingChange }) => {
  return (
    <>
      {/* Title */}
      <div className="mb-3 pb-3 border-bottom">
        <label className="form-label form-label-sm fw-medium mb-1">Judul Utama:</label>
        <input type="text" className="form-control form-control-sm mb-2" value={settings.title} onChange={(e) => onSettingChange("title", e.target.value)} />
        <div className="row g-2 mb-2">
          <div className="col"><input type="number" className="form-control form-control-sm" placeholder="Size" value={settings.titleFontSize} onChange={(e) => onSettingChange("titleFontSize", e.target.value)} min="10" max="36" /></div>
          <div className="col">
            <select className="form-select form-select-sm" value={settings.titleFontFamily} onChange={(e) => onSettingChange("titleFontFamily", e.target.value)}>
              <option value="Arial">Arial</option><option value="Helvetica">Helvetica</option><option value="Times New Roman">Times New Roman</option><option value="Courier New">Courier New</option><option value="Verdana">Verdana</option><option value="Georgia">Georgia</option>
            </select>
          </div>
          <div className="col d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{ width: '30px', height: '20px' }} value={settings.titleFontColor} onChange={(e) => onSettingChange("titleFontColor", e.target.value)} /><span className="ms-2 small text-muted">Font</span></div>
        </div>
        <div className="mb-2"><label className="form-label form-label-sm mb-1">Posisi:</label><select className="form-select form-select-sm" value={settings.titlePosition} onChange={(e) => onSettingChange("titlePosition", e.target.value)}><option value="left">Kiri</option><option value="center">Tengah</option><option value="right">Kanan</option></select></div>
        {/* <div className="mb-2"><label className="form-label form-label-sm mb-1">Style:</label><select className="form-select form-select-sm" value={settings.titleFontStyle} onChange={(e) => onSettingChange('titleFontStyle', e.target.value)}><option value="normal">Normal</option><option value="italic">Italic</option><option value="underline">Underline</option></select></div>
        <div><label className="form-label form-label-sm mb-1">Background:</label><div className="d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{ width: '30px', height: '20px' }} value={settings.titleBackgroundColor} onChange={(e) => onSettingChange("titleBackgroundColor", e.target.value)} /><span className="ms-2 small text-muted">{settings.titleBackgroundColor}</span></div></div> */}
      </div>
      {/* Subtitle */}
      <div className="mb-0">
        <label className="form-label form-label-sm fw-medium mb-1">Sub Judul:</label>
        <input type="text" className="form-control form-control-sm mb-2" value={settings.subtitle} onChange={(e) => onSettingChange("subtitle", e.target.value)} />
        <div className="row g-2 mb-2">
          <div className="col"><input type="number" className="form-control form-control-sm" placeholder="Size" value={settings.subtitleFontSize} onChange={(e) => onSettingChange("subtitleFontSize", e.target.value)} min="8" max="28" /></div>
          <div className="col">
            <select className="form-select form-select-sm" value={settings.subtitleFontFamily} onChange={(e) => onSettingChange("subtitleFontFamily", e.target.value)}>
              <option value="Arial">Arial</option><option value="Helvetica">Helvetica</option><option value="Times New Roman">Times New Roman</option><option value="Courier New">Courier New</option><option value="Verdana">Verdana</option><option value="Georgia">Georgia</option>
            </select>
          </div>
          <div className="col d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{ width: '30px', height: '20px' }} value={settings.subtitleFontColor} onChange={(e) => onSettingChange("subtitleFontColor", e.target.value)} /><span className="ms-2 small text-muted">Font</span></div>
        </div>
        <div className="mb-2"><label className="form-label form-label-sm mb-1">Posisi:</label><select className="form-select form-select-sm" value={settings.subtitlePosition} onChange={(e) => onSettingChange("subtitlePosition", e.target.value)}><option value="left">Kiri</option><option value="center">Tengah</option><option value="right">Kanan</option></select></div>
        {/* <div className="mb-2"><label className="form-label form-label-sm mb-1">Style:</label><select className="form-select form-select-sm" value={settings.subtitleTextStyle} onChange={(e) => onSettingChange('subtitleTextStyle', e.target.value)}><option value="normal">Normal</option><option value="italic">Italic</option><option value="underline">Underline</option></select></div>
        <div><label className="form-label form-label-sm mb-1">Background:</label><div className="d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{ width: '30px', height: '20px' }} value={settings.subtitleBackgroundColor} onChange={(e) => onSettingChange("subtitleBackgroundColor", e.target.value)} /><span className="ms-2 small text-muted">{settings.subtitleBackgroundColor}</span></div></div> */}
      </div>
    </>
  );
};

export default TitleSettings;