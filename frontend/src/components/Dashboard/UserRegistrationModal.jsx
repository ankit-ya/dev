import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  User,
  Camera,
  X,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  UserCheck,
  Scan
} from 'lucide-react';
import WebcamCapture from './WebcamCapture';

const UserRegistrationModal = ({ open, onClose, onSave }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCapture = (img) => {
    setImageSrc(img);
    setShowWebcam(false);
    setError(''); // Clear any previous errors
  };

  useEffect(() => {
    if (open) {
      const userId = localStorage.getItem('userId');
      if (userId) {
        setEmployeeId(userId);
      }
      // Reset state when modal opens
      setError('');
      setImageSrc(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    console.log('[DEBUG] Starting modal submission:', {
      employeeId,
      hasImage: !!imageSrc,
      loading
    });

    if (!employeeId.trim()) {
      console.error('[DEBUG] Missing employee ID');
      setError('Employee ID is required');
      return;
    }
    if (!imageSrc) {
      console.error('[DEBUG] Missing image');
      setError('Please capture your photo first');
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log('[DEBUG] Calling onSave with:', {
        employeeId,
        hasImage: !!imageSrc
      });
      await onSave({ employeeId, imageSrc });
      console.log('[DEBUG] onSave completed successfully');
      onClose();
    } catch (error) {
      console.error('[DEBUG] Error in modal submission:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  if (showWebcam) {
    return <WebcamCapture onCapture={handleCapture} onClose={() => setShowWebcam(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full max-h-[90vh] overflow-hidden transform animate-in zoom-in-95 duration-300">
        
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 p-3 pb-4">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full transition-all duration-200 group shadow-lg hover:shadow-xl z-10"
          >
            <X className="w-3 h-3 text-white group-hover:scale-110 transition-transform duration-200" />
          </button>

          {/* Header Content */}
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg mb-2 border border-white border-opacity-30">
              <UserCheck className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold mb-0.5">Face Registration</h2>
            <p className="text-blue-100 text-xs max-w-xs mx-auto">
              One-time setup for security
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-16 h-16 bg-white bg-opacity-10 rounded-full -translate-x-8 -translate-y-8"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 bg-purple-300 bg-opacity-20 rounded-full translate-x-6 translate-y-6"></div>
        </div>

        {/* Content Section */}
        <div className="p-3 -mt-2 relative">
          {/* Employee ID Section */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
              <User className="w-3 h-3 mr-1 text-blue-600" />
              Employee ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={!!employeeId}
                className={`w-full px-2.5 py-2 border-2 rounded-lg font-medium transition-all duration-200 text-xs ${
                  !!employeeId
                    ? 'bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed'
                    : error && !employeeId.trim()
                    ? 'border-red-300 focus:border-red-500 bg-red-50'
                    : 'border-slate-200 focus:border-blue-500 bg-white hover:border-slate-300'
                } focus:outline-none focus:ring-1 focus:ring-blue-100 placeholder-slate-400`}
                placeholder="Enter employee ID"
              />
              {employeeId && (
                <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-green-500" />
              )}
            </div>
            {error && !employeeId.trim() && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="w-2.5 h-2.5 mr-0.5" />
                {error}
              </p>
            )}
          </div>

          {/* Photo Capture Section */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
              <Camera className="w-3 h-3 mr-1 text-blue-600" />
              Profile Photo
            </label>
            
            <div className="flex flex-col items-center">
              {/* Photo Preview */}
              <div className="relative mb-2">
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-r from-blue-500 to-purple-600">
                  <div className="w-full h-full rounded-full bg-white p-0.5">
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center relative">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-slate-400">
                          <Camera className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {imageSrc && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                    <CheckCircle className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>

              {/* Capture Button */}
              <button
                onClick={() => setShowWebcam(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center space-x-1 text-xs"
              >
                <Camera className="w-3 h-3" />
                <span>{imageSrc ? 'Retake' : 'Take Photo'}</span>
              </button>

              {error && !imageSrc && error.includes('photo') && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center">
                  <AlertCircle className="w-2.5 h-2.5 mr-0.5" />
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-2.5 mb-3 border border-blue-100">
            <div className="flex items-start space-x-1.5">
              <div className="p-1 bg-blue-100 rounded-md flex-shrink-0">
                <Shield className="w-2.5 h-2.5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-blue-800 mb-0.5">Quick Setup</h4>
                <ul className="text-xs text-blue-700 space-y-0 leading-tight">
                  <li>• Verify ID & Take photo</li>
                  <li>• Secure authentication</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && error !== 'Employee ID is required' && !error.includes('photo') && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2">
              <div className="flex items-center space-x-1.5">
                <AlertCircle className="w-3 h-3 text-red-600 flex-shrink-0" />
                <p className="text-xs text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 px-2.5 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 text-slate-700 font-semibold rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-1 text-xs"
            >
              <X className="w-3 h-3" />
              <span>Cancel</span>
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!employeeId || !imageSrc || loading}
              className={`flex-1 py-2 px-2.5 font-semibold rounded-lg transition-all duration-200 transform flex items-center justify-center space-x-1 text-xs ${
                loading
                  ? "bg-blue-400 text-white cursor-not-allowed"
                  : !employeeId || !imageSrc
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Scan className="w-3 h-3" />
                  <span>Register</span>
                </>
              )}
            </button>
          </div>

          {/* Security Note */}
          <div className="mt-2 text-center">
            <p className="text-xs text-slate-500 flex items-center justify-center space-x-0.5">
              <Shield className="w-2 h-2" />
              <span>Secure & encrypted</span>
            </p>
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
      </div>
    </div>
  );
};

UserRegistrationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default UserRegistrationModal;