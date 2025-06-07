import React, { useState, useEffect,useCallback } from "react";
import { 
  sendCheckInData, 
  sendCheckOutData,
  getRecentAttendance,
  getHistoricalAttendance,
  registerNewUser,
  recognizeUser,
  fetchUserProfile,
  updateEmployee
} from "../../API/apiService";
import Swal from "sweetalert2";
import { CheckCircleOutline, ExitToApp, Download, History, Camera } from "@mui/icons-material";
import { MapPin, Pause, CheckCircle, Clock, User, MapPinIcon, TrendingUp, Calendar } from "lucide-react";
import WebcamCapture from "./WebcamCapture";
import UserRegistrationModal from "./UserRegistrationModal";

const PunchClock = () => {
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [location, setLocation] = useState(null);
  const [history, setHistory] = useState([]);
  const [showWebcam, setShowWebcam] = useState(false);
  const [isCheckIn, setIsCheckIn] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [timer, setTimer] = useState(0);
  const [geoError, setGeoError] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState('checking'); // 'checking', 'required', 'completed'
  const [userRegistered, setUserRegistered] = useState(false);

  // Reset all check-in related states
  const resetCheckInState = () => {
    setIsCheckedIn(false);
    setCheckInTime(null);
    setCheckOutTime(null);
    setLocation(null);
    setCurrentSessionId(null);
    setTimer(0);
  };

  // Check user registration status
  const checkUserRegistration = async () => {
    try {
      const token = localStorage.getItem("token");
  
      if (!token) {
        setRegistrationStatus('required');
        setUserRegistered(false);
        setShowRegistrationModal(true);
        return;
      }

      const userData = await fetchUserProfile(token);
      console.log('User data from API:', userData);

      // Check if user exists and if face registration is required
      if (!userData || userData.faceRegister === false) {
        console.log('Face registration required or user not found');
        setRegistrationStatus('required');
        setUserRegistered(false);
        setShowRegistrationModal(true);
        return;
      }

      // User exists and face is registered, no need to show registration modal
      console.log('User exists and face is registered');
      setRegistrationStatus('completed');
      setUserRegistered(true);
      setShowRegistrationModal(false);
    } catch (error) {
      console.error("Error checking user registration:", error);
      setRegistrationStatus('required');
      setUserRegistered(false);
      setShowRegistrationModal(true);
    }
  };

  useEffect(() => {
    checkUserRegistration();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isCheckedIn) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn]);

  // Format time for display
  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}h:${m.toString().padStart(2, "0")}m:${s.toString().padStart(2, "0")}s`;
  };

  // Geolocation effect
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        console.error("Geolocation error", err);
        setGeoError("Unable to retrieve your location.");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const fetchAttendanceData = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setLoading(false);
        setError("User ID not found. Please log in.");
        setShowRegistrationModal(true);
        return;
      }

      setLoading(true);
      setError(null);

      const [recentData, historicalData] = await Promise.all([
        getRecentAttendance(userId),
        getHistoricalAttendance(userId)
      ]);

      // Process recent attendance
      if (recentData.resCode === 200 && recentData.res) {
        const recentEntry = recentData.res;
        const hasActiveSession = recentEntry.checkInTime && !recentEntry.checkOutTime;
        
        setIsCheckedIn(hasActiveSession);
        setCheckInTime(recentEntry.checkInTime || null);
        setCheckOutTime(recentEntry.checkOutTime || null);
        setLocation(recentEntry.location || null);
        
        if (hasActiveSession && recentEntry._id) {
          setCurrentSessionId(recentEntry._id);
        }

        if (recentData.resCode === 200 && recentData.res) {
          const recentEntry = recentData.res;
          const hasActiveSession = recentEntry.checkInTime && !recentEntry.checkOutTime;
        
          setIsCheckedIn(hasActiveSession);
          setCheckInTime(recentEntry.checkInTime || null);
          setCheckOutTime(recentEntry.checkOutTime || null);
          setLocation(recentEntry.location || null);
        
          if (hasActiveSession && recentEntry._id) {
            setCurrentSessionId(recentEntry._id);
          }
        
          // ✅ Add this logic to restore timer from actual check-in time
          if (hasActiveSession && recentEntry.dateOfInsertion) {
            const checkInDateTime = new Date(recentEntry.dateOfInsertion);
            const now = new Date();
            const elapsedSeconds = Math.floor((now - checkInDateTime) / 1000);
            setTimer(elapsedSeconds);
          }
        }
        
      }

      // Process historical attendance
      if (historicalData.resCode === 200) {
        if (historicalData.isEmptyHistory) {
          setShowRegistrationModal(true);
          setHistory([]);
        } else if (historicalData.res) {
          const processedRecords = processAttendanceRecords(
            Array.isArray(historicalData.res) ? historicalData.res : [historicalData.res].filter(Boolean)
          );
          
          const sortedHistory = processedRecords.sort((a, b) => {
            const dateA = new Date(a.checkInDate || a.dateOfInsertion || a.date);
            const dateB = new Date(b.checkInDate || b.dateOfInsertion || b.date);
            return dateB - dateA;
          });
          
          setHistory(sortedHistory);
        }
      }
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setError(err.message || "Failed to load attendance data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);


  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'N/A';
    }
  };

  const processAttendanceRecords = (records) => {
    const processedRecords = [];
    const checkIns = [];
    const checkOuts = [];

    records.forEach(record => {
      if (record.checkInTime && !record.checkOutTime) {
        checkIns.push(record);
      } else if (record.checkOutTime) {
        checkOuts.push(record);
      }
    });

    checkIns.sort((a, b) => new Date(a.dateOfInsertion) - new Date(b.dateOfInsertion));
    checkOuts.sort((a, b) => new Date(a.dateOfInsertion) - new Date(b.dateOfInsertion));

    let checkInIndex = 0;
    let checkOutIndex = 0;

    while (checkInIndex < checkIns.length && checkOutIndex < checkOuts.length) {
      const checkIn = checkIns[checkInIndex];
      const checkOut = checkOuts[checkOutIndex];

      if (new Date(checkOut.dateOfInsertion) > new Date(checkIn.dateOfInsertion)) {
        processedRecords.push({
          ...checkIn,
          checkOutTime: checkOut.checkOutTime,
          locationOut: checkOut.locationOut,
          totalHours: calculateTotalHours(checkIn.checkInTime, checkOut.checkOutTime),
          checkInDate: checkIn.dateOfInsertion,
          checkOutDate: checkOut.dateOfInsertion,
          date: formatDisplayDate(checkIn.dateOfInsertion) 
        });
        checkInIndex++;
        checkOutIndex++;
      } else {
        checkOutIndex++;
      }
    }

    while (checkInIndex < checkIns.length) {
      const checkIn = checkIns[checkInIndex];
      processedRecords.push({
        ...checkIn,
        checkOutTime: null,
        locationOut: null,
        totalHours: null,
        checkInDate: checkIn.dateOfInsertion
      });
      checkInIndex++;
    }

    return processedRecords;
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString(),
      day: now.toLocaleDateString("en-US", { weekday: "long" }),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isoDate: now.toISOString()
    };
  };

  const getUserLocation = (callback) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          callback({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location", error);
          Swal.fire({
            icon: "error",
            title: "📍 Location Error",
            html: `
              <div class="flex flex-col items-center space-y-4 p-4">
                <div class="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                
                <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 w-full border border-amber-100">
                  <div class="text-center space-y-2">
                    <p class="text-amber-800 font-semibold text-sm">Unable to retrieve your location</p>
                    <p class="text-amber-700 text-xs leading-relaxed">Please ensure location services are enabled for this website</p>
                  </div>
                </div>
                
                <div class="bg-blue-50 rounded-xl p-3 w-full border border-blue-200">
                  <h4 class="text-blue-800 font-semibold text-xs mb-2">🔧 How to enable location:</h4>
                  <ul class="text-blue-700 text-xs space-y-1">
                    <li>• Click the location icon in your browser's address bar</li>
                    <li>• Select "Allow" for location permissions</li>
                    <li>• Refresh the page and try again</li>
                  </ul>
                </div>
              </div>
            `,
            confirmButtonText: "I'll Enable It",
            customClass: {
              popup: '!max-w-sm !p-6 !rounded-3xl !shadow-2xl !border-0',
              title: '!text-xl !mb-4 !font-bold !bg-gradient-to-r !from-amber-600 !to-orange-600 !bg-clip-text !text-transparent',
              confirmButton: '!px-6 !py-3 !text-sm !bg-gradient-to-r !from-amber-600 !to-orange-600 !text-white !rounded-2xl !font-semibold !shadow-lg hover:!shadow-xl !transform hover:!scale-105 !transition-all !duration-200',
              htmlContainer: '!m-0 !p-0'
            },
            buttonsStyling: false,
            backdrop: `rgba(0,0,0,0.4)`,
            allowOutsideClick: false,
            showClass: {
              popup: 'animate__animated animate__shakeX animate__faster'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutDown animate__faster'
            }
          });
          callback(null);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      Swal.fire({
        icon: "error",
        title: "⚠️ Unsupported Feature",
        html: `
          <div class="flex flex-col items-center space-y-4 p-4">
            <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
            </div>
            
            <div class="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-4 w-full border border-red-100">
              <div class="text-center space-y-2">
                <p class="text-red-800 font-semibold text-sm">Geolocation not supported</p>
                <p class="text-red-700 text-xs leading-relaxed">Your browser doesn't support location services</p>
              </div>
            </div>
            
            <div class="bg-blue-50 rounded-xl p-3 w-full border border-blue-200">
              <h4 class="text-blue-800 font-semibold text-xs mb-2">💡 Suggested solutions:</h4>
              <ul class="text-blue-700 text-xs space-y-1">
                <li>• Update to a newer browser version</li>
                <li>• Use Chrome, Firefox, or Safari</li>
                <li>• Contact IT support for assistance</li>
              </ul>
            </div>
          </div>
        `,
        confirmButtonText: "Understood",
        customClass: {
          popup: '!max-w-sm !p-6 !rounded-3xl !shadow-2xl !border-0',
          title: '!text-xl !mb-4 !font-bold !bg-gradient-to-r !from-red-600 !to-pink-600 !bg-clip-text !text-transparent',
          confirmButton: '!px-6 !py-3 !text-sm !bg-gradient-to-r !from-red-600 !to-pink-600 !text-white !rounded-2xl !font-semibold !shadow-lg hover:!shadow-xl !transform hover:!scale-105 !transition-all !duration-200',
          htmlContainer: '!m-0 !p-0'
        },
        buttonsStyling: false,
        backdrop: `rgba(0,0,0,0.4)`,
        allowOutsideClick: false,
        showClass: {
          popup: 'animate__animated animate__shakeX animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutDown animate__faster'
        }
      });
      callback(null);
    }
  };

  const handleCheckIn = () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setShowRegistrationModal(true);
      Swal.fire({
        icon: 'info',
        title: '👤 Registration Required',
        html: `
          <div class="flex flex-col items-center space-y-4 p-4">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
              </svg>
            </div>
            
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 w-full border border-blue-100">
              <div class="text-center space-y-2">
                <p class="text-blue-800 font-semibold text-sm">Face registration needed</p>
                <p class="text-blue-700 text-xs leading-relaxed">Please complete your profile setup to start using the attendance system</p>
              </div>
            </div>
            
            <div class="bg-emerald-50 rounded-xl p-3 w-full border border-emerald-200">
              <h4 class="text-emerald-800 font-semibold text-xs mb-2">✨ What happens next:</h4>
              <ul class="text-emerald-700 text-xs space-y-1">
                <li>• Take a photo for face recognition</li>
                <li>• Complete your employee profile</li>
                <li>• Start checking in securely</li>
              </ul>
            </div>
          </div>
        `,
        confirmButtonText: "Register Now",
        customClass: {
          popup: '!max-w-sm !p-6 !rounded-3xl !shadow-2xl !border-0',
          title: '!text-xl !mb-4 !font-bold !bg-gradient-to-r !from-blue-600 !to-indigo-600 !bg-clip-text !text-transparent',
          confirmButton: '!px-6 !py-3 !text-sm !bg-gradient-to-r !from-blue-600 !to-indigo-600 !text-white !rounded-2xl !font-semibold !shadow-lg hover:!shadow-xl !transform hover:!scale-105 !transition-all !duration-200',
          htmlContainer: '!m-0 !p-0'
        },
        buttonsStyling: false,
        backdrop: `rgba(0,0,0,0.4)`,
        allowOutsideClick: false,
        showClass: {
          popup: 'animate__animated animate__fadeInUp animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutDown animate__faster'
        }
      });
      return;
    }
    setIsCheckIn(true);
    setShowWebcam(true);
  };

  
  const handleCheckOut = () => {
    setIsCheckIn(false);
    setShowWebcam(true);
  };

  const handleCapture = async (imageSrc) => {
    setShowWebcam(false);
    
    const swalInstance = Swal.fire({
      title: '🔐 Verifying Identity',
      html: `
        <div class="flex flex-col items-center space-y-4 p-4">
          <div class="relative">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full opacity-30 animate-ping"></div>
          </div>
          
          <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 w-full border border-blue-100">
            <div class="text-center space-y-2">
              <p class="text-blue-800 font-semibold text-sm">Analyzing facial features...</p>
              <div class="flex items-center justify-center space-x-1">
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
              <p class="text-blue-700 text-xs">This may take a few seconds</p>
            </div>
          </div>
          
          <div class="text-center">
            <p class="text-slate-600 text-xs">Please wait while we verify your identity</p>
          </div>
        </div>
      `,
      allowOutsideClick: false,
      showConfirmButton: false,
      customClass: {
        popup: '!max-w-sm !p-6 !rounded-3xl !shadow-2xl !border-0',
        title: '!text-xl !mb-4 !font-bold !bg-gradient-to-r !from-blue-600 !to-purple-600 !bg-clip-text !text-transparent',
        htmlContainer: '!m-0 !p-0'
      },
      backdrop: `rgba(0,0,0,0.4)`,
      showClass: {
        popup: 'animate__animated animate__fadeInUp animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutDown animate__faster'
      }
    });

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Convert imageSrc to Blob for the API
      const response = await fetch(imageSrc);
      const imageBlob = await response.blob();

      // Call face recognition API
      const recognitionResult = await recognizeUser(userId, imageBlob);
      
      if (recognitionResult.result !== 'Matched') {
        throw new Error(recognitionResult.message || 'Face recognition failed');
      }

      await swalInstance.close();
      
      // Continue with the check-in/check-out process
      getUserLocation(async (loc) => {
        const { date, day, time, isoDate } = getCurrentDateTime();
        
      
      
        const profileData = localStorage.getItem("profileData");
const user = profileData ? JSON.parse(profileData) : null;

const employeeId = user?.id || "Unknown";
const userName = user?.firstName || "Unknown";

    
     
        
        

        try {
          if (isCheckIn) {
            const newEntry = {
              id: employeeId,
              userName,
              date,
              day,
              checkInTime: time,
              checkOutTime: null,
              location: loc,
              locationOut: null,
              totalHours: null,
              dateOfInsertion: isoDate
            };

            const response = await sendCheckInData(newEntry);
            
            if (response.res && response.res._id) {
              setCurrentSessionId(response.res._id);
            }

            const [recentResponse, historicalResponse] = await Promise.all([
              getRecentAttendance(employeeId),
              getHistoricalAttendance(employeeId)
            ]);

            if (recentResponse.resCode === 200 && recentResponse.res) {
              setIsCheckedIn(true);
              setCheckInTime(time);
              setLocation(loc);
            }

            if (historicalResponse.resCode === 200 && historicalResponse.res) {
              const processedRecords = processAttendanceRecords(
                Array.isArray(historicalResponse.res) ? historicalResponse.res : [historicalResponse.res]
              );
              setHistory(processedRecords);
            }
            Swal.fire({
              icon: "success",
              title: "✅ Check-In Successful!",
              html: `
                <div class="flex flex-col items-center space-y-4 p-4">
                  <div class="relative">
                    <div class="w-20 h-20 rounded-full p-1 bg-gradient-to-r from-emerald-500 to-blue-600">
                      <img src="${imageSrc}" alt="Captured Photo" class="w-full h-full rounded-full object-cover shadow-lg" />
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                      <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  
                  <div class="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-4 w-full border border-emerald-100">
                    <div class="grid grid-cols-1 gap-3 text-sm">
                      <div class="flex items-center justify-between">
                        <span class="text-slate-600 font-medium flex items-center">
                          <svg class="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                          </svg>
                          Employee
                        </span>
                        <span class="font-bold text-slate-800">${userName}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-slate-600 font-medium flex items-center">
                          <svg class="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                          </svg>
                          ID
                        </span>
                        <span class="font-bold text-slate-800">${employeeId}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-slate-600 font-medium flex items-center">
                          <svg class="w-4 h-4 mr-2 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                          </svg>
                          Check-In Time
                        </span>
                        <span class="font-bold text-emerald-700">${time}</span>
                      </div>
                      <div class="flex items-center justify-between pt-2 border-t border-emerald-200">
                        <span class="text-slate-600 font-medium flex items-center text-xs">
                          <svg class="w-3 h-3 mr-1 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                          </svg>
                          Location
                        </span>
                        <span class="font-medium text-slate-700 text-xs">${loc ? `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="text-center">
                    <p class="text-emerald-700 font-semibold text-sm">Have a productive day! 🎯</p>
                    <p class="text-slate-500 text-xs mt-1">Your attendance has been recorded</p>
                  </div>
                </div>
              `,
              confirmButtonText: "Continue",
              customClass: {
                popup: '!max-w-sm !p-6 !rounded-3xl !shadow-2xl !border-0',
                title: '!text-xl !mb-4 !font-bold !bg-gradient-to-r !from-emerald-600 !to-blue-600 !bg-clip-text !text-transparent',
                confirmButton: '!px-6 !py-3 !text-sm !bg-gradient-to-r !from-emerald-600 !to-blue-600 !text-white !rounded-2xl !font-semibold !shadow-lg hover:!shadow-xl !transform hover:!scale-105 !transition-all !duration-200',
                htmlContainer: '!m-0 !p-0'
              },
              buttonsStyling: false,
              backdrop: `rgba(0,0,0,0.4)`,
              allowOutsideClick: false,
              showClass: {
                popup: 'animate__animated animate__fadeInUp animate__faster'
              },
              hideClass: {
                popup: 'animate__animated animate__fadeOutDown animate__faster'
              }
            });
          } else {
            const totalTime = calculateTotalHours(checkInTime, time);
            const checkOutData = {
              sessionId: currentSessionId,
              id: employeeId,
              date,
              checkOutTime: time,
              locationOut: loc,
              totalHours: totalTime,
              dateOfInsertion: isoDate
            };

            await sendCheckOutData(checkOutData);
            
            resetCheckInState();
            
            const [recentResponse, historicalResponse] = await Promise.all([
              getRecentAttendance(employeeId),
              getHistoricalAttendance(employeeId)
            ]);

            if (historicalResponse.resCode === 200 && historicalResponse.res) {
              const processedRecords = processAttendanceRecords(
                Array.isArray(historicalResponse.res) ? historicalResponse.res : [historicalResponse.res]
              );
              setHistory(processedRecords);
            }

            Swal.fire({
              icon: "success",
              title: "✅ Check-Out Successful!",
              html: `
                <div class="flex flex-col items-center space-y-4 p-4">
                  <div class="relative">
                    <div class="w-20 h-20 rounded-full p-1 bg-gradient-to-r from-purple-500 to-blue-600">
                      <img src="${imageSrc}" alt="Captured Photo" class="w-full h-full rounded-full object-cover shadow-lg" />
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center border-2 border-white">
                      <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  
                  <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 w-full border border-purple-100">
                    <div class="grid grid-cols-1 gap-3 text-sm">
                      <div class="flex items-center justify-between">
                        <span class="text-slate-600 font-medium flex items-center">
                          <svg class="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                          </svg>
                          Employee
                        </span>
                        <span class="font-bold text-slate-800">${userName}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-slate-600 font-medium flex items-center">
                          <svg class="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                          </svg>
                          ID
                        </span>
                        <span class="font-bold text-slate-800">${employeeId}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-slate-600 font-medium flex items-center">
                          <svg class="w-4 h-4 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                          </svg>
                          Check-Out Time
                        </span>
                        <span class="font-bold text-purple-700">${time}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-slate-600 font-medium flex items-center">
                          <svg class="w-4 h-4 mr-2 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Total Duration
                        </span>
                        <span class="font-bold text-amber-700">${totalTime}</span>
                      </div>
                      <div class="flex items-center justify-between pt-2 border-t border-purple-200">
                        <span class="text-slate-600 font-medium flex items-center text-xs">
                          <svg class="w-3 h-3 mr-1 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                          </svg>
                          Location
                        </span>
                        <span class="font-medium text-slate-700 text-xs">${loc ? `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="text-center">
                    <p class="text-purple-700 font-semibold text-sm">Great work today! 🌟</p>
                    <p class="text-slate-500 text-xs mt-1">Your shift has been completed</p>
                  </div>
                </div>
              `,
              confirmButtonText: "Finish",
              customClass: {
                popup: '!max-w-sm !p-6 !rounded-3xl !shadow-2xl !border-0',
                title: '!text-xl !mb-4 !font-bold !bg-gradient-to-r !from-purple-600 !to-blue-600 !bg-clip-text !text-transparent',
                confirmButton: '!px-6 !py-3 !text-sm !bg-gradient-to-r !from-purple-600 !to-blue-600 !text-white !rounded-2xl !font-semibold !shadow-lg hover:!shadow-xl !transform hover:!scale-105 !transition-all !duration-200',
                htmlContainer: '!m-0 !p-0'
              },
              buttonsStyling: false,
              backdrop: `rgba(0,0,0,0.4)`,
              allowOutsideClick: false,
              showClass: {
                popup: 'animate__animated animate__fadeInUp animate__faster'
              },
              hideClass: {
                popup: 'animate__animated animate__fadeOutDown animate__faster'
              }
            });
          }
        } catch (error) {
          console.error("Error processing attendance:", error);
          Swal.fire({
            icon: "error",
            title: "❌ Processing Error",
            html: `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 16px;">
                <div style="width: 64px; height: 64px; background: linear-gradient(to right, #ef4444, #ec4899); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <svg style="width: 32px; height: 32px; color: white;" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                
                <div style="background: linear-gradient(to right, #fef2f2, #fdf2f8); border-radius: 16px; padding: 16px; width: 100%; border: 1px solid #fecaca; text-align: center;">
                  <p style="color: #991b1b; font-weight: 600; font-size: 14px; margin: 0 0 8px 0;">Failed to process attendance</p>
                  <p style="color: #b91c1c; font-size: 12px; margin: 0;">${error.message || "An unexpected error occurred. Please try again."}</p>
                </div>
                
                <div style="text-align: center;">
                  <p style="color: #64748b; font-size: 12px; margin: 0;">Please ensure you have a stable connection and try again</p>
                </div>
              </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Try Again",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
            backdrop: `rgba(0,0,0,0.4)`,
            allowOutsideClick: true
          }).then((result) => {
            if (result.isConfirmed) {
              // Try again - reopen the webcam for capture
              setTimeout(() => {
                setShowWebcam(true);
              }, 300);
            }
            // Cancel or dismiss - popup automatically closes
          });
        }
      });
    } catch (error) {
      await swalInstance.close();
      console.error("Error during face recognition:", error);
      Swal.fire({
        icon: "error",
        title: "🔐 Verification Failed",
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 16px;">
            <div style="width: 64px; height: 64px; background: linear-gradient(to right, #ef4444, #fb923c); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg style="width: 32px; height: 32px; color: white;" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
            
            <div style="background: linear-gradient(to right, #fef2f2, #fff7ed); border-radius: 16px; padding: 16px; width: 100%; border: 1px solid #fecaca; text-align: center;">
              <p style="color: #991b1b; font-weight: 600; font-size: 14px; margin: 0 0 8px 0;">Face recognition failed</p>
              <p style="color: #b91c1c; font-size: 12px; margin: 0;">${error.message || "Unable to verify your identity. Please try again."}</p>
            </div>
            
            <div style="background: #eff6ff; border-radius: 12px; padding: 12px; width: 100%; border: 1px solid #dbeafe;">
              <h4 style="color: #1e40af; font-weight: 600; font-size: 12px; margin: 0 0 8px 0;">💡 Tips for better recognition:</h4>
              <ul style="color: #1d4ed8; font-size: 12px; margin: 0; padding-left: 16px; line-height: 1.5;">
                <li>Ensure good lighting on your face</li>
                <li>Look directly at the camera</li>
                <li>Remove any face coverings</li>
                <li>Keep your face centered</li>
              </ul>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Try Again",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#64748b",
        backdrop: `rgba(0,0,0,0.4)`,
        allowOutsideClick: true
      }).then((result) => {
        if (result.isConfirmed) {
          // Try again - reopen the webcam
          setTimeout(() => {
            setShowWebcam(true);
          }, 300);
        }
        // Cancel or dismiss - popup automatically closes
      });
    }
  };

  const calculateTotalHours = (checkInTime, checkOutTime) => {
    if (!checkInTime || !checkOutTime) return "N/A";
    
    try {
      const parseTimeWithPeriod = (timeStr) => {
        if (timeStr.includes('am') || timeStr.includes('pm')) {
          const [time, period] = timeStr.split(' ');
          let [hours, minutes, seconds] = time.split(':').map(Number);
          
          if (period === 'pm' && hours !== 12) {
            hours += 12;
          } else if (period === 'am' && hours === 12) {
            hours = 0;
          }
          return { hours, minutes, seconds };
        } else {
          const [hours, minutes, seconds] = timeStr.split(':').map(Number);
          return { hours, minutes, seconds };
        }
      };
  
      const start = parseTimeWithPeriod(checkInTime);
      const end = parseTimeWithPeriod(checkOutTime);
  
      const startDate = new Date();
      startDate.setHours(start.hours, start.minutes, start.seconds);
  
      const endDate = new Date();
      endDate.setHours(end.hours, end.minutes, end.seconds);
  
      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }
  
      const diffMs = endDate - startDate;
      const diffSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(diffSec / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;
  
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } catch (e) {
      console.error("Error calculating total hours:", {
        error: e,
        checkInTime,
        checkOutTime
      });
      return "N/A";
    }
  };

  const formatLocation = (loc) => {
    if (!loc) return "N/A";
    return `${loc.latitude?.toFixed(4) || 'N/A'}, ${loc.longitude?.toFixed(4) || 'N/A'}`;
  };

  const handleDownloadHistory = () => {
    const csvContent = [
      ["Date", "Day", "Check-In Time", "Check-Out Time", "Total Hours", "Location (In)", "Location (Out)"],
      ...history.map(item => [
        item.date || item.checkInDate?.split('T')[0] || 'N/A',
        item.day || 'N/A',
        item.checkInTime || 'N/A',
        item.checkOutTime || 'N/A',
        item.totalHours || 'N/A',
        formatLocation(item.location),
        formatLocation(item.locationOut)
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "attendance_history.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const verifyUserProfileUpdate = async (retries = 3, delay = 1000) => {
    const token = localStorage.getItem("token");
    for (let attempt = 0; attempt < retries; attempt++) {
      const userData = await fetchUserProfile(token);
      console.log(`[DEBUG] Attempt ${attempt + 1} - userData:`, userData);
      
      if (userData && userData.faceRegister === true) {
        return userData;
      }
  
      console.warn(`[Retry ${attempt + 1}] faceRegister not yet true. Retrying in ${delay}ms...`);
      await new Promise((res) => setTimeout(res, delay));
    }
    return null;
  };
  

  const handleUserRegistration = async ({ employeeId, imageSrc }) => {
    console.log('[DEBUG] Starting handleUserRegistration with:', {
      employeeId,
      hasImage: !!imageSrc
    });

    if (!employeeId || !imageSrc) {
      console.error('[DEBUG] Missing required data:', { employeeId, hasImage: !!imageSrc });
      throw new Error("Employee ID and image are required");
    }

    try {
      // Process the image
      let imageBlob;
      if (typeof imageSrc === 'string') {
        console.log('[DEBUG] Processing string image source');
        if (imageSrc.startsWith('data:')) {
          // Convert base64 to blob
          const base64Data = imageSrc.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteArrays = [];
          for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
            const slice = byteCharacters.slice(offset, offset + 1024);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          imageBlob = new Blob(byteArrays, { type: 'image/jpeg' });
        } else {
          // Handle URL
          console.log('[DEBUG] Fetching image from URL');
          const response = await fetch(imageSrc);
          imageBlob = await response.blob();
        }
      } else {
        console.log('[DEBUG] Using provided image blob');
        imageBlob = imageSrc;
      }

      console.log('[DEBUG] Image processed successfully:', {
        blobSize: imageBlob.size,
        blobType: imageBlob.type
      });

      // Register the user
      console.log('[DEBUG] Starting user registration');
      const registrationResponse = await registerNewUser(employeeId, imageBlob);
      console.log('[DEBUG] Registration response:', registrationResponse);

      /* Save user data in localStorage
      const userData = {
        id: employeeId,
        name: registrationResponse.name || 'Unknown',
        faceRegister: true
      };
      localStorage.setItem("userData", JSON.stringify(userData));
      console.log('[DEBUG] User data saved to localStorage:', userData);
*/
      // Update face registration status
     // Update face registration status (fetch full profile, merge, then send)
try {
 
    // Update face registration status
    console.log('[DEBUG] Updating employee face registration status');
    const updateResponse = await updateEmployee(employeeId, { faceRegister: true });
    console.log('[DEBUG] Update response:', updateResponse);

    // Verify the update
    console.log('[DEBUG] Verifying update by fetching user profile');
    const userData = await verifyUserProfileUpdate();
    
    if (!userData) {
      console.error('[DEBUG] Failed to verify user data after registration');
      throw new Error('Failed to verify user data after registration');
    }

        // Check if face registration was successful
        if (userData.faceRegister !== true) {
          console.warn('[DEBUG] Face registration status not updated as expected:', {
            expected: true,
            received: userData.faceRegister
          });
        } else {
          console.log('[DEBUG] Face registration status verified successfully');
        }
      } catch (updateError) {
        console.error('[DEBUG] Failed to update face registration status:', updateError);
        // Show warning but don't block registration
        Swal.fire({
          icon: 'warning',
          title: '⚠️ Registration Complete',
          html: `
            <div class="flex flex-col items-center space-y-4 p-4">
              <div class="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
              </div>
              
              <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 w-full border border-amber-100">
                <div class="text-center space-y-2">
                  <p class="text-amber-800 font-semibold text-sm">Face registered successfully!</p>
                  <p class="text-amber-700 text-xs leading-relaxed">Your face has been registered, but there was an issue updating the status.</p>
                </div>
              </div>
              
              <div class="text-center">
                <p class="text-slate-600 text-xs">You can still proceed with using the attendance system</p>
              </div>
            </div>
          `,
          confirmButtonText: "Continue",
          customClass: {
            popup: '!max-w-sm !p-6 !rounded-3xl !shadow-2xl !border-0',
            title: '!text-xl !mb-4 !font-bold !bg-gradient-to-r !from-amber-600 !to-orange-600 !bg-clip-text !text-transparent',
            confirmButton: '!px-6 !py-3 !text-sm !bg-gradient-to-r !from-amber-600 !to-orange-600 !text-white !rounded-2xl !font-semibold !shadow-lg hover:!shadow-xl !transform hover:!scale-105 !transition-all !duration-200',
            htmlContainer: '!m-0 !p-0'
          },
          buttonsStyling: false,
          backdrop: `rgba(0,0,0,0.4)`,
          allowOutsideClick: false,
          showClass: {
            popup: 'animate__animated animate__fadeInUp animate__faster'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutDown animate__faster'
          }
        });
      }

      // Show success message
      Swal.fire({
        icon: 'success',
        title: '🎉 Registration Successful',
        html: `
          <div class="flex flex-col items-center space-y-4 p-4">
            <div class="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
            
            <div class="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-4 w-full border border-emerald-100">
              <div class="text-center space-y-2">
                <p class="text-emerald-800 font-semibold text-sm">Face registered successfully!</p>
                <p class="text-emerald-700 text-xs leading-relaxed">Your face has been registered and you can now use the attendance system securely.</p>
              </div>
            </div>
            
            <div class="bg-blue-50 rounded-xl p-3 w-full border border-blue-200">
              <h4 class="text-blue-800 font-semibold text-xs mb-2">🚀 You're all set!</h4>
              <ul class="text-blue-700 text-xs space-y-1">
                <li>• Start checking in with face recognition</li>
                <li>• Track your work hours automatically</li>
                <li>• View your attendance history</li>
              </ul>
            </div>
          </div>
        `,
        confirmButtonText: "Start Working",
        customClass: {
          popup: '!max-w-[90vw] sm:!max-w-sm !p-4 sm:!p-6 !rounded-3xl !shadow-2xl !border-0 !mx-4',
          title: '!text-lg sm:!text-xl !mb-3 sm:!mb-4 !font-bold !bg-gradient-to-r !from-amber-600 !to-orange-600 !bg-clip-text !text-transparent',
          confirmButton: '!px-4 sm:!px-6 !py-2.5 sm:!py-3 !text-sm !bg-gradient-to-r !from-amber-600 !to-orange-600 !text-white !rounded-2xl !font-semibold !shadow-lg hover:!shadow-xl !transform hover:!scale-105 !transition-all !duration-200 !w-full sm:!w-auto',
          htmlContainer: '!m-0 !p-0 !text-sm sm:!text-base'
        },
        buttonsStyling: false,
        backdrop: `rgba(0,0,0,0.4)`,
        allowOutsideClick: false,
        showClass: {
          popup: 'animate__animated animate__fadeInUp animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutDown animate__faster'
        }
      });

      // Close the modal and update registration status
      setShowRegistrationModal(false);
      setRegistrationStatus('completed');
      setUserRegistered(true);
      console.log('[DEBUG] Registration process completed successfully');
    } catch (error) {
      console.error('[DEBUG] Registration process failed:', error);
      
      // Reset registration status on failure
      setRegistrationStatus('required');
      setUserRegistered(false);
      
      Swal.fire({
        icon: 'error',
        title: '❌ Registration Failed',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 16px;">
            <div style="width: 64px; height: 64px; background: linear-gradient(to right, #ef4444, #dc2626); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg style="width: 32px; height: 32px; color: white;" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
            </div>
            
            <div style="background: linear-gradient(to right, #fef2f2, #fef2f2); border-radius: 16px; padding: 16px; width: 100%; border: 1px solid #fecaca; text-align: center;">
              <p style="color: #991b1b; font-weight: 600; font-size: 14px; margin: 0 0 8px 0;">Registration failed</p>
              <p style="color: #b91c1c; font-size: 12px; margin: 0;">${error.message || "Failed to register user. Please try again."}</p>
            </div>
            
            <div style="background: #eff6ff; border-radius: 12px; padding: 12px; width: 100%; border: 1px solid #dbeafe;">
              <h4 style="color: #1e40af; font-weight: 600; font-size: 12px; margin: 0 0 8px 0;">💡 Troubleshooting tips:</h4>
              <ul style="color: #1d4ed8; font-size: 12px; margin: 0; padding-left: 16px; line-height: 1.5;">
                <li>Check your internet connection</li>
                <li>Ensure camera permissions are enabled</li>
                <li>Try taking the photo again</li>
                <li>Contact support if issue persists</li>
              </ul>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Try Again",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#64748b",
        backdrop: `rgba(0,0,0,0.4)`,
        allowOutsideClick: true
      }).then((result) => {
        if (result.isConfirmed) {
          // Try again - reopen the registration modal
          setTimeout(() => {
            setShowRegistrationModal(true);
          }, 300);
        }
        // Cancel or dismiss - popup automatically closes
      });
    }
  };
  
  const getUserData = () => {
    // Try multiple sources for user data
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
        // Merge profile data with user data, profile takes precedence
        user = { ...user, ...profile };
      } catch (e) {
        console.error('Error parsing profile data:', e);
      }
    }
    
    return user;
  };

  // UI Rendering
  if (showWebcam) {
    return <WebcamCapture onCapture={handleCapture} onClose={() => setShowWebcam(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-600 font-medium">Loading your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-200 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExitToApp className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Connection Error</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const userData = getUserData();
  const userName = userData ? 
    `${userData.firstName || userData.fullName || userData.name || 'Unknown'} ${userData.lastName || ''}`.trim() : 
    "Unknown User";
  const employeeId = userData?.id || userData?.userId || userData?.username || "Unknown";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Punch Clock
              </h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">Track your work hours with precision</p>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="text-left sm:text-right">
                <p className="text-sm text-slate-500">Welcome back,</p>
                <p className="font-semibold text-slate-800">{userName}</p>
                {employeeId && employeeId !== "Unknown" && (
                  <p className="text-xs text-slate-500">ID: {employeeId}</p>
                )}
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Main Punch Clock Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              {/* Registration Status Banner */}
              {registrationStatus === 'required' && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <div>
                        <span className="font-semibold text-sm">Face Registration Required</span>
                        <p className="text-xs text-orange-100 mt-1">Please register your face to enable attendance tracking</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowRegistrationModal(true)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      Register Now
                    </button>
                  </div>
                </div>
              )}

              {registrationStatus === 'completed' && userRegistered && (
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3">
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <span className="font-medium text-sm">✨ Face registration completed - Ready for secure check-ins!</span>
                  </div>
                </div>
              )}

              {/* Status Header */}
              <div className={`px-6 py-4 ${isCheckedIn ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-slate-600 to-slate-700'}`}>
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isCheckedIn ? 'bg-green-200' : 'bg-slate-300'} animate-pulse`}></div>
                    <span className="font-semibold">
                      {isCheckedIn ? "You're clocked in" : "Ready to start"}
                    </span>
                  </div>
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {/* Registration Required Overlay */}
                {registrationStatus === 'required' && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
                      <div className="text-center space-y-4 sm:space-y-6 p-6 sm:p-8">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Register Your Face</h3>
                          <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base">Complete your setup to start tracking attendance securely with face recognition</p>
                          <button
                            onClick={() => setShowRegistrationModal(true)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg transform transition-all duration-200 hover:scale-105"
                          >
                            <div className="flex items-center space-x-2">
                              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="text-sm sm:text-base">Register Face Now</span>
                            </div>
                          </button>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3 sm:p-4 border border-blue-200">
                          <h4 className="text-blue-800 font-semibold text-sm mb-2">🔒 Why face registration?</h4>
                          <ul className="text-blue-700 text-xs sm:text-sm space-y-1 text-left">
                            <li>• Secure and contactless attendance</li>
                            <li>• Prevents buddy punching</li>
                            <li>• Quick and accurate time tracking</li>
                            <li>• One-time setup process</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timer Display */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className="relative">
                    <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 font-mono tracking-wider">
                      {isCheckedIn ? formatTime(timer) : "00:00:00"}
                    </div>
                    <p className="text-slate-500 mt-2 text-base sm:text-lg">
                      {isCheckedIn ? "Working time" : registrationStatus === 'required' ? "Complete registration to start" : "Press Check In to start"}
                    </p>
                  </div>
                </div>

                {/* Check In/Out Button */}
                <div className="flex justify-center mb-6 sm:mb-8">
                  <button
                    onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
                    disabled={!localStorage.getItem("userId")}
                    className={`group relative px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 ${
                      isCheckedIn 
                        ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white" 
                        : localStorage.getItem("userId")
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                          : "bg-slate-400 cursor-not-allowed text-slate-200"
                    } ${!localStorage.getItem("userId") ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span>{isCheckedIn ? "Check Out" : "Check In"}</span>
                    </div>
                    {!localStorage.getItem("userId") && (
                      <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-slate-500 whitespace-nowrap">
                        Registration Required
                      </span>
                    )}
                  </button>
                </div>

                {/* Location & Status Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPinIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">Current Location</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {geoError ? geoError : location ? 
                            `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 
                            "Detecting location..."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isCheckedIn ? 'bg-green-100' : 'bg-slate-200'
                      }`}>
                        <CheckCircle className={`w-5 h-5 ${isCheckedIn ? 'text-green-600' : 'text-slate-400'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">Work Status</p>
                        <p className={`text-xs mt-1 font-medium ${
                          isCheckedIn ? 'text-green-600' : 'text-slate-500'
                        }`}>
                          {isCheckedIn ? "Active Work Session" : "Not Checked In"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Map */}
                {location && !geoError && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      Your Location
                    </h4>
                    <div className="rounded-xl overflow-hidden border-2 border-slate-200">
                      <iframe
                        className="w-full h-48"
                        src={`https://maps.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`}
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Registration Status */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
                Face Recognition
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {registrationStatus === 'completed' ? (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-emerald-800">Face Registered</p>
                        <p className="text-xs text-emerald-600">Ready for secure check-ins</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-800">Registration Required</p>
                        <p className="text-xs text-amber-600">Complete setup to start</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowRegistrationModal(true)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                    >
                      Register Face
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                Today's Summary
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 text-sm">Check-in Time</span>
                  <span className="font-medium text-slate-800 text-sm">
                    {checkInTime || "Not checked in"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 text-sm">Status</span>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                    isCheckedIn 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isCheckedIn ? "Working" : "Off Duty"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 text-sm">Duration</span>
                  <span className="font-medium text-slate-800 text-sm">
                    {isCheckedIn ? formatTime(timer) : "00:00:00"}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                Recent Activity
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {history.slice(0, 3).map((record, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 sm:p-3 bg-slate-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-slate-800">
                        {record.date || formatDisplayDate(record.checkInDate) || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {record.checkInTime?.substring(0,5)} - {record.checkOutTime?.substring(0,5) || 'In Progress'}
                      </p>
                    </div>
                    <div className="text-xs font-medium text-slate-600">
                      {record.totalHours?.substring(0,5) || '--'}
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="text-center py-4">
                    <History className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Attendance History Table */}
        <div className="mt-6 sm:mt-8 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                <History className="w-5 h-5 mr-2 text-indigo-600" />
                Attendance History
              </h3>
              {history.length > 0 && (
                <button 
                  onClick={handleDownloadHistory} 
                  className="inline-flex items-center px-3 sm:px-4 py-2 border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700">Date</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700">Check In</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700">Check Out</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700">Total Hours</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700 hidden md:table-cell">Location In</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700 hidden lg:table-cell">Location Out</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {history.length > 0 ? (
                  history.slice(0, 10).map((record, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-800">
                        {record.date || formatDisplayDate(record.checkInDate) || 'N/A'}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-800">
                        {record.checkInTime?.substring(0,5) || 'N/A'}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-800">
                        {record.checkOutTime?.substring(0,5) || (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            In Progress
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-slate-800">
                        {record.totalHours?.substring(0,5) || '--'}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">
                        {record.location ? `${record.location.latitude.toFixed(2)}, ${record.location.longitude.toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 hidden lg:table-cell">
                        {record.locationOut ? `${record.locationOut.latitude.toFixed(2)}, ${record.locationOut.longitude.toFixed(2)}` : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="text-slate-400">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No attendance records</p>
                        <p className="text-sm">Your attendance history will appear here once you start checking in.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showRegistrationModal && (
        <UserRegistrationModal
          open={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          onSave={handleUserRegistration}
        />
      )}
    </div>
  );
};

export default PunchClock;