// src/components/Canvas/useZoom.js
import { useState, useEffect, useRef } from 'react';

const ZOOM_SPEED = 0.005;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

export const useZoom = () => {
  const [scale, setScale] = useState(0.75);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleWheel = (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
        setScale(currentScale => {
          let newScale = currentScale - event.deltaY * ZOOM_SPEED;
          return Math.min(Math.max(MIN_SCALE, newScale), MAX_SCALE);
        });
      }
    };

    const currentContainer = containerRef.current;
    if (currentContainer) {
      currentContainer.addEventListener("wheel", handleWheel, { passive: false });
    }
    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener("wheel", handleWheel);
      }
    };
  }, []); // Empty dependency array, zoomSpeed is constant here

  return { scale, containerRef };
};