import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  definition: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, definition }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <span className="text-notion-accent border-b border-dashed border-notion-accent/50 cursor-pointer">
        {children}
      </span>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-notion-bg border border-notion-border rounded-lg shadow-xl z-10 text-sm text-notion-text-light font-normal normal-case tracking-normal">
          {definition}
          <div 
            className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-notion-bg"
            style={{
                filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))'
            }}
          ></div>
        </div>
      )}
    </span>
  );
};
