import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import OnboardingLayout from "./OnboardingLayout";
import { 
  Mail, 
  Upload, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Users, 
  FileSpreadsheet,
  ArrowRight,
  X,
  Download,
  FileText
} from "lucide-react";

const InvitationPage = ({ onNext }) => {
  const [emails, setEmails] = useState([""]);
  const [bulkData, setBulkData] = useState([]);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (index, value) => {
    const updatedEmails = [...emails];
    updatedEmails[index] = value;
    setEmails(updatedEmails);
  };

  const handleAddEmail = () => {
    setEmails([...emails, ""]);
  };

  const handleRemoveEmail = (index) => {
    if (emails.length > 1) {
      const updatedEmails = emails.filter((_, i) => i !== index);
      setEmails(updatedEmails);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.includes('sheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        processFile(file);
      } else {
        alert('Please upload a valid Excel file (.xlsx or .xls)');
      }
    }
  };

  const processFile = (file) => {
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      const extractedEmails = parsedData.map((row) => row.Email || row.email || "");
      setBulkData(parsedData);
      setEmails(extractedEmails.filter(email => email.trim() !== ""));

      // Log the parsed data to show what was extracted
      console.log("Parsed employee data:", parsedData);
      if (parsedData.length > 0) {
        const validEmployees = parsedData.filter(row => 
          (row.Email || row.email) && (row.Email || row.email).trim() !== ""
        );
        console.log(`Successfully processed ${validEmployees.length} employees with complete details`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    processFile(file);
  };

  const downloadTemplate = () => {
    // Create sample data for the template with Name, Mobile Number, and Email
    const templateData = [
      { 
        Name: "John Doe",
        "Mobile Number": "9876543210",
        Email: "john.doe@company.com"
      },
      { 
        Name: "Jane Smith",
        "Mobile Number": "9876543211", 
        Email: "jane.smith@company.com"
      },
      { 
        Name: "Robert Johnson",
        "Mobile Number": "9876543212",
        Email: "robert.johnson@company.com"
      }
    ];

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths for better readability
    ws['!cols'] = [
      { width: 20 }, // Name column
      { width: 15 }, // Mobile Number column  
      { width: 30 }  // Email column
    ];

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Employee Details");

    // Download the file
    XLSX.writeFile(wb, "employee_details_template.xlsx");
  };

  const handleInvite = () => {
    const validEmails = emails.filter((email) => email.trim() !== "");
    if (validEmails.length === 0) {
      alert("Please add at least one valid email.");
      return;
    }
  
    // ✅ Save that onboarding is complete and popup should show later
    localStorage.setItem("showPostOnboardingPopup", "true");
  
    console.log("Inviting these users:", bulkData);
    alert("Invitations sent successfully!");
    onNext(); // Triggers navigation to Employer Dashboard
  };
  

  const handleSkip = () => {
    localStorage.setItem("showPostOnboardingPopup", "true");
    navigate("/employer-dashboard");
  };

  const validEmails = emails.filter((email) => email.trim() !== "");
  const isFormValid = validEmails.length > 0;

  return (
    <OnboardingLayout title="Invite your employees">
      <div className="h-full flex items-center justify-center px-4 py-3">
        <div className="w-full max-w-2xl">
          {/* Progress Indicator */}
          <div className="mb-4">
            <div className="flex items-center space-x-4 mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-slate-600" />
                </div>
                <span className="text-slate-600 font-medium text-xs">General Details</span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200"></div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">2</span>
                </div>
                <span className="text-slate-700 font-medium text-xs">Invitations</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">Step 2 of 2 (optional)</p>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 lg:p-6">
              {/* Header Section */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="mb-2">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                    Your account is almost ready! 🎉
                  </span>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                  Invite your employees via email
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
                  Upload an Excel file or enter emails manually to get your team started.
                </p>
              </div>

              {/* File Upload Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    <FileSpreadsheet className="inline w-4 h-4 mr-2 text-emerald-600" />
                    Upload Excel File (Optional)
                  </label>
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors duration-200"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Template</span>
                  </button>
                </div>
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                      isDragOver
                        ? "border-emerald-400 bg-emerald-50 scale-[1.02]"
                        : uploadedFileName
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400"
                    }`}
                  >
                    {uploadedFileName ? (
                      <div className="text-center">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-emerald-700 block">
                          ✅ File Uploaded Successfully!
                        </span>
                        <span className="text-xs text-emerald-600 mt-1 block">
                          {uploadedFileName}
                        </span>
                        <span className="text-xs text-slate-500 mt-1 block">
                          Click to upload a different file
                        </span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-all duration-300 ${
                          isDragOver ? "bg-emerald-500 scale-110" : "bg-slate-300"
                        }`}>
                          <Upload className={`w-5 h-5 transition-all duration-300 ${
                            isDragOver ? "text-white" : "text-slate-600"
                          }`} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 block">
                          {isDragOver ? "Drop your Excel file here" : "Click to upload or drag & drop"}
                        </span>
                        <span className="text-xs text-slate-500 mt-1 block">
                          Supports .xlsx and .xls files (Max 10MB)
                        </span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Template Instructions */}
                <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl border border-blue-100">
                  <div className="flex items-start space-x-2">
                    <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-semibold text-blue-800 mb-1">Excel Template Format</h4>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        Your Excel file should have columns for <span className="font-semibold">"Name"</span>, <span className="font-semibold">"Mobile Number"</span>, and <span className="font-semibold">"Email"</span> with employee details. 
                        <button 
                          onClick={downloadTemplate}
                          className="text-emerald-600 hover:text-emerald-700 font-medium underline ml-1"
                        >
                          Download our template
                        </button> to get the exact format.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manual Email Entry Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    <Mail className="inline w-4 h-4 mr-2 text-blue-600" />
                    Enter Email Addresses
                  </label>
                  <button
                    onClick={handleAddEmail}
                    className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Email</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {emails.map((email, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="flex-1 relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => handleEmailChange(index, e.target.value)}
                          placeholder={`Email address ${index + 1}`}
                          className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                        />
                        {email && email.includes("@") && (
                          <div className="absolute inset-y-0 right-2 flex items-center">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          </div>
                        )}
                      </div>
                      {emails.length > 1 && (
                        <button
                          onClick={() => handleRemoveEmail(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Email Summary */}
                {validEmails.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Users className="w-3 h-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-800">
                        Ready to invite {validEmails.length} employee{validEmails.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSkip}
                  className="flex-1 py-2 px-4 text-sm font-semibold text-slate-600 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all duration-300"
                >
                  Skip This Step
                </button>
                <button
                  onClick={handleInvite}
                  className={`flex-1 py-2 px-4 text-sm font-semibold rounded-2xl transition-all duration-300 transform ${
                    isFormValid
                      ? "bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                  disabled={!isFormValid}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>{validEmails.length > 0 ? `Invite ${validEmails.length} Employee${validEmails.length !== 1 ? 's' : ''}` : 'Send Invitations'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center space-x-2 pt-4">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${isFormValid ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
              </div>
            </div>

            {/* Bottom Gradient */}
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
          </div>

          {/* Help Text */}
          <div className="text-center mt-3">
            <p className="text-xs text-slate-500">
              You can always invite more employees later from your dashboard.{" "}
              <button 
                onClick={handleSkip}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Skip for now
              </button>
            </p>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default InvitationPage;