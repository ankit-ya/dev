import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  CheckCircle2,
  X,
  Camera,
  Shield,
  User,
  Loader2,
  AlertCircle,
  Eye,
  Scan
} from "lucide-react";

const WebcamCapture = ({ onCapture, onClose }) => {
  const webcamRef = useRef(null);
  const [capturing, setCapturing] = useState(false);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturing(true);
    setTimeout(() => {
      onCapture(imageSrc);
      setCapturing(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm sm:max-w-md w-full max-h-[95vh] overflow-y-auto transform animate-in zoom-in-95 duration-300">
        
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 p-4 sm:p-6 pb-6 sm:pb-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-all duration-200 group shadow-lg hover:shadow-xl z-10"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform duration-200" />
          </button>

          {/* Header Content */}
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl mb-3 sm:mb-4 border border-white border-opacity-30">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Verify Your Identity</h2>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
              Please position your face in the center of the camera for secure verification
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-white bg-opacity-10 rounded-full -translate-x-12 sm:-translate-x-16 -translate-y-12 sm:-translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-purple-300 bg-opacity-20 rounded-full translate-x-10 sm:translate-x-12 translate-y-10 sm:translate-y-12"></div>
        </div>

        {/* Camera Section */}
        <div className="p-4 sm:p-6 -mt-3 sm:-mt-4 relative">
          {/* Camera Frame */}
          <div className="relative mx-auto mb-4 sm:mb-6">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-1">
                <div className="w-full h-full rounded-full bg-white p-1">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 relative">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="w-full h-full object-cover"
                      videoConstraints={{
                        width: 480,
                        height: 480,
                        facingMode: "user"
                      }}
                    />
                    
                    {/* Camera Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-white border-opacity-60 rounded-full animate-pulse"></div>
                    </div>

                    {/* Scanning Animation */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-28 h-28 sm:w-36 sm:h-36 border-2 border-emerald-400 border-opacity-50 rounded-full">
                        <div className="w-full h-full relative">
                          <div className="absolute top-0 left-1/2 w-0.5 h-3 sm:h-4 bg-emerald-400 -translate-x-0.5 animate-pulse"></div>
                          <div className="absolute bottom-0 left-1/2 w-0.5 h-3 sm:h-4 bg-emerald-400 -translate-x-0.5 animate-pulse"></div>
                          <div className="absolute left-0 top-1/2 w-3 sm:w-4 h-0.5 bg-emerald-400 -translate-y-0.5 animate-pulse"></div>
                          <div className="absolute right-0 top-1/2 w-3 sm:w-4 h-0.5 bg-emerald-400 -translate-y-0.5 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <div className="flex items-center space-x-2 bg-white rounded-full px-2 sm:px-3 py-1.5 sm:py-2 shadow-lg border border-slate-200">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-slate-700">Camera Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 border border-blue-100">
            <div className="flex items-start space-x-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-blue-800 mb-1">Capture Instructions</h4>
                <ul className="text-xs text-blue-700 space-y-0.5 sm:space-y-1">
                  <li>• Position your face in the center</li>
                  <li>• Look directly at the camera</li>
                  <li>• Ensure good lighting</li>
                  <li>• Remove any face coverings</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            
            <button
              onClick={capture}
              disabled={capturing}
              className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 font-semibold rounded-2xl transition-all duration-200 transform flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base ${
                capturing
                  ? "bg-blue-400 text-white cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {capturing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Capture</span>
                </>
              )}
            </button>
          </div>

          {/* Security Note */}
          <div className="mt-3 sm:mt-4 text-center">
            <p className="text-xs text-slate-500 flex items-center justify-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Your data is encrypted and secure</span>
            </p>
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
      </div>
    </div>
  );
};

export default WebcamCapture;