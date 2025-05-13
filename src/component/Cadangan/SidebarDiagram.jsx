import React, { useState, useEffect, useRef } from "react";
import column from "../assets/img/charts/column.png";
import line from "../assets/img/charts/lines.png";
import pie from "../assets/img/charts/pie.png";
import table from "../assets/img/charts/table-v2.png";
import donut from "../assets/img/charts/donut.png";
import { HiOutlineChartPie } from "react-icons/hi";
import { SketchPicker } from "react-color";

// Default configuration values
const DEFAULT_CONFIG = {
  colors: ["#4CAF50", "#FF9800", "#2196F3"],
  title: "Visualisasi Data",
  titleFontSize: 18,
  titleFontColor: "#333333",
  titleFontFamily: "Arial",
  titlePosition: "center",
  titleBackgroundColor: "#ffffff",
  titleFontStyle: "normal",

  subtitle: "Sub Judul Visualisasi",
  subtitleFontSize: 14,
  subtitleFontFamily: "Arial",
  subtitleFontColor: "#333333",
  subtitlePosition: "center",
  subtitleBackgroundColor: "#ffffff",
  subtitleTextStyle: "normal",

  fontSize: 14, // Legend Font Size
  fontFamily: "Arial", // Legend Font Family
  fontColor: "#000000", // Legend Font Color

  gridColor: "#E0E0E0",
  gridType: "solid",

  backgroundColor: "#ffffff",

  xAxisFontSize: 12,
  xAxisFontFamily: "Arial",
  xAxisFontColor: "#000000",

  yAxisFontSize: 12,
  yAxisFontFamily: "Arial",
  yAxisFontColor: "#000000",

  pattern: "solid", // Chart pattern

  categoryTitle: "Kategori", // X-Axis Title
  categoryTitleFontSize: 14,
  categoryTitleFontFamily: "Arial",
  categoryTitleFontColor: "#000000",
  categoryTitlePosition: "center",
  categoryTitleBackgroundColor: "#ffffff",
  categoryTitleTextStyle: "normal",

  showValue: true,
  valuePosition: "top",
  valueFontColor: "#000000",
  valueOrientation: "horizontal",

  borderColor: "#000000",
  borderWidth: 1,
  borderType: "solid",
};


