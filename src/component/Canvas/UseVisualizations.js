// src/components/Canvas/useVisualizations.js
import { useState, useEffect, useCallback } from 'react';
import { fetchVisualizationsAPI, saveVisualizationAPI, deleteVisualizationAPI } from './Api.js';
import { generateUniqueId } from './utils';

const SAVE_DEBOUNCE_DELAY = 1500; // 1.5 seconds

export const useVisualizations = () => {
  const [visualizations, setVisualizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingSaveTimeouts, setPendingSaveTimeouts] = useState({});

  const mapApiVisualizationToState = useCallback((apiVisualization) => {
    let configData = apiVisualization.config;
    if (typeof configData === 'string') {
      try {
        if (configData.startsWith('[') && configData.endsWith(']')) {
          const parsedArray = JSON.parse(configData);
          if (Array.isArray(parsedArray) && parsedArray.length > 0 && typeof parsedArray[0] === 'string') {
            configData = JSON.parse(parsedArray[0]);
          } else if (Array.isArray(parsedArray)) {
            console.warn("Received config as array, but format unexpected. Falling back.", parsedArray);
            configData = {};
          } else {
            configData = JSON.parse(configData);
          }
        } else {
          configData = JSON.parse(configData);
        }
      } catch (e) {
        console.error("Failed to parse visualization config:", e, apiVisualization.config);
        configData = {};
      }
    } else if (Array.isArray(configData)) {
      if (configData.length > 0 && typeof configData[0] === 'string') {
        try {
          configData = JSON.parse(configData[0]);
        } catch (e) {
          console.error("Failed to parse JSON string inside config array:", e, configData[0]);
          configData = {};
        }
      } else {
        console.warn("Received config as array, but format unexpected or empty. Falling back.", configData);
        configData = {};
      }
    } else if (typeof configData !== 'object' || configData === null) {
      console.warn("Unexpected config type received from API. Falling back.", configData);
      configData = {};
    }

    return {
      id: apiVisualization.id_visualization.toString(),
      id_datasource: apiVisualization.id_datasource,
      id_canvas: apiVisualization.id_canvas,
      query: apiVisualization.query,
      type: apiVisualization.visualization_type,
      title: apiVisualization.name || "Visualisasi Data",
      config: configData || {},
      x: apiVisualization.position_x || 0,
      y: apiVisualization.position_y || 0,
      width: apiVisualization.width || 800,
      height: apiVisualization.height || 400,
      requestPayload: {
        id_datasource: apiVisualization.id_datasource,
        query: apiVisualization.query,
        visualizationType: apiVisualization.visualization_type,
        name: apiVisualization.name || "Visualisasi Data"
      }
    };
  }, []);

  // Load initial visualizations
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn("Loading visualizations timed out.");
        setIsLoading(false);
        setVisualizations([]);
      }
    }, 10000);

    setIsLoading(true);
    fetchVisualizationsAPI()
      .then(response => {
        if (response.data.status === 'success' && Array.isArray(response.data.data)) {
          const loadedVisualizations = response.data.data
            .filter(viz => !viz.is_deleted)
            .map(mapApiVisualizationToState);
          setVisualizations(loadedVisualizations);
        } else {
          console.warn("API get-visualizations non-success or invalid data format:", response.data.message || response.data);
          setVisualizations([]);
        }
      })
      .catch(error => {
        console.error("Error loading saved visualizations:", error.response ? error.response.data : error.message);
        setVisualizations([]);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setIsLoading(false);
      });
    return () => clearTimeout(timeoutId);
  }, [mapApiVisualizationToState, isLoading]); // isLoading dependency to retry if needed, or remove if only on mount.

  const _saveVisualization = useCallback(async (visualizationToSave) => {
    try {
      const response = await saveVisualizationAPI(visualizationToSave);
      console.log("Visualization saved response:", response.data);
      if (response.data.status !== 'success') {
        // throw new Error(response.data.message || "API save failed");
      }

      let updatedVizData = { ...visualizationToSave };

      if (response.data.data && response.data.data.id_visualization) {
        const dbId = response.data.data.id_visualization.toString();
        updatedVizData.id = dbId; // Always use ID from DB
        if (response.data.data.name) updatedVizData.title = response.data.data.name;
        if (response.data.data.width) updatedVizData.width = response.data.data.width;
        if (response.data.data.height) updatedVizData.height = response.data.data.height;
        if (response.data.data.position_x !== undefined) updatedVizData.x = response.data.data.position_x;
        if (response.data.data.position_y !== undefined) updatedVizData.y = response.data.data.position_y;
        
        // Update requestPayload if it exists
        if(updatedVizData.requestPayload) {
            updatedVizData.requestPayload = {
                ...updatedVizData.requestPayload,
                id_visualization: dbId, // Important for consistency if this id is used
                name: updatedVizData.title
            };
        }
      }
      
      // Update the specific visualization in the state
      setVisualizations(prev => prev.map(v => (v.id === visualizationToSave.id || v.id_visualization === visualizationToSave.id_visualization) ? updatedVizData : v));
      return updatedVizData; // Return the potentially updated visualization
    } catch (error) {
      console.error("Error in _saveVisualization:", error.response ? error.response.data : error.message);
      throw error; // Re-throw to be caught by caller
    }
  }, []);

  const queueSaveVisualization = useCallback((visualization) => {
    if (pendingSaveTimeouts[visualization.id]) {
      clearTimeout(pendingSaveTimeouts[visualization.id]);
    }
    console.log(`Queueing save for visualization ID: ${visualization.id}`);
    const timeoutId = setTimeout(() => {
      console.log(`Executing delayed save for visualization ID: ${visualization.id}`);
      _saveVisualization(visualization)
        .catch(error => {
          console.error(`Failed to save visualization ${visualization.id} after delay:`, error);
        })
        .finally(() => {
          setPendingSaveTimeouts(prev => {
            const newTimeouts = { ...prev };
            delete newTimeouts[visualization.id];
            return newTimeouts;
          });
        });
    }, SAVE_DEBOUNCE_DELAY);
    setPendingSaveTimeouts(prev => ({ ...prev, [visualization.id]: timeoutId }));
  }, [_saveVisualization, pendingSaveTimeouts]);


  const addVisualization = useCallback(async (newVizData) => {
    const tempId = generateUniqueId();
    const newVisualization = {
      id: tempId,
      id_canvas: 1,
      id_datasource: newVizData.id_datasource,
      query: newVizData.query,
      type: newVizData.type,
      title: newVizData.title || `Visualisasi ${newVizData.type}`,
      config: newVizData.config || {},
      x: newVizData.x || 20,
      y: newVizData.y || 20,
      width: newVizData.width || 600,
      height: newVizData.height || 400,
      requestPayload: {
        id_datasource: newVizData.id_datasource,
        query: newVizData.query,
        visualizationType: newVizData.type,
        name: newVizData.title || `Visualisasi ${newVizData.type}`
      }
    };

    setVisualizations(prev => [...prev, newVisualization]);
    console.log("Adding new visualization to state, then saving:", newVisualization);

    try {
      const savedViz = await _saveVisualization(newVisualization);
      // If ID changed from tempId to dbId, update the state
      if (savedViz.id !== tempId) {
          setVisualizations(prev => prev.map(v => v.id === tempId ? savedViz : v));
      }
      return savedViz; // Return the saved viz with DB ID
    } catch (error) {
      console.error("Failed to save newly created visualization:", error);
      // Optional: Remove from state if save failed
      // setVisualizations(prev => prev.filter(v => v.id !== tempId));
      throw error;
    }
  }, [_saveVisualization]);

  const updateVisualizationProps = useCallback((id, newProps) => {
    setVisualizations(prev =>
      prev.map(v => {
        if (v.id === id) {
          const updatedViz = { ...v, ...newProps };
          // If config or title changes, update requestPayload
          if (newProps.config || newProps.title) {
              updatedViz.requestPayload = {
                  ...v.requestPayload,
                  ...(newProps.title && { name: newProps.title }),
                  // Note: visualizationType and query in requestPayload are usually stable
                  // If they can change, they should be part of newProps too
              };
          }
          console.log(`Updating props for ${id}, queuing save.`, updatedViz);
          queueSaveVisualization(updatedViz);
          return updatedViz;
        }
        return v;
      })
    );
  }, [queueSaveVisualization]);

  const removeVisualization = useCallback((idToRemove, selectedVizId, onSelectNull) => {
    console.log(`Attempting to remove visualization ID: ${idToRemove}`);
    const vizToRemove = visualizations.find(v => v.id === idToRemove);
    if (!vizToRemove) {
      console.error(`Visualization with ID ${idToRemove} not found for deletion`);
      return;
    }

    if (selectedVizId && selectedVizId === idToRemove) {
      onSelectNull(); // Deselect if it was selected
    }

    if (pendingSaveTimeouts[idToRemove]) {
      clearTimeout(pendingSaveTimeouts[idToRemove]);
      setPendingSaveTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[idToRemove];
        return newTimeouts;
      });
    }

    setVisualizations(prev => prev.filter(v => v.id !== idToRemove));

    deleteVisualizationAPI(idToRemove)
      .then(response => {
        console.log(`Visualization ID: ${idToRemove} deleted from API:`, response.data);
      })
      .catch(error => {
        console.error(`Error deleting viz ID: ${idToRemove} from API:`, error.response ? error.response.data : error.message);
         if (error.response && error.response.status === 404) {
            console.warn(`Visualization ID ${idToRemove} not found in database. It may be a temporary ID.`);
        }
      });
  }, [pendingSaveTimeouts, visualizations]); // Added visualizations dependency

  return {
    visualizations,
    isLoading,
    addVisualization,
    updateVisualizationProps,
    removeVisualization,
    mapApiVisualizationToState, // Export if needed externally, usually not
  };
};