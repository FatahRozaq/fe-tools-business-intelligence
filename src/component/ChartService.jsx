import axios from 'axios';
import config from '../config';

class ChartService {
  /**
   * Fetch all saved charts
   */
  static async getAllCharts() {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/kelola-dashboard/charts`);
      return response.data;
    }
}

export default ChartService; catch (error) {
      console.error('Error fetching charts:', error);
      throw error;
    }
  }

  /**
   * Get chart by ID
   */
  static async getChartById(chartId) {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/kelola-dashboard/charts/${chartId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching chart ${chartId}:`, error);
      throw error;
    }
  }

  /**
   * Save a new chart
   */
  static async saveChart(chartData) {
    try {
      const response = await axios.post(`${config.API_BASE_URL}/api/kelola-dashboard/save-chart`, chartData);
      return response.data;
    } catch (error) {
      console.error('Error saving chart:', error);
      throw error;
    }
  }

  /**
   * Update an existing chart
   */
  static async updateChart(chartId, chartData) {
    try {
      const response = await axios.put(`${config.API_BASE_URL}/api/kelola-dashboard/charts/${chartId}`, chartData);
      return response.data;
    } catch (error) {
      console.error(`Error updating chart ${chartId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a chart
   */
  static async deleteChart(chartId) {
    try {
      const response = await axios.delete(`${config.API_BASE_URL}/api/kelola-dashboard/charts/${chartId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting chart ${chartId}:`, error);
      throw error;
    }
  }

  /**
   * Update chart position and size
   */
  static async updateChartPosition(chartId, position, size) {
    try {
      const response = await axios.put(`${config.API_BASE_URL}/api/kelola-dashboard/charts/${chartId}`, {
        position_x: position.x,
        position_y: position.y,
        width: size.width,
        height: size.height
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating chart ${chartId} position:`, error);
      throw error;
    }
  }