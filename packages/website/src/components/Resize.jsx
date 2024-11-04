import { useEffect, useRef } from "react";

let dragging = false;
let dragOffset;

export default function Resize({ onResize }) {
  function handleMouseDown(e) {
    e.preventDefault();

    const rect = e.target.getBoundingClientRect();

    dragging = true;
    dragOffset = Math.round(e.clientX - rect.left);
  }

  function handleMouseMove(e) {
    if (dragging) {
      let width = Math.max(0, e.clientX - dragOffset);
      onResize(width);
    }
  }

  function handleMouseUp() {
    dragging = false;
  }

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, []);

  let resizeRef = useRef(null);

  return (
    <div className="resize" ref={resizeRef} onMouseDown={handleMouseDown}>
      <div className="resize-handle">
      </div>
    </div>
  );
}