const SidebarDiagram = ({
  onVisualizationTypeChange,
  onVisualizationConfigChange, // Crucial prop from parent
  selectedVisualization,
}) => {
  // --- State and Refs ---
  
  const [activePicker, setActivePicker] = useState(null); // Tracks which color picker is open
  const [visualizationSettings, setVisualizationSettings] = useState({ ...DEFAULT_CONFIG });
  const [previousVisualizationId, setPreviousVisualizationId] = useState(null);
  const colorPickerRef = useRef(null);

  // --- Effects ---

  // Effect to load config when selectedVisualization changes
  useEffect(() => {
    if (!selectedVisualization || !selectedVisualization.id) {
      setVisualizationSettings({ ...DEFAULT_CONFIG });
      setPreviousVisualizationId(null);
      // No need to call onVisualizationConfigChange here, parent likely handles reset
      return;
    }

    const shouldLoad = selectedVisualization.id !== previousVisualizationId || previousVisualizationId === null;

    if (shouldLoad) {
        const configToLoad = selectedVisualization.config
            ? { ...DEFAULT_CONFIG, ...selectedVisualization.config } // Merge existing config with defaults
            : { ...DEFAULT_CONFIG }; // Use defaults if no config exists

        // Ensure colors array exists and is an array in the loaded config
        if (!Array.isArray(configToLoad.colors) || configToLoad.colors.length === 0) {
            configToLoad.colors = [...DEFAULT_CONFIG.colors];
        }

        // Robust boolean check for showValue
        configToLoad.showValue = configToLoad.showValue !== undefined ? Boolean(configToLoad.showValue) : DEFAULT_CONFIG.showValue;

        setVisualizationSettings(configToLoad); // Set the entire config object
        setPreviousVisualizationId(selectedVisualization.id); // Update the tracked ID
    }

  }, [selectedVisualization, previousVisualizationId]); // Added previousVisualizationId to dependencies

  // Effect to close color picker on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activePicker !== null &&
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target)
      ) {
        setActivePicker(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activePicker]);


  // --- Event Handlers ---

  // Central function to propagate changes to the parent
  const propagateChanges = (newConfig) => {
    if (typeof onVisualizationConfigChange === 'function') {
      onVisualizationConfigChange(newConfig);
    } else {
      console.error("SidebarDiagram: onVisualizationConfigChange prop is missing or not a function!");
    }
  };

  // Handles color change from SketchPicker AND propagates immediately
  const handleColorChangeAndPropagate = (index, newColor) => {
    const newColors = [...visualizationSettings.colors];
    newColors[index] = newColor.hex;

    const nextSettings = {
        ...visualizationSettings,
        colors: newColors
    };

    setVisualizationSettings(nextSettings); // Update local state
    propagateChanges(nextSettings); // Propagate the full new config
  };

  // Updates local settings state AND propagates ALL settings.
  const updateSettingAndPropagate = (key, value) => {
    let processedValue = value;

    // --- Type processing ---
    if (key === 'showValue') {
      processedValue = value === 'true' || value === true; // Handle string 'true' from select or actual boolean
    } else if ([
        'titleFontSize', 'subtitleFontSize', 'fontSize', 'categoryTitleFontSize',
        'xAxisFontSize', 'yAxisFontSize', 'borderWidth'
    ].includes(key)) {
      processedValue = parseFloat(value);
      if (isNaN(processedValue)) {
        processedValue = DEFAULT_CONFIG[key] || 0; // Fallback to default or 0 if parsing fails
      }
    }
    // --- End Type processing ---

    // Create the next state object
    const nextSettings = {
      ...visualizationSettings,
      [key]: processedValue
    };

    // Update local state first
    setVisualizationSettings(nextSettings);

    // Then propagate the complete configuration object
    propagateChanges(nextSettings);
  };

  // Add Color and propagate
   const addColor = () => {
    if (visualizationSettings.colors.length < 6) {
      const newColors = [...visualizationSettings.colors, '#cccccc']; // Default new color
      const nextSettings = { ...visualizationSettings, colors: newColors };
      setVisualizationSettings(nextSettings);
      propagateChanges(nextSettings);
    }
  };

  // Remove Color and propagate
  const removeColor = () => {
    if (visualizationSettings.colors.length > 1) {
      const newColors = visualizationSettings.colors.slice(0, -1);
      if (activePicker === visualizationSettings.colors.length - 1) {
        setActivePicker(null); // Close picker if it was for the removed color
      }
      const nextSettings = { ...visualizationSettings, colors: newColors };
      setVisualizationSettings(nextSettings);
      propagateChanges(nextSettings);
    }
  };


  // --- Rendering ---

  const visualizationOptions = [
    { type: "bar", label: "Batang", image: column },
    { type: "line", label: "Line", image: line },
    { type: "pie", label: "Pie", image: pie },
    { type: "donut", label: "Donut", image: donut },
    { type: "", label: "Tabel", image: table }, // Assuming empty type means table
  ];

  // Use visualizationSettings.colors for rendering color boxes
  const currentColors = visualizationSettings.colors || [];

   if (!visualizationSettings) {
     return null; // Or a loading indicator
   }

  return (
    <div
      id="sidebar-diagram"
      className="sidebar-2"
    >
      {/* Header */}
      <div className="sub-title">
        <HiOutlineChartPie size={48} className="text-muted" />
        <span className="h5 mb-0 fw-light">Diagram</span>
      </div>
      <hr className="full-line" />

      {/* Content Padding */}
      <div className="p-2">

        {/* Selection Info */}
        {selectedVisualization ? (
            <div className="alert alert-info alert-sm py-2 px-3 mb-3" role="alert">
             <small className="fw-medium">
                Mengonfigurasi: {selectedVisualization.title || "Visualisasi Data"} 
             </small>
            </div>
        ) : (
            <div className="alert alert-secondary alert-sm py-2 px-3 mb-3" role="alert">
            <small className="fw-medium">
                Pilih jenis visualisasi terlebih dahulu
            </small>
            </div>
        )}

        {/* Visualization Type Selection */}
        <div className="mb-4">
            <label className="form-label fw-medium mb-2">
            Pilih Jenis Visualisasi:
            </label>
            <div className="row g-2 row-cols-2">
            {visualizationOptions.map((visualization) => (
                <div className="col text-center" key={visualization.label}>
                    <div
                        onClick={() => onVisualizationTypeChange(visualization.type)}
                        style={{ cursor: 'pointer', width: "85px" }}
                        className={`card card-body p-2 ${selectedVisualization?.type === visualization.type ? 'border-primary border-2' : 'border'}`}
                    >
                        <img
                        src={visualization.image}
                        alt={`${visualization.label} Visualization`}
                        style={{ width: "50px", height: "50px", objectFit: "contain", margin: "0 auto 0.25rem auto" }}
                        />
                        <small className="text-body-secondary" style={{ fontSize: '0.75rem' }}>
                        {visualization.label}
                        </small>
                    </div>
                </div>
            ))}
            </div>
        </div>

        {/* Accordion Settings - Only render if a visualization is selected */}
        {selectedVisualization && (
            <>
            <hr className="full-line" />
            <div className="accordion" style={{ margin: "-10px" }} id="diagramSettingsAccordion">


             {/* --- Accordion Item: Title --- */}
            <div className="accordion-item">
                <h2 className="accordion-header" id="headingTitle">
                <button className="accordion-button collapsed py-2 px-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTitle" aria-expanded="false" aria-controls="collapseTitle">
                    <small className="fw-medium">Pengaturan Judul</small>
                </button>
                </h2>
                <div id="collapseTitle" className="accordion-collapse collapse" aria-labelledby="headingTitle" data-bs-parent="#diagramSettingsAccordion">
                    <div className="accordion-body pt-2 pb-3">
                        {/* Title */}
                        <div className="mb-3 pb-3 border-bottom">
                            <label className="form-label form-label-sm fw-medium mb-1">Judul Utama:</label>
                            <input type="text" className="form-control form-control-sm mb-2" value={visualizationSettings.title} onChange={(e) => updateSettingAndPropagate("title", e.target.value)}/>
                            <div className="row g-2 mb-2">
                                <div className="col"><input type="number" className="form-control form-control-sm" placeholder="Size" value={visualizationSettings.titleFontSize} onChange={(e) => updateSettingAndPropagate("titleFontSize", e.target.value)} min="10" max="36"/></div>
                                <div className="col">
                                    <select className="form-select form-select-sm" value={visualizationSettings.titleFontFamily} onChange={(e) => updateSettingAndPropagate("titleFontFamily", e.target.value)}>
                                        <option value="Arial">Arial</option><option value="Helvetica">Helvetica</option><option value="Times New Roman">Times New Roman</option><option value="Courier New">Courier New</option><option value="Verdana">Verdana</option><option value="Georgia">Georgia</option>
                                    </select>
                                </div>
                                <div className="col d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{width:'30px', height:'20px'}} value={visualizationSettings.titleFontColor} onChange={(e) => updateSettingAndPropagate("titleFontColor", e.target.value)}/><span className="ms-2 small text-muted">Font</span></div>
                            </div>
                            <div className="mb-2"><label className="form-label form-label-sm mb-1">Posisi:</label><select className="form-select form-select-sm" value={visualizationSettings.titlePosition} onChange={(e) => updateSettingAndPropagate("titlePosition", e.target.value)}><option value="left">Kiri</option><option value="center">Tengah</option><option value="right">Kanan</option></select></div>
                            <div className="mb-2"><label className="form-label form-label-sm mb-1">Style:</label><select className="form-select form-select-sm" value={visualizationSettings.titleFontStyle} onChange={(e) => updateSettingAndPropagate('titleFontStyle', e.target.value)}><option value="normal">Normal</option><option value="italic">Italic</option><option value="underline">Underline</option></select></div>
                            <div><label className="form-label form-label-sm mb-1">Background:</label><div className="d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{width:'30px', height:'20px'}} value={visualizationSettings.titleBackgroundColor} onChange={(e) => updateSettingAndPropagate("titleBackgroundColor", e.target.value)}/><span className="ms-2 small text-muted">{visualizationSettings.titleBackgroundColor}</span></div></div>
                        </div>
                        {/* Subtitle */}
                        <div className="mb-0">
                            <label className="form-label form-label-sm fw-medium mb-1">Sub Judul:</label>
                            <input type="text" className="form-control form-control-sm mb-2" value={visualizationSettings.subtitle} onChange={(e) => updateSettingAndPropagate("subtitle", e.target.value)}/>
                             <div className="row g-2 mb-2">
                                <div className="col"><input type="number" className="form-control form-control-sm" placeholder="Size" value={visualizationSettings.subtitleFontSize} onChange={(e) => updateSettingAndPropagate("subtitleFontSize", e.target.value)} min="8" max="28"/></div>
                                <div className="col">
                                    <select className="form-select form-select-sm" value={visualizationSettings.subtitleFontFamily} onChange={(e) => updateSettingAndPropagate("subtitleFontFamily", e.target.value)}>
                                        <option value="Arial">Arial</option><option value="Helvetica">Helvetica</option><option value="Times New Roman">Times New Roman</option><option value="Courier New">Courier New</option><option value="Verdana">Verdana</option><option value="Georgia">Georgia</option>
                                    </select>
                                </div>
                                <div className="col d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{width:'30px', height:'20px'}} value={visualizationSettings.subtitleFontColor} onChange={(e) => updateSettingAndPropagate("subtitleFontColor", e.target.value)}/><span className="ms-2 small text-muted">Font</span></div>
                            </div>
                            <div className="mb-2"><label className="form-label form-label-sm mb-1">Posisi:</label><select className="form-select form-select-sm" value={visualizationSettings.subtitlePosition} onChange={(e) => updateSettingAndPropagate("subtitlePosition", e.target.value)}><option value="left">Kiri</option><option value="center">Tengah</option><option value="right">Kanan</option></select></div>
                            <div className="mb-2"><label className="form-label form-label-sm mb-1">Style:</label><select className="form-select form-select-sm" value={visualizationSettings.subtitleTextStyle} onChange={(e) => updateSettingAndPropagate('subtitleTextStyle', e.target.value)}><option value="normal">Normal</option><option value="italic">Italic</option><option value="underline">Underline</option></select></div>
                            <div><label className="form-label form-label-sm mb-1">Background:</label><div className="d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{width:'30px', height:'20px'}} value={visualizationSettings.subtitleBackgroundColor} onChange={(e) => updateSettingAndPropagate("subtitleBackgroundColor", e.target.value)}/><span className="ms-2 small text-muted">{visualizationSettings.subtitleBackgroundColor}</span></div></div>
                        </div>
                    </div>
                </div>
            </div>


            {/* --- Accordion Item: Chart --- */}
            <div className="accordion-item">
                <h2 className="accordion-header" id="headingChart">
                    <button className="accordion-button collapsed py-2 px-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapseChart" aria-expanded="false" aria-controls="collapseChart">
                        <small className="fw-medium">Pengaturan Chart</small>
                    </button>
                </h2>
                <div id="collapseChart" className="accordion-collapse collapse" aria-labelledby="headingChart" data-bs-parent="#diagramSettingsAccordion">
                    <div className="accordion-body pt-2 pb-3">
                        {/* Colors */}
                        <div className="mb-3 pb-3 border-bottom">
                            <label className="form-label form-label-sm fw-medium mb-2">Warna Data:</label>
                            <div className="d-flex flex-row flex-wrap gap-2 align-items-center">
                                {currentColors.map((color, index) => (
                                <div key={index} className="position-relative">
                                    <div onClick={() => setActivePicker(activePicker === index ? null : index)} style={{ width: '25px', height: '25px', backgroundColor: color, border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }} title={`Color ${index + 1}: ${color}`}/>
                                    {activePicker === index && (
                                    <div className="position-absolute z-1" style={{ top: '30px', left: '0' }} ref={colorPickerRef}>
                                        <div className="fixed z-50">
                                            {/* Use handleColorChangeAndPropagate */}
                                            <SketchPicker
                                                color={color}
                                                onChange={(newColor) => handleColorChangeAndPropagate(index, newColor)}
                                                disableAlpha={true}
                                            />
                                        </div>
                                    </div>
                                    )}
                                </div>
                                ))}
                                {currentColors.length < 6 && (<button type="button" className="btn btn-xs btn-outline-secondary p-0" onClick={addColor} title="Add" style={{ width: '25px', height: '25px', lineHeight: '1', fontSize: '1rem'}}>+</button>)}
                                {currentColors.length > 1 && (<button type="button" className="btn btn-xs btn-outline-secondary p-0" onClick={removeColor} title="Remove" style={{ width: '25px', height: '25px', lineHeight: '1', fontSize: '1rem'}}>-</button>)}
                            </div>
                             {/* Removed manual apply notice */}
                        </div>
                        {/* Legend */}
                        <div className="mb-3 pb-3 border-bottom">
                            <label className="form-label form-label-sm fw-medium mb-1">Font Legend:</label>
                            <div className="row g-2 mb-2">
                                <div className="col"><input type="number" className="form-control form-control-sm" placeholder="Size" value={visualizationSettings.fontSize} onChange={(e) => updateSettingAndPropagate("fontSize", e.target.value)} min="8" max="24"/></div>
                                <div className="col"><select className="form-select form-select-sm" value={visualizationSettings.fontFamily} onChange={(e) => updateSettingAndPropagate("fontFamily", e.target.value)}><option value="Arial">Arial</option><option value="Helvetica">Helvetica</option><option value="Times New Roman">TR</option><option value="Courier New">Courier</option><option value="Verdana">Verdana</option><option value="Georgia">Georgia</option></select></div>
                            </div>
                            <div><label className="form-label form-label-sm mb-1">Warna Font:</label><div className="d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{width:'30px', height:'20px'}} value={visualizationSettings.fontColor} onChange={(e) => updateSettingAndPropagate("fontColor", e.target.value)}/><span className="ms-2 small text-muted">{visualizationSettings.fontColor}</span></div></div>
                        </div>
                        {/* Values */}
                        <div className="mb-3 pb-3 border-bottom">
                            <label className="form-label form-label-sm fw-medium mb-1">Nilai Data di Chart:</label>
                            <div className="mb-2"><label className="form-label form-label-sm mb-1">Tampilkan:</label><select className="form-select form-select-sm" value={String(visualizationSettings.showValue)} onChange={(e) => updateSettingAndPropagate('showValue', e.target.value)}><option value="true">Ya</option><option value="false">Tidak</option></select></div>
                            {visualizationSettings.showValue && (<>
                                <div className="mb-2"><label className="form-label form-label-sm mb-1">Posisi:</label><select className="form-select form-select-sm" value={visualizationSettings.valuePosition} onChange={(e) => updateSettingAndPropagate("valuePosition", e.target.value)}><option value="top">Atas</option><option value="center">Tengah</option><option value="bottom">Bawah</option></select></div>
                                <div className="mb-2"><label className="form-label form-label-sm mb-1">Orientasi:</label><select className="form-select form-select-sm" value={visualizationSettings.valueOrientation} onChange={(e) => updateSettingAndPropagate('valueOrientation', e.target.value)}><option value="horizontal">Horizontal</option><option value="vertical">Vertikal</option></select></div>
                                <div><label className="form-label form-label-sm mb-1">Warna Font:</label><div className="d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{width:'30px', height:'20px'}} value={visualizationSettings.valueFontColor} onChange={(e) => updateSettingAndPropagate("valueFontColor", e.target.value)}/><span className="ms-2 small text-muted">{visualizationSettings.valueFontColor}</span></div></div>
                            </>)}
                        </div>
                        {/* Border */}
                        <div className="mb-3 pb-3 border-bottom">
                            <label className="form-label form-label-sm fw-medium mb-1">Border Chart:</label>
                            <div className="row g-2 mb-2 align-items-center">
                                <div className="col-4"><label className="form-label form-label-sm mb-0">Warna:</label></div>
                                <div className="col-8 d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{width:'30px', height:'20px'}} value={visualizationSettings.borderColor} onChange={(e) => updateSettingAndPropagate('borderColor', e.target.value)}/><span className="ms-2 small text-muted">{visualizationSettings.borderColor}</span></div>
                            </div>
                            <div className="row g-2 mb-2 align-items-center">
                                <div className="col-4"><label className="form-label form-label-sm mb-0">Tebal (px):</label></div>
                                <div className="col-8"><input type="number" className="form-control form-control-sm" value={visualizationSettings.borderWidth} onChange={(e) => updateSettingAndPropagate('borderWidth', e.target.value)} min="0" max="10"/></div>
                            </div>
                            <div className="row g-2 align-items-center">
                                <div className="col-4"><label className="form-label form-label-sm mb-0">Tipe:</label></div>
                                <div className="col-8"><select className="form-select form-select-sm" value={visualizationSettings.borderType} onChange={(e) => updateSettingAndPropagate('borderType', e.target.value)}><option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option><option value="none">None</option></select></div>
                            </div>
                        </div>
                         {/* Pattern */}
                        <div className="mb-0">
                            <label className="form-label form-label-sm fw-medium mb-1">Pola Chart:</label>
                            <select className="form-select form-select-sm" value={visualizationSettings.pattern} onChange={(e) => updateSettingAndPropagate("pattern", e.target.value)}>
                                <option value="solid">Solid</option><option value="striped">Striped</option><option value="dotted">Dotted</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Accordion Item: Grid --- */}
            <div className="accordion-item">
                <h2 className="accordion-header" id="headingGrid">
                    <button className="accordion-button collapsed py-2 px-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapseGrid" aria-expanded="false" aria-controls="collapseGrid">
                       <small className="fw-medium">Pengaturan Grid</small>
                    </button>
                </h2>
                <div id="collapseGrid" className="accordion-collapse collapse" aria-labelledby="headingGrid" data-bs-parent="#diagramSettingsAccordion">
                    <div className="accordion-body pt-2 pb-3">
                         <div className="row g-2 mb-2 align-items-center">
                            <div className="col-4"><label className="form-label form-label-sm mb-0">Warna:</label></div>
                            <div className="col-8 d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{width:'30px', height:'20px'}} value={visualizationSettings.gridColor} onChange={(e) => updateSettingAndPropagate("gridColor", e.target.value)}/><span className="ms-2 small text-muted">{visualizationSettings.gridColor}</span></div>
                        </div>
                        <div className="row g-2 align-items-center">
                            <div className="col-4"><label className="form-label form-label-sm mb-0">Tipe:</label></div>
                            <div className="col-8"><select className="form-select form-select-sm" value={visualizationSettings.gridType} onChange={(e) => updateSettingAndPropagate("gridType", e.target.value)}><option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option><option value="none">None</option></select></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Accordion Item: X-Axis --- */}
             <div className="accordion-item">
                <h2 className="accordion-header" id="headingXAxis">
                    <button className="accordion-button collapsed py-2 px-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapseXAxis" aria-expanded="false" aria-controls="collapseXAxis">
                       <small className="fw-medium">Pengaturan Sumbu X</small>
                    </button>
                </h2>
                <div id="collapseXAxis" className="accordion-collapse collapse" aria-labelledby="headingXAxis" data-bs-parent="#diagramSettingsAccordion">
                   <div className="accordion-body pt-2 pb-3">
                         {/* X-Axis Title */}
                        <div className="mb-3 pb-3 border-bottom">
                            <label className="form-label form-label-sm fw-medium mb-1">Judul Sumbu X:</label>
                             <input type="text" className="form-control form-control-sm mb-2" value={visualizationSettings.categoryTitle} onChange={(e) => updateSettingAndPropagate("categoryTitle", e.target.value)}/>
                            <div className="row g-2 mb-2">
                                <div className="col"><input type="number" className="form-control form-control-sm" placeholder="Size" value={visualizationSettings.categoryTitleFontSize} onChange={(e) => updateSettingAndPropagate("categoryTitleFontSize", e.target.value)} min="8" max="24"/></div>
                                <div className="col"><select className="form-select form-select-sm" value={visualizationSettings.categoryTitleFontFamily} onChange={(e) => updateSettingAndPropagate("categoryTitleFontFamily", e.target.value)}><option value="Arial">Arial</option><option value="Helvetica">Helvetica</option><option value="Times New Roman">TR</option><option value="Courier New">Courier</option><option value="Verdana">Verdana</option><option value="Georgia">Georgia</option></select></div>
                            </div>
                             <div className="mb-2"><label className="form-label form-label-sm mb-1">Warna Font:</label><div className="d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{width:'30px', height:'20px'}} value={visualizationSettings.categoryTitleFontColor} onChange={(e) => updateSettingAndPropagate("categoryTitleFontColor", e.target.value)}/><span className="ms-2 small text-muted">{visualizationSettings.categoryTitleFontColor}</span></div></div>
                            <div className="mb-2"><label className="form-label form-label-sm mb-1">Posisi:</label><select className="form-select form-select-sm" value={visualizationSettings.categoryTitlePosition} onChange={(e) => updateSettingAndPropagate("categoryTitlePosition", e.target.value)}><option value="left">Kiri</option><option value="center">Tengah</option><option value="right">Kanan</option></select></div>
                            <div className="mb-2"><label className="form-label form-label-sm mb-1">Style:</label><select className="form-select form-select-sm" value={visualizationSettings.categoryTitleTextStyle} onChange={(e) => updateSettingAndPropagate('categoryTitleTextStyle', e.target.value)}><option value="normal">Normal</option><option value="italic">Italic</option><option value="underline">Underline</option></select></div>
                            <div><label className="form-label form-label-sm mb-1">Background:</label><div className="d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{width:'30px', height:'20px'}} value={visualizationSettings.categoryTitleBackgroundColor} onChange={(e) => updateSettingAndPropagate("categoryTitleBackgroundColor", e.target.value)}/><span className="ms-2 small text-muted">{visualizationSettings.categoryTitleBackgroundColor}</span></div></div>
                        </div>
                        {/* X-Axis Labels */}
                         <div className="mb-0">
                            <label className="form-label form-label-sm fw-medium mb-1">Label Sumbu X:</label>
                             <div className="row g-2 mb-2">
                                <div className="col"><input type="number" className="form-control form-control-sm" placeholder="Size" value={visualizationSettings.xAxisFontSize} onChange={(e) => updateSettingAndPropagate("xAxisFontSize", e.target.value)} min="8" max="18"/></div>
                                <div className="col"><select className="form-select form-select-sm" value={visualizationSettings.xAxisFontFamily} onChange={(e) => updateSettingAndPropagate("xAxisFontFamily", e.target.value)}><option value="Arial">Arial</option><option value="Helvetica">Helvetica</option><option value="Times New Roman">TR</option><option value="Courier New">Courier</option><option value="Verdana">Verdana</option><option value="Georgia">Georgia</option></select></div>
                            </div>
                            <div><label className="form-label form-label-sm mb-1">Warna Font Label:</label><div className="d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{width:'30px', height:'20px'}} value={visualizationSettings.xAxisFontColor} onChange={(e) => updateSettingAndPropagate("xAxisFontColor", e.target.value)}/><span className="ms-2 small text-muted">{visualizationSettings.xAxisFontColor}</span></div></div>
                        </div>
                    </div>
                </div>
            </div>

             {/* --- Accordion Item: Y-Axis --- */}
             <div className="accordion-item">
                <h2 className="accordion-header" id="headingYAxis">
                    <button className="accordion-button collapsed py-2 px-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapseYAxis" aria-expanded="false" aria-controls="collapseYAxis">
                       <small className="fw-medium">Pengaturan Sumbu Y</small>
                    </button>
                </h2>
                <div id="collapseYAxis" className="accordion-collapse collapse" aria-labelledby="headingYAxis" data-bs-parent="#diagramSettingsAccordion">
                   <div className="accordion-body pt-2 pb-3">
                         {/* Y-Axis Labels */}
                         <div className="mb-0">
                            <label className="form-label form-label-sm fw-medium mb-1">Label Sumbu Y:</label>
                             <div className="row g-2 mb-2">
                                <div className="col"><input type="number" className="form-control form-control-sm" placeholder="Size" value={visualizationSettings.yAxisFontSize} onChange={(e) => updateSettingAndPropagate("yAxisFontSize", e.target.value)} min="8" max="18"/></div>
                                <div className="col"><select className="form-select form-select-sm" value={visualizationSettings.yAxisFontFamily} onChange={(e) => updateSettingAndPropagate("yAxisFontFamily", e.target.value)}><option value="Arial">Arial</option><option value="Helvetica">Helvetica</option><option value="Times New Roman">TR</option><option value="Courier New">Courier</option><option value="Verdana">Verdana</option><option value="Georgia">Georgia</option></select></div>
                            </div>
                            <div><label className="form-label form-label-sm mb-1">Warna Font Label:</label><div className="d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{width:'30px', height:'20px'}} value={visualizationSettings.yAxisFontColor} onChange={(e) => updateSettingAndPropagate("yAxisFontColor", e.target.value)}/><span className="ms-2 small text-muted">{visualizationSettings.yAxisFontColor}</span></div></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Accordion Item: Background --- */}
            <div className="accordion-item">
                <h2 className="accordion-header" id="headingBackground">
                    <button className="accordion-button collapsed py-2 px-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapseBackground" aria-expanded="false" aria-controls="collapseBackground">
                        <small className="fw-medium">Pengaturan Background</small>
                    </button>
                </h2>
                <div id="collapseBackground" className="accordion-collapse collapse" aria-labelledby="headingBackground" data-bs-parent="#diagramSettingsAccordion">
                   <div className="accordion-body pt-2 pb-3">
                         <div className="mb-0">
                            <label className="form-label form-label-sm fw-medium mb-1">Warna Background Chart:</label>
                             <div className="d-flex align-items-center"><input type="color" className="form-control form-control-sm form-control-color p-0 border-0" style={{width:'30px', height:'20px'}} value={visualizationSettings.backgroundColor} onChange={(e) => updateSettingAndPropagate("backgroundColor", e.target.value)}/><span className="ms-2 small text-muted">{visualizationSettings.backgroundColor}</span></div>
                         </div>
                    </div>
                </div>
            </div>


            </div> 
            </>
        )}

        <div style={{ height: "20px" }}></div> {/* Spacer */}
      </div> {/* End Padding Div */}
    </div> // End Sidebar Root
  );
};

export default SidebarDiagram;