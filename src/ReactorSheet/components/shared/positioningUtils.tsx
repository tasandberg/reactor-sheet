import { useState, useEffect } from "react";

export const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({
    clientX: 0,
    clientY: 0,
  });

  useEffect(() => {
    const updateMousePosition = (ev) => {
      setMousePosition({ clientX: ev.clientX, clientY: ev.clientY });
    };

    document.addEventListener("mousemove", updateMousePosition);

    return () => {
      document.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  return mousePosition;
};

// Get visible bounds adjusted for scroll position
export const getVisibleBounds = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return {
    el: element,
    left: rect.left + element.scrollLeft,
    top: rect.top + element.scrollTop,
    right: rect.right + element.scrollLeft,
    bottom: rect.bottom + element.scrollTop,
    width: rect.width,
    height: rect.height,
    x: rect.x + element.scrollLeft,
    y: rect.y + element.scrollTop,
  };
};
