import React from "react";

const AxisSettings = ({
  settings,
  onSettingChange,
  axisType // "x" or "y"
}) => {
  const labelPrefix = axisType === 'x' ? 'xAxis' : 'yAxis';
  const titlePrefix = 'categoryTitle'; // Specific to X-axis in current design

  return (
    <>
      {axisType === 'x' && (
        <div className="mb-3 pb-3 border-bottom">
          <label className="form-label form-label-sm fw-medium mb-1">Judul Sumbu X:</label>
          <input type="text" className="form-control form-control-sm mb-2" value={settings[titlePrefix]} onChange={(e) => onSettingChange(titlePrefix, e.target.value)} />
          <div className="row g-2 mb-2">
            <div className="col"><input type="number" className="form-control form-control-sm" placeholder="Size" value={settings[`${titlePrefix}FontSize`]} onChange={(e) => onSettingChange(`${titlePrefix}FontSize`, e.target.value)} min="8" max="24" /></div>
            <div className="col"><select className="form-select form-select-sm" value={settings[`${titlePrefix}FontFamily`]} onChange={(e) => onSettingChange(`${titlePrefix}FontFamily`, e.target.value)}><option value="Arial">Arial</option><option value="Helvetica">Helvetica</option><option value="Times New Roman">TR</option><option value="Courier New">Courier</option><option value="Verdana">Verdana</option><option value="Georgia">Georgia</option></select></div>
          </div>
          <div className="mb-2"><label className="form-label form-label-sm mb-1">Warna Font:</label><div className="d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{ width: '30px', height: '20px' }} value={settings[`${titlePrefix}FontColor`]} onChange={(e) => onSettingChange(`${titlePrefix}FontColor`, e.target.value)} /><span className="ms-2 small text-muted">{settings[`${titlePrefix}FontColor`]}</span></div></div>
          <div className="mb-2"><label className="form-label form-label-sm mb-1">Posisi:</label><select className="form-select form-select-sm" value={settings[`${titlePrefix}Position`]} onChange={(e) => onSettingChange(`${titlePrefix}Position`, e.target.value)}><option value="left">Kiri</option><option value="center">Tengah</option><option value="right">Kanan</option></select></div>
          <div className="mb-2"><label className="form-label form-label-sm mb-1">Style:</label><select className="form-select form-select-sm" value={settings[`${titlePrefix}TextStyle`]} onChange={(e) => onSettingChange(`${titlePrefix}TextStyle`, e.target.value)}><option value="normal">Normal</option><option value="italic">Italic</option><option value="underline">Underline</option></select></div>
          <div><label className="form-label form-label-sm mb-1">Background:</label><div className="d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{ width: '30px', height: '20px' }} value={settings[`${titlePrefix}BackgroundColor`]} onChange={(e) => onSettingChange(`${titlePrefix}BackgroundColor`, e.target.value)} /><span className="ms-2 small text-muted">{settings[`${titlePrefix}BackgroundColor`]}</span></div></div>
        </div>
      )}

      <div className="mb-0">
        <label className="form-label form-label-sm fw-medium mb-1">Label Sumbu {axisType.toUpperCase()}:</label>
        <div className="row g-2 mb-2">
          <div className="col"><input type="number" className="form-control form-control-sm" placeholder="Size" value={settings[`${labelPrefix}FontSize`]} onChange={(e) => onSettingChange(`${labelPrefix}FontSize`, e.target.value)} min="8" max="18" /></div>
          <div className="col"><select className="form-select form-select-sm" value={settings[`${labelPrefix}FontFamily`]} onChange={(e) => onSettingChange(`${labelPrefix}FontFamily`, e.target.value)}><option value="Arial">Arial</option><option value="Helvetica">Helvetica</option><option value="Times New Roman">TR</option><option value="Courier New">Courier</option><option value="Verdana">Verdana</option><option value="Georgia">Georgia</option></select></div>
        </div>
        <div><label className="form-label form-label-sm mb-1">Warna Font Label:</label><div className="d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{ width: '30px', height: '20px' }} value={settings[`${labelPrefix}FontColor`]} onChange={(e) => onSettingChange(`${labelPrefix}FontColor`, e.target.value)} /><span className="ms-2 small text-muted">{settings[`${labelPrefix}FontColor`]}</span></div></div>
      </div>
    </>
  );
};

export default AxisSettings;