import React from "react";

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${className}`}
      {...props}
    />
  );
}
