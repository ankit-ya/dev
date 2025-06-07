import React, { useState, useEffect } from 'react';
import { MdKeyboard, MdClose } from 'react-icons/md';
import { HiQuestionMarkCircle } from 'react-icons/hi';

const KeyboardShortcuts = ({ onSectionChange }) => {
  const [showShortcuts, setShowShortcuts] = useState(false);

  const shortcuts = [
    { key: 'Alt + H', action: 'Home', section: 'Home', description: 'Go to Dashboard' },
    { key: 'Alt + C', action: 'Clock In/Out', section: 'PunchClock', description: 'Open Punch Clock' },
    { key: 'Alt + L', action: 'Leave', section: 'LeaveAndAttendance', description: 'Leave & Attendance' },
    { key: 'Alt + P', action: 'Profile', section: 'Profile', description: 'View Profile' },
    { key: 'Alt + Y', action: 'Payroll', section: 'Payroll', description: 'View Payroll' },
    { key: 'Alt + T', action: 'Tasks', section: 'TaskManager', description: 'Task Manager' },
    { key: 'Alt + R', action: 'Calendar', section: 'Calendar', description: 'Calendar & Schedule' },
    { key: 'Alt + ?', action: 'Help', section: 'help', description: 'Show this help' },
  ];

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey) {
        switch (event.key.toLowerCase()) {
          case 'h':
            event.preventDefault();
            onSectionChange('Home');
            break;
          case 'c':
            event.preventDefault();
            onSectionChange('PunchClock');
            break;
          case 'l':
            event.preventDefault();
            onSectionChange('LeaveAndAttendance');
            break;
          case 'p':
            event.preventDefault();
            onSectionChange('Profile');
            break;
          case 'y':
            event.preventDefault();
            onSectionChange('Payroll');
            break;
          case 't':
            event.preventDefault();
            onSectionChange('TaskManager');
            break;
          case 'r':
            event.preventDefault();
            onSectionChange('Calendar');
            break;
          case '?':
            event.preventDefault();
            setShowShortcuts(true);
            break;
          default:
            break;
        }
      }
      
      // Close shortcuts modal with Escape
      if (event.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSectionChange, showShortcuts]);

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setShowShortcuts(true)}
        className="fixed bottom-6 right-20 z-40 p-2 bg-white border border-slate-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-slate-600 hover:text-blue-600"
        title="Keyboard Shortcuts (Alt + ?)"
      >
        <HiQuestionMarkCircle className="w-4 h-4" />
      </button>

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MdKeyboard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Keyboard Shortcuts</h3>
                    <p className="text-sm text-slate-600">Quick navigation keys</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <MdClose className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Shortcuts List */}
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="space-y-3">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1">
                      <span className="font-medium text-slate-800 text-sm">{shortcut.action}</span>
                      <p className="text-xs text-slate-500 mt-1">{shortcut.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {shortcut.key.split(' + ').map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          {keyIndex > 0 && <span className="text-slate-400 text-xs">+</span>}
                          <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono text-slate-700 shadow-sm">
                            {key}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <p className="text-xs text-slate-500 text-center">
                Press <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">Esc</kbd> to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcuts; 