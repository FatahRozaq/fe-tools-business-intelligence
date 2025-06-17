// src/components/Canvas/api.js
import axios from 'axios';
import config from '../../config'; // Adjust path if config.js is elsewhere

export const fetchVisualizationsAPI = () => {
  return axios.get(`${config.API_BASE_URL}/api/kelola-dashboard/get-visualizations`);
};

export const saveVisualizationAPI = (visualization) => {
  if (!visualization.query || !visualization.type || !visualization.id_datasource) {
    console.warn("Attempted to save visualization with missing required fields (query, type, id_datasource).", visualization);
    return Promise.reject(new Error("Missing required fields"));
  }

  const configObject = typeof visualization.config === 'object' && visualization.config !== null
                       ? visualization.config
                       : {};
  const configString = JSON.stringify(configObject);

  const payload = {
    id_canvas: visualization.id_canvas || 1,
    id_datasource: visualization.id_datasource,
    id_visualization: visualization.id_visualization || visualization.id, // Use id_visualization if present (update), else id (new)
    name: visualization.title || `Visualisasi ${visualization.type}`,
    visualization_type: visualization.type,
    query: visualization.query,
    config: [configString], // WORKAROUND
    width: Math.round(visualization.width) || 600,
    height: Math.round(visualization.height) || 400,
    position_x: Math.round(visualization.x) || 0,
    position_y: Math.round(visualization.y) || 0,
  };
  console.log("Saving visualization to API (Payload):", payload);
  return axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/save-visualization`, payload);
};

export const deleteVisualizationAPI = (id) => {
  return axios.delete(`${config.API_BASE_URL}/api/kelola-dashboard/delete-visualization/${id}`);
};