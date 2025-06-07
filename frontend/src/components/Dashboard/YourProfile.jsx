import React, { useEffect, useState, useRef } from 'react';
import { fetchUserProfile, updateEmployeeProfilePhoto, fetchPendingAffiliationRequests, approveAffiliationRequest } from '../../API/apiService';
import Webcam from 'react-webcam';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';
import { 
  HiUser, 
  HiMail, 
  HiPhone, 
  HiIdentification, 
  HiCamera, 
  HiPhotograph, 
  HiUsers, 
  HiDocumentText,
  HiCheckCircle,
  HiExclamationCircle,
  HiBadgeCheck,
  HiPlus,
  HiX,
  HiAdjustments
} from 'react-icons/hi';
import { 
  MdVerified,
  MdGroup,
  MdWork,
  MdEmail,
  MdPhone,
  MdPerson,
  MdCameraAlt,
  MdSave,
  MdClose,
  MdCrop,
  MdLocationOn,
  MdCalendarToday,
  MdSecurity
} from 'react-icons/md';
import { 
  UserCircle,
  MapPin,
  Clock,
  Shield,
  Users,
  Award,
  Camera,
  Save,
  X,
  Phone,
  Mail
} from 'lucide-react';

const YourProfile = ({ darkMode }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [affiliationRequests, setAffiliationRequests] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const webcamRef = useRef(null);
  const [joinedTeamInfo, setJoinedTeamInfo] = useState(null);

  // Get user data from localStorage
  const getUserData = () => {
    const userData = localStorage.getItem("user");
    const profileData = localStorage.getItem("profileData");
    
    let user = null;
    if (userData) {
      try {
        user = JSON.parse(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    if (profileData) {
      try {
        const profile = JSON.parse(profileData);
        user = { ...user, ...profile };
      } catch (e) {
        console.error('Error parsing profile data:', e);
      }
    }
    
    return user;
  };

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        // First try to get user data from localStorage
        const localUserData = getUserData();
        if (localUserData) {
          setUserData(localUserData);
        }

        // Then fetch fresh data from API if we have token and userId
        if (token && userId) {
          const data = await fetchUserProfile(token);
          if (data) {
            setUserData(data);
            // Update localStorage with fresh data
            localStorage.setItem("profileData", JSON.stringify(data));
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // If API fails, try to use local data as fallback
        const localUserData = getUserData();
        if (localUserData) {
          setUserData(localUserData);
        }
      }
      setLoading(false);
    };

    const loadAffiliationRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const requests = await fetchPendingAffiliationRequests(token);
          if (requests && Array.isArray(requests)) {
            setAffiliationRequests(requests);
          }
        }
      } catch (error) {
        console.error('Error fetching affiliation requests:', error);
        // Don't fail the whole component for this
      }
    };

    loadUserProfile();
    loadAffiliationRequests();
  }, []);

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setIsCameraOpen(false);
      setIsCropOpen(true);
    }
  };

  const handleCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    try {
      const croppedImage = await getCroppedImg(capturedImage, croppedAreaPixels);
      setProfilePhoto(croppedImage);
      setIsCropOpen(false);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  const handleSavePhoto = async () => {
    try {
      if (!profilePhoto) {
        alert('No photo to upload');
        return;
      }
      const blob = await fetch(profilePhoto).then(res => res.blob());
      const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
      await updateEmployeeProfilePhoto(file);
      alert('Profile photo updated successfully!');
      const updatedData = await fetchUserProfile(localStorage.getItem('token'), localStorage.getItem('userId'));
      setUserData(updatedData);
    } catch (error) {
      console.error('Photo upload failed:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        alert(`Failed to update profile photo: ${error.message}`);
      }
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await approveAffiliationRequest(requestId);
      alert('Affiliation request approved successfully!');
      const approvedRequest = affiliationRequests.find(request => request.id === requestId);
      setJoinedTeamInfo({
        teamName: approvedRequest?.teamName,
        position: approvedRequest?.position
      });
      setAffiliationRequests(prev => prev.filter(request => request.id !== requestId));
    } catch (error) {
      console.error('Error approving affiliation request:', error);
      alert('Failed to approve affiliation request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-600 font-medium">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-red-200 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiExclamationCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Profile Not Found</h2>
            <p className="text-slate-600">Failed to load your profile data. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Your Profile
              </h1>
              <p className="text-slate-600 mt-1">Manage your personal information and settings</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                userData.status === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {userData.status || 'Active'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-2xl bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-30 flex items-center justify-center overflow-hidden">
                      {(profilePhoto || userData?.profilePhotoPath) ? (
                        <img 
                          src={profilePhoto || userData.profilePhotoPath} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircle className="w-16 h-16 text-white opacity-70" />
                      )}
                    </div>
                    <button 
                      onClick={() => setIsCameraOpen(true)}
                      className="absolute -bottom-2 -right-2 bg-white text-blue-600 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <h2 className="text-xl font-semibold mt-4 mb-1">
                    {userData.firstName} {userData.lastName || ''}
                  </h2>
                  <p className="text-blue-100">Employee Profile</p>
                  <div className="flex items-center justify-center gap-2 mt-3 text-blue-100">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">ID: {userData.id}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setIsCameraOpen(true)}
                    className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors duration-200"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="text-sm font-medium">Update Photo</span>
                  </button>
                  <button 
                    onClick={handleSavePhoto}
                    disabled={!profilePhoto}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-colors duration-200 ${
                      profilePhoto 
                        ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    <span className="text-sm font-medium">Save Photo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="mt-6 bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-amber-500" />
                Quick Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-3 text-blue-500" />
                  <span className="text-slate-600">{userData.email || 'Not provided'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 mr-3 text-green-500" />
                  <span className="text-slate-600">{userData.phoneNumber || 'Not provided'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-3 text-red-500" />
                  <span className="text-slate-600">{userData.location || 'Not provided'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-3 text-purple-500" />
                  <span className="text-slate-600">Joined: {userData.joinDate || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                <UserCircle className="w-6 h-6 mr-2 text-blue-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-800">{userData.firstName || 'Not provided'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-slate-400" />
                      <span className="text-slate-800">{userData.email || 'Not provided'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-800">{userData.department || 'Not assigned'}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-800">{userData.lastName || 'Not provided'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-slate-400" />
                      <span className="text-slate-800">{userData.phoneNumber || 'Not provided'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Position</label>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-800">{userData.position || 'Not assigned'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Affiliations */}
            {affiliationRequests.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-emerald-600" />
                  Pending Team Invitations
                  <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                    {affiliationRequests.length}
                  </span>
                </h3>
                <div className="space-y-4">
                  {affiliationRequests.map((request) => (
                    <div key={request.id} className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800">{request.teamName}</h4>
                          <p className="text-slate-600 text-sm mt-1">Position: {request.position}</p>
                          <p className="text-slate-500 text-xs mt-1">From: {request.employerName}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-sm font-medium"
                          >
                            Accept
                          </button>
                          <button className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors duration-200 text-sm font-medium">
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Message for Joined Team */}
            {joinedTeamInfo && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <HiCheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800">Successfully Joined Team!</h4>
                    <p className="text-green-700 text-sm mt-1">
                      You've joined <strong>{joinedTeamInfo.teamName}</strong> as {joinedTeamInfo.position}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Take Profile Photo</h3>
              <button 
                onClick={() => setIsCameraOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="100%"
                  height="240"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCapture}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                >
                  Capture Photo
                </button>
                <button
                  onClick={() => setIsCameraOpen(false)}
                  className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {isCropOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Crop Your Photo</h3>
              <button 
                onClick={() => setIsCropOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="relative h-64 rounded-xl overflow-hidden">
                <Cropper
                  image={capturedImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={handleCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCropSave}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                >
                  Save Crop
                </button>
                <button
                  onClick={() => setIsCropOpen(false)}
                  className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YourProfile;