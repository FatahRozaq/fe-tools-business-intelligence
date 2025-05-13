// src/components/Canvas/utils.js
export const generateUniqueId = () => {
  return 'visualization-' + Math.random().toString(36).substr(2, 9);
};