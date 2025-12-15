import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { BrushColor } from '../types';

interface CanvasBoardProps {
  color: BrushColor;
  brushSize: number;
}

export interface CanvasRef {
  getImageData: () => string;
  clearCanvas: () => void;
}

const CanvasBoard = forwardRef<CanvasRef, CanvasBoardProps>(({ color, brushSize }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // We set the internal resolution high for sharp lines on high-DPI screens
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set actual bitmap size
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // NOTE: We do NOT use ctx.scale here anymore.
      // Instead we scale coordinates dynamically in the draw function.
      // This prevents the "drawing far from cursor" bug if the CSS size changes.
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize * dpr; // Scale brush size to match resolution
      
      // Initialize white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      contextRef.current = ctx;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update brush properties
  useEffect(() => {
    if (contextRef.current) {
      const dpr = window.devicePixelRatio || 1;
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = brushSize * dpr;
    }
  }, [color, brushSize]);

  useImperativeHandle(ref, () => ({
    getImageData: () => {
      const canvas = canvasRef.current;
      if (!canvas) return "";
      return canvas.toDataURL("image/png").split(',')[1];
    },
    clearCanvas: () => {
      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      if (canvas && ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }));

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch
    const { x, y } = getCoordinates(e);
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    contextRef.current?.lineTo(x, y);
    contextRef.current?.stroke();
  };

  const stopDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    // This is the critical fix for the offset issue.
    // We map the CSS coordinates (rect) to the internal Bitmap coordinates (width/height).
    // This works perfectly even if the canvas is resized via CSS flex/grid.
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  return (
    <div className="relative w-full aspect-square bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden cursor-crosshair group touch-none">
       <canvas
        ref={canvasRef}
        className="w-full h-full block"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </div>
  );
});

CanvasBoard.displayName = 'CanvasBoard';
export default CanvasBoard;