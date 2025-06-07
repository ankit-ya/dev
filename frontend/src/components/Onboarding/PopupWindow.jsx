import { useState } from "react";

const PopupWindow = ({ onClose }) => {
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const features = [
    "Payroll", "Time off", "Calendar", "Performance review", "Analytics",
    "Shiftplan", "Attendance", "Workflows", "Tasks", "Recruiting",
  ];

  const handleFeatureClick = (feature) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((item) => item !== feature)
        : [...prev, feature]
    );
  };

  const handleGetStarted = () => {
    if (selectedFeatures.length > 0) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-8 py-10 sm:px-10 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 text-center">
          What would you like to use Shramii for?
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-6 text-center">
          Select the features you want to start exploring first.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => handleFeatureClick(feature)}
              className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm sm:text-base transition 
                ${selectedFeatures.includes(feature)
                  ? "bg-blue-100 border-blue-500 text-blue-700 font-medium"
                  : "bg-white border-gray-300 hover:bg-gray-100"}`}
            >
              {feature}
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleGetStarted}
            disabled={selectedFeatures.length === 0}
            className={`px-6 py-2 text-white font-semibold rounded-md transition 
              ${selectedFeatures.length > 0
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"}`}
          >
            Get Started 👆
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupWindow;
