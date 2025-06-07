import React from 'react';
import { HiChevronRight, HiHome } from 'react-icons/hi';

const Breadcrumb = ({ items, currentSection }) => {
  const breadcrumbItems = [
    { name: 'Dashboard', section: 'Home', icon: <HiHome className="w-4 h-4" /> },
    ...items
  ];

  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
      {breadcrumbItems.map((item, index) => (
        <div key={item.section} className="flex items-center">
          {index > 0 && (
            <HiChevronRight className="w-4 h-4 text-slate-400 mx-2" />
          )}
          
          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all duration-200 ${
            item.section === currentSection 
              ? 'bg-blue-100 text-blue-700 font-medium' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
          }`}>
            {item.icon && (
              <span className={`${
                item.section === currentSection ? 'text-blue-600' : 'text-slate-500'
              }`}>
                {item.icon}
              </span>
            )}
            <span>{item.name}</span>
          </div>
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb; 