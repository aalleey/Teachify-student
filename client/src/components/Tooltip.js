import React, { useState, useRef, useEffect } from 'react';

const Tooltip = ({ children, text, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const childRect = children.props.ref?.current?.getBoundingClientRect();
      
      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = rect.top - tooltipRef.current.offsetHeight - 8;
          left = rect.left + rect.width / 2 - tooltipRef.current.offsetWidth / 2;
          break;
        case 'bottom':
          top = rect.bottom + 8;
          left = rect.left + rect.width / 2 - tooltipRef.current.offsetWidth / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipRef.current.offsetHeight / 2;
          left = rect.left - tooltipRef.current.offsetWidth - 8;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipRef.current.offsetHeight / 2;
          left = rect.right + 8;
          break;
        default:
          top = rect.top - tooltipRef.current.offsetHeight - 8;
          left = rect.left + rect.width / 2 - tooltipRef.current.offsetWidth / 2;
      }

      setTooltipPosition({ top, left });
    }
  }, [isVisible, position]);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && text && (
        <div
          ref={tooltipRef}
          className={`
            absolute z-50 px-2 py-1 text-xs font-medium text-white 
            bg-gray-900 dark:bg-gray-800 rounded-lg shadow-lg
            pointer-events-none whitespace-nowrap
            animate-in fade-in duration-200
          `}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: position === 'top' ? 'translateY(-4px)' : 'none'
          }}
        >
          {text}
          <div className={`
            absolute w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45
            ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
            ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
            ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
            ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
          `} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;

