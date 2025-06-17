// src/components/Canvas/useInteractSetup.js
import { useEffect, useRef } from 'react';
import interact from 'interactjs';

export const useInteractSetup = (
    vizId,
    initialX,
    initialY,
    initialWidth,
    initialHeight,
    onSelect, // () => onSelect(viz) // Simplified to just call
    onUpdate // (id, { x, y, width, height }) => void
) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Set initial attributes for interact.js and styles
    element.setAttribute('data-x', initialX.toString());
    element.setAttribute('data-y', initialY.toString());
    element.style.width = `${initialWidth}px`;
    element.style.height = `${initialHeight}px`;
    element.style.transform = `translate(${initialX}px, ${initialY}px)`;
    element.style.position = 'absolute';
    element.style.touchAction = 'none';

    const instance = interact(element)
      .draggable({
        inertia: false,
        modifiers: [interact.modifiers.restrictRect({ restriction: 'parent', endOnly: true })],
        listeners: {
          start: (event) => {
            console.log(`Drag start: ${vizId}`);
            onSelect();
            event.target.classList.add('dragging');
            event.target.style.cursor = 'grabbing';
            event.target.style.zIndex = 20;
          },
          move: (event) => {
            const target = event.target;
            let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
          },
          end: (event) => {
            console.log(`Drag end: ${vizId}`);
            event.target.classList.remove('dragging');
            event.target.style.cursor = 'grab';
            // zIndex handled by isSelected prop in VisualizationItem
            const finalX = parseFloat(event.target.getAttribute('data-x'));
            const finalY = parseFloat(event.target.getAttribute('data-y'));
            if (initialX !== finalX || initialY !== finalY) {
                onUpdate(vizId, { x: finalX, y: finalY });
            }
          },
        },
      })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        invert: 'reposition',
        restrictSize: { min: { width: 200, height: 150 } },
        inertia: false,
        listeners: {
          start: (event) => {
            console.log(`Resize start: ${vizId}`);
            onSelect();
            event.target.classList.add('resizing');
            event.target.style.zIndex = 20;
          },
          move: (event) => {
            const target = event.target;
            let x = parseFloat(target.getAttribute('data-x') || '0');
            let y = parseFloat(target.getAttribute('data-y') || '0');
            target.style.width = `${event.rect.width}px`;
            target.style.height = `${event.rect.height}px`;
            x += event.deltaRect.left;
            y += event.deltaRect.top;
            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
          },
          end: (event) => {
            console.log(`Resize end: ${vizId}`);
            event.target.classList.remove('resizing');
             // zIndex handled by isSelected prop in VisualizationItem
            const finalX = parseFloat(event.target.getAttribute('data-x'));
            const finalY = parseFloat(event.target.getAttribute('data-y'));
            const finalWidth = event.rect.width;
            const finalHeight = event.rect.height;
            if (initialX !== finalX || initialY !== finalY || initialWidth !== finalWidth || initialHeight !== finalHeight) {
                onUpdate(vizId, { x: finalX, y: finalY, width: finalWidth, height: finalHeight });
            }
          },
        },
      });

    return () => {
      if (instance) {
        try {
          instance.unset();
        } catch (e) {
          console.warn("Error unsetting interact instance:", e);
        }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vizId, initialX, initialY, initialWidth, initialHeight, onSelect, onUpdate]); 
  // IMPORTANT: Add all props used in useEffect to dependency array.
  // If onSelect/onUpdate are not stable (e.g. defined inline in parent), wrap them in useCallback in parent.

  return elementRef;
};