import React, { useState, useRef, useEffect } from 'react';

const Select = ({ children, className = '', ...props }) => {
  return (
    <div className={`relative ${className}`} {...props}>
      {children}
    </div>
  );
};

const SelectTrigger = React.forwardRef(({ 
  children, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

const SelectContent = React.forwardRef(({ 
  children, 
  className = '', 
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contentRef.current && !contentRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={contentRef}
      className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white text-gray-950 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef(({ 
  children, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});
SelectItem.displayName = 'SelectItem';

const SelectValue = React.forwardRef(({ 
  placeholder = 'Select an option', 
  className = '', 
  ...props 
}, ref) => {
  return (
    <span
      ref={ref}
      className={`text-sm ${className}`}
      {...props}
    >
      {placeholder}
    </span>
  );
});
SelectValue.displayName = 'SelectValue';

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue }; 