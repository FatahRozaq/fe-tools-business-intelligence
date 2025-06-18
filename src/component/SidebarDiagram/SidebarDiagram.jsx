import React, { useState, useEffect, useRef } from "react";
import { HiOutlineChartPie } from "react-icons/hi";
// No SketchPicker here, it's in ChartSettings.js

// Import constants
import { DEFAULT_CONFIG, visualizationOptions } from "./ConfigConstants"; // Adjust path if needed

// Import sub-components
import VisualizationTypeSelector from "./VisualizationTypeSelector";
import TitleSettings from "./TitleSettings";
import ChartSettings from "./ChartSettings";
import GridSettings from "./GridSettings";
import AxisSettings from "./AxisSettings";
import BackgroundSettings from "./BackgroundSettings";


const SidebarDiagram = ({
  onVisualizationTypeChange,
  onVisualizationConfigChange,
  selectedVisualization,
}) => {
  const [activePicker, setActivePicker] = useState(null);
  const [visualizationSettings, setVisualizationSettings] = useState({ ...DEFAULT_CONFIG });
  const [previousVisualizationId, setPreviousVisualizationId] = useState(null);
  const colorPickerRef = useRef(null);

  useEffect(() => {
    if (!selectedVisualization || !selectedVisualization.id) {
      setVisualizationSettings({ ...DEFAULT_CONFIG });
      setPreviousVisualizationId(null);
      return;
    }

    const shouldLoad = selectedVisualization.id !== previousVisualizationId || previousVisualizationId === null;

    if (shouldLoad) {
      const configToLoad = selectedVisualization.config
        ? { ...DEFAULT_CONFIG, ...selectedVisualization.config }
        : { ...DEFAULT_CONFIG };

      if (!Array.isArray(configToLoad.colors) || configToLoad.colors.length === 0) {
        configToLoad.colors = [...DEFAULT_CONFIG.colors];
      }
      configToLoad.showValue = configToLoad.showValue !== undefined ? Boolean(configToLoad.showValue) : DEFAULT_CONFIG.showValue;

      setVisualizationSettings(configToLoad);
      setPreviousVisualizationId(selectedVisualization.id);
    }
  }, [selectedVisualization, previousVisualizationId]);

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

  const propagateChanges = (newConfig) => {
    if (typeof onVisualizationConfigChange === 'function') {
      onVisualizationConfigChange(newConfig);
    } else {
      console.error("SidebarDiagram: onVisualizationConfigChange prop is missing or not a function!");
    }
  };

  const handleColorChangeAndPropagate = (index, newColor) => {
    const newColors = [...visualizationSettings.colors];
    newColors[index] = newColor.hex;
    const nextSettings = { ...visualizationSettings, colors: newColors };
    setVisualizationSettings(nextSettings);
    propagateChanges(nextSettings);
  };

  const updateSettingAndPropagate = (key, value) => {
    let processedValue = value;
    if (key === 'showValue') {
      processedValue = value === 'true' || value === true;
    } else if ([
      'titleFontSize', 'subtitleFontSize', 'fontSize', 'categoryTitleFontSize',
      'xAxisFontSize', 'yAxisFontSize', 'borderWidth'
    ].includes(key)) {
      processedValue = parseFloat(value);
      if (isNaN(processedValue)) {
        processedValue = DEFAULT_CONFIG[key] || 0;
      }
    }
    const nextSettings = { ...visualizationSettings, [key]: processedValue };
    setVisualizationSettings(nextSettings);
    propagateChanges(nextSettings);
  };

  const addColor = () => {
    if (visualizationSettings.colors.length < 6) {
      const newColors = [...visualizationSettings.colors, '#cccccc'];
      const nextSettings = { ...visualizationSettings, colors: newColors };
      setVisualizationSettings(nextSettings);
      propagateChanges(nextSettings);
    }
  };

  const removeColor = () => {
    if (visualizationSettings.colors.length > 1) {
      const newColors = visualizationSettings.colors.slice(0, -1);
      if (activePicker === visualizationSettings.colors.length - 1) {
        setActivePicker(null);
      }
      const nextSettings = { ...visualizationSettings, colors: newColors };
      setVisualizationSettings(nextSettings);
      propagateChanges(nextSettings);
    }
  };

  if (!visualizationSettings) {
    return null;
  }

  return (
    <div id="sidebar-diagram" className="sidebar-2">
      <div className="sub-title">
        <HiOutlineChartPie size={48} className="text-muted" />
        <span className="h5 mb-0 fw-light">Diagram</span>
      </div>
      <hr className="full-line" />
      <div className="p-2">
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

        <VisualizationTypeSelector
          options={visualizationOptions}
          selectedType={selectedVisualization?.type}
          onTypeChange={onVisualizationTypeChange}
        />

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
                    <TitleSettings
                      settings={visualizationSettings}
                      onSettingChange={updateSettingAndPropagate}
                    />
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
                    <ChartSettings
                      settings={visualizationSettings}
                      onSettingChange={updateSettingAndPropagate}
                      onColorChange={handleColorChangeAndPropagate}
                      onAddColor={addColor}
                      onRemoveColor={removeColor}
                      activePicker={activePicker}
                      setActivePicker={setActivePicker}
                      colorPickerRef={colorPickerRef}
                    />
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
                    <GridSettings
                      settings={visualizationSettings}
                      onSettingChange={updateSettingAndPropagate}
                    />
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
                    <AxisSettings
                      settings={visualizationSettings}
                      onSettingChange={updateSettingAndPropagate}
                      axisType="x"
                    />
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
                    <AxisSettings
                      settings={visualizationSettings}
                      onSettingChange={updateSettingAndPropagate}
                      axisType="y"
                    />
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
                    <BackgroundSettings
                      settings={visualizationSettings}
                      onSettingChange={updateSettingAndPropagate}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        <div style={{ height: "20px" }}></div> {/* Spacer */}
      </div>
    </div>
  );
};

export default SidebarDiagram;