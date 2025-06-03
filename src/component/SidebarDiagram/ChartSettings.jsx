import React from "react";
import { SketchPicker } from "react-color";

const ChartSettings = ({
  settings,
  onSettingChange,
  onColorChange, // Specific for array color changes
  onAddColor,
  onRemoveColor,
  activePicker,
  setActivePicker,
  colorPickerRef
}) => {
  const currentColors = settings.colors || [];

  return (
    <>
      {/* Colors */}
      <div className="mb-3 pb-3 border-bottom">
        <label className="form-label form-label-sm fw-medium mb-2">Warna Data:</label>
        <div className="d-flex flex-row flex-wrap gap-2 align-items-center">
          {currentColors.map((color, index) => (
            <div key={index} className="position-relative">
              <div onClick={() => setActivePicker(activePicker === index ? null : index)} style={{ width: '25px', height: '25px', backgroundColor: color, border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }} title={`Color ${index + 1}: ${color}`} />
              {activePicker === index && (
                <div className="position-absolute z-1" style={{ top: '30px', left: '0' }} ref={index === activePicker ? colorPickerRef : null}> {/* Attach ref only to active picker instance */}
                  <div className="fixed z-50">
                    <SketchPicker
                      color={color}
                      onChange={(newColor) => onColorChange(index, newColor)}
                      disableAlpha={true}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
          {currentColors.length < 6 && (<button type="button" className="btn btn-xs btn-outline-secondary p-0" onClick={onAddColor} title="Add" style={{ width: '25px', height: '25px', lineHeight: '1', fontSize: '1rem' }}>+</button>)}
          {currentColors.length > 1 && (<button type="button" className="btn btn-xs btn-outline-secondary p-0" onClick={onRemoveColor} title="Remove" style={{ width: '25px', height: '25px', lineHeight: '1', fontSize: '1rem' }}>-</button>)}
        </div>
      </div>
      {/* Legend */}
      <div className="mb-3 pb-3 border-bottom">
        <label className="form-label form-label-sm fw-medium mb-1">Font Legend:</label>
        <div className="row g-2 mb-2">
          <div className="col"><input type="number" className="form-control form-control-sm" placeholder="Size" value={settings.fontSize} onChange={(e) => onSettingChange("fontSize", e.target.value)} min="8" max="24" /></div>
          <div className="col"><select className="form-select form-select-sm" value={settings.fontFamily} onChange={(e) => onSettingChange("fontFamily", e.target.value)}><option value="Arial">Arial</option><option value="Helvetica">Helvetica</option><option value="Times New Roman">TR</option><option value="Courier New">Courier</option><option value="Verdana">Verdana</option><option value="Georgia">Georgia</option></select></div>
        </div>
        <div><label className="form-label form-label-sm mb-1">Warna Font:</label><div className="d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{ width: '30px', height: '20px' }} value={settings.fontColor} onChange={(e) => onSettingChange("fontColor", e.target.value)} /><span className="ms-2 small text-muted">{settings.fontColor}</span></div></div>
      </div>
      {/* Values */}
      <div className="mb-3 pb-3 border-bottom">
        <label className="form-label form-label-sm fw-medium mb-1">Nilai Data di Chart:</label>
        <div className="mb-2"><label className="form-label form-label-sm mb-1">Tampilkan:</label><select className="form-select form-select-sm" value={String(settings.showValue)} onChange={(e) => onSettingChange('showValue', e.target.value)}><option value="true">Ya</option><option value="false">Tidak</option></select></div>
        {settings.showValue && (<>
          <div className="mb-2"><label className="form-label form-label-sm mb-1">Posisi:</label><select className="form-select form-select-sm" value={settings.valuePosition} onChange={(e) => onSettingChange("valuePosition", e.target.value)}><option value="top">Atas</option><option value="center">Tengah</option><option value="bottom">Bawah</option></select></div>
          {/* <div className="mb-2"><label className="form-label form-label-sm mb-1">Orientasi:</label><select className="form-select form-select-sm" value={settings.valueOrientation} onChange={(e) => onSettingChange('valueOrientation', e.target.value)}><option value="horizontal">Horizontal</option><option value="vertical">Vertikal</option></select></div> */}
          <div><label className="form-label form-label-sm mb-1">Warna Font:</label><div className="d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{ width: '30px', height: '20px' }} value={settings.valueFontColor} onChange={(e) => onSettingChange("valueFontColor", e.target.value)} /><span className="ms-2 small text-muted">{settings.valueFontColor}</span></div></div>
        </>)}
      </div>
      {/* Border */}
      <div className="mb-3 pb-3 border-bottom">
        <label className="form-label form-label-sm fw-medium mb-1">Border Chart:</label>
        <div className="row g-2 mb-2 align-items-center">
          <div className="col-4"><label className="form-label form-label-sm mb-0">Warna:</label></div>
          <div className="col-8 d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{ width: '30px', height: '20px' }} value={settings.borderColor} onChange={(e) => onSettingChange('borderColor', e.target.value)} /><span className="ms-2 small text-muted">{settings.borderColor}</span></div>
        </div>
        <div className="row g-2 mb-2 align-items-center">
          <div className="col-4"><label className="form-label form-label-sm mb-0">Tebal (px):</label></div>
          <div className="col-8"><input type="number" className="form-control form-control-sm" value={settings.borderWidth} onChange={(e) => onSettingChange('borderWidth', e.target.value)} min="0" max="10" /></div>
        </div>
        <div className="row g-2 align-items-center">
          <div className="col-4"><label className="form-label form-label-sm mb-0">Tipe:</label></div>
          <div className="col-8"><select className="form-select form-select-sm" value={settings.borderType} onChange={(e) => onSettingChange('borderType', e.target.value)}><option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option><option value="none">None</option></select></div>
        </div>
      </div>
      {/* Pattern */}
      <div className="mb-0">
        <label className="form-label form-label-sm fw-medium mb-1">Pola Chart:</label>
        <select className="form-select form-select-sm" value={settings.pattern} onChange={(e) => onSettingChange("pattern", e.target.value)}>
          <option value="solid">Solid</option><option value="striped">Striped</option><option value="dotted">Dotted</option>
        </select>
      </div>
    </>
  );
};

export default ChartSettings;