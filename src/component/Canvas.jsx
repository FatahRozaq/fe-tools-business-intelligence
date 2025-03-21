import { useState, useRef, useEffect } from "react";

const Canvas = () => {
  const [scale, setScale] = useState(1);
  const zoomSpeed = 0.005;
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleWheel = (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
        let newScale = scale + event.deltaY * -zoomSpeed;
        newScale = Math.min(Math.max(0.5, newScale), 3);
        setScale(newScale);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel);
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [scale]);

  return (
    <main className="canvas-container" ref={containerRef} style={{ overflow: "auto" }}>
      <div
        className="canvas"
        ref={canvasRef}
        style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
      >
        {/* Tempat untuk menampilkan tabel */}
        <div
          id="tableContainer"
          style={{ padding: 20, margin: 10, border: "1px solid #ffffff" }}
        >
          {/* Tabel akan ditampilkan di sini */}
        </div>
      </div>
    </main>
  );
};

export default Canvas;
