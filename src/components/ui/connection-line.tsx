import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ConnectionLineProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isCreating?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({
  startX,
  startY,
  endX,
  endY,
  isCreating = false,
  isSelected = false,
  onClick,
}) => {
  // Calculate control points for a curved line
  const midX = (startX + endX) / 2;

  const path = `M${startX},${startY} C${midX},${startY} ${midX},${endY} ${endX},${endY}`;

  return (
    <g
      onClick={onClick}
      className={isCreating ? "cursor-crosshair" : "cursor-pointer"}
    >
      <path
        d={path}
        stroke={
          isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
        }
        strokeWidth={isSelected ? 3 : 2}
        fill="none"
        strokeDasharray={isCreating ? "5,5" : "none"}
        className="transition-colors duration-200"
      />
      {!isCreating && (
        <>
          {/* Invisible wider path for easier clicking */}
          <path d={path} stroke="transparent" strokeWidth={10} fill="none" />
          {/* Arrow head */}
          <polygon
            points="-6,-3 0,0 -6,3"
            fill={
              isSelected
                ? "hsl(var(--primary))"
                : "hsl(var(--muted-foreground))"
            }
            transform={`translate(${endX},${endY}) rotate(${(Math.atan2(endY - startY, endX - startX) * 180) / Math.PI})`}
          />
        </>
      )}
    </g>
  );
};

export default ConnectionLine;
