import React, { useState, useRef, useEffect } from "react";
import {
  UserIcon,
  PhoneIcon,
  Building2Icon,
  GraduationCapIcon,
  PlusIcon,
  BanknoteIcon,
  Trash2Icon,
  FileTextIcon,
  UploadCloud as UploadCloudIcon
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import "react-datepicker/dist/react-datepicker.css";
import { updateUserProfile, fetchUserProfile, createEmployee } from "../../API/apiService";
import { updateEmployeeProfilePhoto } from "../../API/apiService";
import { useNavigate } from "react-router-dom";

// Shared style classes for a modern, classy look (light theme)
const sectionClass = "bg-white/95 p-6 w-full rounded-2xl border border-gray-200 shadow-md transition-all duration-300 hover:shadow-lg";
const buttonClass = "mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 !rounded-lg font-semibold shadow-md transition";


const getMimeType = (base64) => {
  if (base64.startsWith("/9j/")) return "image/jpeg";
  if (base64.startsWith("iVBOR")) return "image/png";
  if (base64.startsWith("JVBER")) return "application/pdf";
  return "application/octet-stream";
};

// Helper to generate id from label
const generateId = (label) => label.replace(/\s+/g, "-").toLowerCase();

// ------------------ Reusable Input Component ------------------
const InputWithLabel = ({
  label,
  placeholder = "",
  type = "text",
  value = "",
  onChange,
  onBlur,
  disabled = false,
  required = false,
  showError = false,
  pattern,
  title,
  name
}) => {
  const inputId = generateId(label);

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={inputId}
        name={name || inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        pattern={pattern}
        title={title}
        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base ${
          disabled 
            ? "bg-gray-100 text-gray-500 cursor-not-allowed" 
            : "bg-white text-gray-800"
        } ${
          showError 
            ? "border-red-500 bg-red-50" 
            : "border-gray-300 hover:border-gray-400"
        }`}
      />
      {showError && (
        <p className="mt-1 text-xs sm:text-sm text-red-600">
          This field is required
        </p>
      )}
    </div>
  );
};

// ------------------ Reusable Select Component ------------------
const SelectWithLabel = ({
  label,
  options,
  value = "",
  onChange,
  disabled = false,
  required = false,
  showError = false,
  name
}) => {
  const id = generateId(label);
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full px-4 py-2 bg-gray-50 border border-gray-300 text-gray-800 !rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        } ${showError ? "border-red-500" : ""}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {showError && (
        <span className="text-sm text-red-500">
          * Enter valid {label}
        </span>
      )}
    </div>
  );
};
const FileUpload = ({ label, accept, required = false, onUpload, existingFile }) => {
  const fileInputRef = useRef();
  const [fileName, setFileName] = useState("");

  const getMimeTypeAndExtension = (base64) => {
    if (base64.startsWith("JVBER")) return { type: "application/pdf", ext: "pdf" };
    if (base64.startsWith("/9j/")) return { type: "image/jpeg", ext: "jpg" };
    if (base64.startsWith("iVBOR")) return { type: "image/png", ext: "png" };
    if (base64.startsWith("UEsDB")) return { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ext: "docx" };
    return { type: "application/octet-stream", ext: "bin" };
  };

  useEffect(() => {
    if (existingFile) {
      setFileName("Uploaded Document");
    }
  }, [existingFile]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(",")[1];
        setFileName(file.name);
        toast.success(`${label} uploaded successfully`);
        if (onUpload) {
          onUpload(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const mimeInfo = existingFile ? getMimeTypeAndExtension(existingFile) : null;

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {existingFile ? (
        <div className="flex items-center gap-3">
          <a
            href={`data:${mimeInfo?.type};base64,${existingFile}`}
            download={`${label.replace(/\s/g, "_")}.${mimeInfo?.ext || "file"}`}
            className="text-blue-600 underline text-sm"
          >
            Download Document
          </a>
          <button
            type="button"
            onClick={() => {
              setFileName("");
              onUpload(""); // Clear it if needed
            }}
            className="text-sm text-red-500 hover:underline"
          >
            Replace
          </button>
        </div>
      ) : (
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleUpload}
          required={required}
          className="file:mr-4 file:py-2 file:px-4 file:!rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 bg-gray-50 text-gray-800 border border-gray-300 !rounded-lg"
        />
      )}

      {fileName && !existingFile && (
        <span className="text-sm text-gray-500 mt-1">{fileName}</span>
      )}
    </div>
  );
};

// ------------------ Document Uploads ------------------
const DocumentUploads = ({ onDocumentUpload, documents = {} }) => (
  <section className={sectionClass}>
    <div className="flex items-center gap-2 mb-4">
      <FileTextIcon className="w-5 h-5 text-blue-500" />
      <h3 className="text-xl font-semibold text-gray-800">Document Uploads</h3>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FileUpload
        label="Adhaar Card"
        accept=".pdf,.jpg,.jpeg,.png"
        required
        onUpload={(data) => onDocumentUpload("adharCardDocument", data)}
        existingFile={documents.adharCardDocument}
      />
      <FileUpload
        label="PAN Card"
        accept=".pdf,.jpg,.jpeg,.png"
        required
        onUpload={(data) => onDocumentUpload("panCardDocument", data)}
        existingFile={documents.panCardDocument}
      />
      <FileUpload
        label="Bank Passbook"
        accept=".pdf,.jpg,.jpeg,.png"
        required
        onUpload={(data) => onDocumentUpload("bankPassbook", data)}
        existingFile={documents.bankPassbook}
      />
      <FileUpload
        label="Resume"
        accept=".pdf,.doc,.docx"
        onUpload={(data) => onDocumentUpload("resume", data)}
        existingFile={documents.resume}
      />
      <FileUpload
        label="Offer Letter / Relieving Letter"
        accept=".pdf,.doc,.docx"
        onUpload={(data) => onDocumentUpload("offerLetter", data)}
        existingFile={documents.offerLetter}
      />
    </div>
  </section>
);

// ------------------ Progress Tracker ------------------
const ProgressTracker = ({ formData }) => {
  const [progress, setProgress] = useState(0);
  const [pendingItems, setPendingItems] = useState([]);

  useEffect(() => {
    const calculateProgress = () => {
      if (!formData || !formData.employeeOverview || !formData.emergencyContacts || !formData.qualifications || !formData.bankDetails) {
        return; // Wait until formData is fully initialized
      }

      const requiredFields = {
        basicInfo: [
          "fullName",
          "dob",
          "fatherName",
          "permanentAddress",
          "localAddress",
          "aadhar",
          "phone",
          "gender",
          "maritalStatus",
          "nationality",
          "epfNumber"
        ],
        emergencyContacts: ["contact1Name", "contact1Number", "contact1Relation", "contact1Address", "contact1Alternate"],
        bankDetails: ["bankName", "accountNumber", "ifsc", "branch", "accountType"]
      };

      let completedSections = 0;
      const pending = [];

      const basicValid = requiredFields.basicInfo.every(
        (field) => formData.employeeOverview[field]?.trim() !== ""
      );
      if (basicValid) completedSections++;
      else pending.push("Basic Information");

      const ecValid = requiredFields.emergencyContacts.every(
        (field) => formData.emergencyContacts[field]?.trim() !== ""
      );
      if (ecValid) completedSections++;
      else pending.push("Emergency Contacts");

      const qualValid =
        formData.qualifications.length > 0 &&
        formData.qualifications[0].degreeType?.trim() !== "";
      if (qualValid) completedSections++;
      else pending.push("Qualification Details");

      const bankValid = requiredFields.bankDetails.every(
        (field) => formData.bankDetails[field]?.trim() !== ""
      );
      if (bankValid) completedSections++;
      else pending.push("Bank Details");

      setProgress((completedSections / 4) * 100);
      setPendingItems(pending);
    };

    calculateProgress();
  }, [formData]);

  return (
    <div className="bg-blue-200 p-4 rounded-xl">
      <h3 className="text-xl font-semibold text-gray-800">Progress Tracker</h3>
      <div className="h-2 mt-2 bg-gray-300 rounded-full">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="mt-2 text-sm text-gray-700">{progress}% Complete</div>
      {pendingItems.length > 0 && (
        <div className="mt-2 text-sm text-gray-700">
          Pending: {pendingItems.join(", ")}
        </div>
      )}
    </div>
  );
};


// ------------------ Updated Profile Photo Upload ------------------
const ProfilePhotoUpload = () => {
  const fileInputRef = useRef();
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);


  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setIsUploading(true);
  
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result.split(",")[1];
        try {
          await updateEmployeeProfilePhoto(base64Data);
          toast.success("Profile photo uploaded successfully");
        } catch (err) {
          console.error("Profile photo upload failed:", err);
          toast.error("Failed to upload profile photo");
        } finally {
          setIsUploading(false);
        }
      };
  
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <section className={sectionClass}>
      <div className="flex items-center gap-2 mb-4">
        <UploadCloudIcon className="w-5 h-5 text-blue-500" />
        <h3 className="text-xl font-semibold text-gray-800">Profile Photo</h3>
      </div>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 !rounded-lg shadow-md transition disabled:opacity-60"
          disabled={isUploading}
        >
          <UploadCloudIcon className="w-5 h-5" />
          {isUploading ? "Uploading..." : "Upload Profile Photo"}
        </button>
        {fileName && <span className="ml-4 text-gray-700">{fileName}</span>}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg"
        onChange={handleUpload}
        className="hidden"
      />
    </section>
  );
};



// ------------------ Section Toggle for Editable Sections ------------------
const SectionWithToggle = ({ title, icon: Icon, children, validate = () => true, disabled, initialEditMode = false }) => {
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [hasSaved, setHasSaved] = useState(false);

  const toggleEdit = () => {
    if (isEditing) {
      if (!validate()) {
        toast.error("Please fill in all mandatory fields.");
        return;
      }
      setHasSaved(true);
      toast.success(`${title} saved successfully!`);
    }
    setIsEditing(!isEditing);
  };

  return (
    <section className={sectionClass}>
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Icon className="w-5 h-5 text-blue-500" /> {title}
        </h3>
      </div>
      {children(isEditing)}
      {!disabled && (
        <div className="mt-6 flex justify-end !!rounded-lg">
          <button onClick={toggleEdit} className={buttonClass}>
            {isEditing ? "💾 Save" : "✏️ Edit"}
          </button>
        </div>
      )}
    </section>
  );
};



// ------------------ Employee Overview Section ------------------
const EmployeeOverview = ({ isLocked, data, onChange }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
    setErrors(prev => ({ ...prev, [name]: false }));
  };

  const phonePattern = "^[6-9]\\d{9}$";
  const epfPattern = "^[0-9]{12}$"; // EPF must be exactly 12 digits
  const esiPattern = "^[0-9]{10}$"; // 10-digit number for ESI

  const validateEmployeeOverview = () => {
    let valid = true;
    const newErrors = {};
    const requiredFields = [
      "fullName",
      "dob",
      "fatherName",
      "permanentAddress",
      "localAddress",
      "aadhar",
      "phone",
      "gender",
      "maritalStatus",
      "nationality",
      "epfNumber"
    ];
    requiredFields.forEach((field) => {
      if (!data[field] || data[field].trim() === "") {
        newErrors[field] = true;
        valid = false;
      }
    });
    if (data.phone && !new RegExp(phonePattern).test(data.phone)) {
      newErrors.phone = true;
      valid = false;
      toast.error("Enter a valid 10-digit phone number");
    }
    if (data.epfNumber && !new RegExp(epfPattern).test(data.epfNumber)) {
      newErrors.epfNumber = true;
      valid = false;
      toast.error("Enter valid EPF Number (12 digits required)");
    }
    if (data.esiNumber && data.esiNumber.trim() !== "" && !new RegExp(esiPattern).test(data.esiNumber)) {
      newErrors.esiNumber = true;
      valid = false;
      toast.error("Enter valid ESI Number (10 digits required)");
    }
    // Father's name and local contact1Address are mandatory
    if (!data.fatherName.trim()) {
      newErrors.fatherName = true;
      valid = false;
    }
    if (!data.localAddress.trim()) {
      newErrors.localAddress = true;
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  return (
    <SectionWithToggle
      title="Basic Information"
      icon={UserIcon}
      validate={validateEmployeeOverview}
      disabled={isLocked}
    >
      {(isEditing) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputWithLabel
            label="Full Name"
            name="fullName"
            value={data.fullName}
                      onChange={handleChange}
                      required
            showError={errors.fullName}
            disabled={!isEditing}

          />
          <InputWithLabel
            label="Email"
                      name="email"
            value={data.email}
                      onChange={handleChange}
                      disabled={!isEditing}

          />
          <InputWithLabel
            label="Date of Birth"
                      type="date"
                      name="dob"
            value={data.dob}
                      onChange={handleChange}
                      required
            showError={errors.dob}
            disabled={!isEditing}

          />
          <InputWithLabel
            label="Father's Name"
            name="fatherName"
            value={data.fatherName}
                      onChange={handleChange}
                      required
            showError={errors.fatherName}
            disabled={!isEditing}

          />
          <InputWithLabel
            label="Spouse Name"
                      name="spouseName"
            value={data.spouseName}
                      onChange={handleChange}
                      disabled={!isEditing}

          />
          <InputWithLabel
            label="Permanent Address"
                      name="permanentAddress"
            value={data.permanentAddress}
                      onChange={handleChange}
                      required
            showError={errors.permanentAddress}
            disabled={!isEditing}

          />
          <InputWithLabel
            label="Local Address"
                      name="localAddress"
            value={data.localAddress}
                      onChange={handleChange}
            required
            showError={errors.localAddress}
            disabled={!isEditing}

          />
          <InputWithLabel
            label="Aadhar Card Number"
            name="aadhar"
            value={data.aadhar}
            onChange={handleChange}
                      required
            showError={errors.aadhar}
            disabled={!isEditing}

          />
          <InputWithLabel
            label="Phone Number"
            name="phone"
            value={data.phone}
            onChange={handleChange}
                      required
            showError={errors.phone}
            pattern={phonePattern}
            title="Enter a valid 10-digit phone number"
            disabled={!isEditing}

          />
          <SelectWithLabel
            label="Gender"
            name="gender"
            value={data.gender}
            onChange={handleChange}
            options={[
              { value: "", label: "Select Gender" },
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
              { value: "Other", label: "Other" }
            ]}
            required
            showError={errors.gender}
            disabled={!isEditing}

          />
          <SelectWithLabel
            label="Marital Status"
            name="maritalStatus"
            value={data.maritalStatus}
            onChange={handleChange}
            options={[
              { value: "", label: "Select Marital Status" },
              { value: "Single", label: "Single" },
              { value: "Married", label: "Married" },
              { value: "Divorced", label: "Divorced" },
              { value: "Widowed", label: "Widowed" }
            ]}
            required
            showError={errors.maritalStatus}
            disabled={!isEditing}

          />
          <SelectWithLabel
            label="Nationality"
            name="nationality"
            value={data.nationality}
            onChange={handleChange}
            options={[
              { value: "", label: "Select Nationality" },
              { value: "Indian", label: "Indian" },
              { value: "American", label: "American" },
              { value: "Other", label: "Other" }
            ]}
            required
            showError={errors.nationality}
            disabled={!isEditing}

          />
          <InputWithLabel
            label="PAN Number"
            name="pan"
            value={data.pan}
            onChange={handleChange}
            disabled={!isEditing}

          />
          <SelectWithLabel
            label="Blood Group"
            name="bloodGroup"
            value={data.bloodGroup}
            onChange={handleChange}
            options={[
              { value: "", label: "Select Blood Group" },
              { value: "A+", label: "A+" },
              { value: "A-", label: "A-" },
              { value: "B+", label: "B+" },
              { value: "B-", label: "B-" },
              { value: "O+", label: "O+" },
              { value: "O-", label: "O-" },
              { value: "AB+", label: "AB+" },
              { value: "AB-", label: "AB-" }
            ]}
            disabled={!isEditing}

          />
          <SelectWithLabel
            label="Religion / Caste"
            name="religion"
            value={data.religion}
            onChange={handleChange}
            options={[
              { value: "", label: "Select Religion / Caste" },
              { value: "Hindu", label: "Hindu" },
              { value: "Muslim", label: "Muslim" },
              { value: "Christian", label: "Christian" },
              { value: "Sikh", label: "Sikh" },
              { value: "Other", label: "Other" }
            ]}
            disabled={!isEditing}

          />
          <InputWithLabel
            label="EPF Number"
            name="epfNumber"
            value={data.epfNumber}
            onChange={handleChange}
            required
            showError={errors.epfNumber}
            pattern={epfPattern}
            title="Enter 12 digits"
            disabled={!isEditing}

          />
          <InputWithLabel
            label="ESI Number (if available)"
            name="esiNumber"
            value={data.esiNumber}
            onChange={handleChange}
            showError={errors.esiNumber}
            pattern={esiPattern}
            title="Enter a valid 10-digit ESI number"
            disabled={!isEditing}

          />
                </div>
              )}
    </SectionWithToggle>
  );
};

// ------------------ Emergency Contacts Section ------------------
// ------------------ Emergency Contacts Section ------------------
const EmergencyContacts = ({ isLocked, data, onChange }) => {
  const [ecErrors, setEcErrors] = useState({});

  const relationOpts = [
    { value: "", label: "Select Relation" },
    { value: "Parent", label: "Parent" },
    { value: "Spouse", label: "Spouse" },
    { value: "Sibling", label: "Sibling" },
    { value: "Friend", label: "Friend" },
    { value: "Other", label: "Other" }
  ];

  const [showContact2, setShowContact2] = useState(() => {
    return !!(
      data.contact2Name ||
      data.contact2Number ||
      data.contact2Alternate ||
      data.contact2Relation ||
      data.contact2Address
    );
  });

  const phonePattern = "^[6-9]\\d{9}$";

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
    setEcErrors(prev => ({ ...prev, [name]: false }));
  };

  const validateEmergency = () => {
    let valid = true;
    const newErrors = {};
    if (!data.contact1Name) {
      newErrors.contact1Name = true;
      valid = false;
    }
    if (!data.contact1Number || !new RegExp(phonePattern).test(data.contact1Number)) {
      newErrors.contact1Number = true;
      valid = false;
      toast.error("Enter a valid 10-digit contact number for Contact 1");
    }
    if (!data.contact1Relation) {
      newErrors.contact1Relation = true;
      valid = false;
    }
    setEcErrors(newErrors);
    return valid;
  };

  return (
    <SectionWithToggle
      title="Emergency Contacts"
      icon={PhoneIcon}
      validate={validateEmergency}
      disabled={isLocked}
    >
      {(isEditing) => (
        <div className="grid grid-cols-1 gap-4">
          {/* Contact 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputWithLabel
              label="Contact 1 Name"
              name="contact1Name"
              value={data.contact1Name || ""}
              onChange={handleChange}
              required
              showError={ecErrors.contact1Name}
              disabled={!isEditing}
            />
            <InputWithLabel
              label="Contact 1 Number"
              name="contact1Number"
              value={data.contact1Number || ""}
              onChange={handleChange}
              required
              showError={ecErrors.contact1Number}
              pattern={phonePattern}
              title="Enter a valid 10-digit number"
              disabled={!isEditing}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputWithLabel
              label="Alternate Phone (Contact 1)"
              name="contact1Alternate"
              value={data.contact1Alternate || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />
            <SelectWithLabel
              label="Relation (Contact 1)"
              name="contact1Relation"
              value={data.contact1Relation || ""}
              onChange={handleChange}
              options={relationOpts}
              required
              showError={ecErrors.contact1Relation}
              disabled={!isEditing}
            />
          </div>
          <InputWithLabel
            label="Address (Contact 1)"
            name="contact1Address"
            value={data.contact1Address || ""}
            onChange={handleChange}
            disabled={!isEditing}
          />

          {/* Contact 2 - Optional Section */}
          {showContact2 && (
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold text-gray-800">Contact 2 (Optional)</h4>
                {isEditing && (
                  <button
                    onClick={() => {
                      onChange({
                        contact2Name: "",
                        contact2Number: "",
                        contact2Alternate: "",
                        contact2Relation: "",
                        contact2Address: ""
                      });
                      setShowContact2(false);
                    }}
                    className="p-2 rounded-full text-red-500 hover:bg-red-100"
                  >
                    <Trash2Icon className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputWithLabel
                  label="Contact 2 Name"
                  name="contact2Name"
                  value={data.contact2Name || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <InputWithLabel
                  label="Contact 2 Number"
                  name="contact2Number"
                  value={data.contact2Number || ""}
                  onChange={handleChange}
                  pattern={phonePattern}
                  title="Enter a valid 10-digit number"
                  disabled={!isEditing}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputWithLabel
                  label="Alternate Phone (Contact 2)"
                  name="contact2Alternate"
                  value={data.contact2Alternate || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <SelectWithLabel
                  label="Relation (Contact 2)"
                  name="contact2Relation"
                  value={data.contact2Relation || ""}
                  onChange={handleChange}
                  options={relationOpts}
                  disabled={!isEditing}
                />
              </div>
              <InputWithLabel
                label="Address (Contact 2)"
                name="contact2Address"
                value={data.contact2Address || ""}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          )}

          {/* Add Contact 2 Button */}
          {isEditing && !showContact2 && (
            <button
              onClick={() => setShowContact2(true)}
              className="text-blue-500 flex items-center gap-2 text-sm mt-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Contact 2
            </button>
          )}
        </div>
      )}
    </SectionWithToggle>
  );
};


// ------------------ Qualifications Section ------------------
const QualificationsCard = ({ isLocked, data, onChange }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (index, field) => (e) => {
    const updated = [...data];
    updated[index][field] = e.target.value;
    onChange(updated);
    if (index === 0 && field === "degreeType" && e.target.value.trim() === "") {
      setErrors((prev) => ({ ...prev, degreeType: true }));
    } else {
      setErrors((prev) => ({ ...prev, degreeType: false }));
    }
  };

  const validateQualifications = () => {
    if (data.length === 0 || data[0].degreeType.trim() === "") {
      setErrors((prev) => ({ ...prev, degreeType: true }));
      toast.error("Please enter at least one qualification (Degree Type required)");
      return false;
    }
    return true;
  };

  const addQualification = () =>
    onChange([
      ...data,
      { id: Date.now(), degreeType: "", specialization: "", year: "", percentage: "", institute: "" }
    ]);

  const removeQualification = (id) => {
    onChange(data.filter((q) => q.id !== id));
  };

  return (
    <SectionWithToggle
      title="Qualification Details"
      icon={GraduationCapIcon}
      validate={validateQualifications}
      disabled={isLocked}
    >
      {(isEditing) => (
        <>
          {data.map((qual, index) => (
            <div key={qual.id} className=" flex-col sm:flex-row gap-4 mb-4 items-end">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 flex-1">
                <InputWithLabel
                  label="Degree Type *"
                  value={qual.degreeType}
                  onChange={handleChange(index, "degreeType")}
                  disabled={!isEditing}
                  required={index === 0}
                  showError={index === 0 && errors.degreeType}
                />
                <InputWithLabel
                  label="Specialization / Major"
                  value={qual.specialization}
                  onChange={handleChange(index, "specialization")}
                  disabled={!isEditing}
                />
                <InputWithLabel
                  label="Passout Year"
                  value={qual.year}
                  onChange={handleChange(index, "year")}
                  disabled={!isEditing}
                />
                <InputWithLabel
                  label="Percentage"
                  value={qual.percentage}
                  onChange={handleChange(index, "percentage")}
                  disabled={!isEditing}
                />
                <InputWithLabel
                  label="Institute"
                  value={qual.institute}
                  onChange={handleChange(index, "institute")}
                  disabled={!isEditing}
                />
                  </div>
              {isEditing && data.length > 1 && (
                <button
                  onClick={() => removeQualification(qual.id)}
                  className="p-2 rounded-full text-red-500 hover:bg-red-100"
                >
                  <Trash2Icon className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          {isEditing && (
            <button
              onClick={addQualification}
              className="text-blue-500 flex items-center gap-2 text-sm mb-6"
            >
              <PlusIcon className="w-4 h-4" /> Add Qualification
            </button>
          )}
        </>
      )}
    </SectionWithToggle>
  );
};

// ------------------ Experience Section ------------------
const ExperienceCard = ({ isLocked, data, onChange }) => {
  const handleChange = (index, field) => (e) => {
    const updated = [...data];
    updated[index][field] = e.target.value;
    onChange(updated);
  };

  const validateExperience = () => true;

  const addExperience = () =>
    onChange([
      ...data,
      { id: Date.now(), company: "", designation: "", start: "", end: "", reasonForLeaving: "", referenceContact: "" }
    ]);

  const removeExperience = (id) => {
    onChange(data.filter((exp) => exp.id !== id));
  };

  return (
    <SectionWithToggle
      title="Experience Details"
      icon={Building2Icon}
      validate={validateExperience}
      disabled={isLocked}
    >
      {(isEditing) => (
        <>
          {data.map((exp, index) => (
            <div key={exp.id} className="flex-col sm:flex-row gap-4 mb-4 items-end">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                <InputWithLabel
                  label="Company Name"
                  value={exp.company}
                  onChange={handleChange(index, "company")}
                  disabled={!isEditing}
                />
                <InputWithLabel
                  label="Designation"
                  value={exp.designation}
                  onChange={handleChange(index, "designation")}
                  disabled={!isEditing}
                />
                <InputWithLabel
                  label="Start Date"
                  type="date"
                  value={exp.start}
                  onChange={handleChange(index, "start")}
                  disabled={!isEditing}
                />
                <InputWithLabel
                  label="End Date"
                  type="date"
                  value={exp.end}
                  onChange={handleChange(index, "end")}
                  disabled={!isEditing}
                />
                <InputWithLabel
                  label="Reason for Leaving"
                  value={exp.reasonForLeaving}
                  onChange={handleChange(index, "reasonForLeaving")}
                  disabled={!isEditing}
                />
                <InputWithLabel
                  label="Reference Contact"
                  value={exp.referenceContact}
                  onChange={handleChange(index, "referenceContact")}
                  disabled={!isEditing}
            />
          </div>
              {isEditing && data.length > 1 && (
            <button
                  onClick={() => removeExperience(exp.id)}
                  className="p-2 rounded-full text-red-500 hover:bg-red-100"
            >
                  <Trash2Icon className="w-5 h-5" />
            </button>
          )}
        </div>
      ))}
          {isEditing && (
      <button
              onClick={addExperience}
              className="text-blue-500 flex items-center gap-2 text-sm"
      >
              <PlusIcon className="w-4 h-4" /> Add Experience
      </button>
          )}
        </>
      )}
    </SectionWithToggle>
  );
};

// ------------------ Bank Details Section ------------------
const BankDetails = ({ isLocked, data, onChange }) => {
  const [errors, setErrors] = useState({});

  const accountOpts = [
    { value: "", label: "Select Account Type" },
    { value: "Savings", label: "Savings" },
    { value: "Current", label: "Current" }
  ];

  const handleChange = (field) => (e) => {
    onChange({ [field]: e.target.value });
    setErrors({ ...errors, [field]: false });
  };

  const ifscPattern = "^[A-Z]{4}0[0-9]{6}$";

  const handleIfscBlur = () => {
    if (data.ifsc && !new RegExp(ifscPattern).test(data.ifsc)) {
      setErrors((prev) => ({ ...prev, ifsc: true }));
      toast.error("Invalid IFSC code. Format: AAAA0XXXXXX");
    }
  };

  const validateBank = () => {
    let valid = true;
    const newErrors = {};
    Object.entries(data).forEach(([key, value]) => {
      if (!value) {
        newErrors[key] = true;
        valid = false;
      }
    });
    if (data.ifsc && !new RegExp(ifscPattern).test(data.ifsc)) {
      newErrors.ifsc = true;
      valid = false;
      toast.error("Invalid IFSC code. Format: AAAA0XXXXXX");
    }
    setErrors(newErrors);
    return valid;
  };

  return (
    <SectionWithToggle
      title="Bank Details"
      icon={BanknoteIcon}
      validate={validateBank}
      disabled={isLocked}
    >
      {(isEditing) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputWithLabel
            label="Bank Name *"
            value={data.bankName}
            onChange={handleChange("bankName")}
            required
            showError={errors.bankName}
            disabled={!isEditing}
          />
          <InputWithLabel
            label="Account Number *"
            value={data.accountNumber}
            onChange={handleChange("accountNumber")}
            required
            showError={errors.accountNumber}
            disabled={!isEditing}
          />
          <InputWithLabel
            label="IFSC Code *"
            value={data.ifsc}
            onChange={handleChange("ifsc")}
            onBlur={handleIfscBlur}
            required
            showError={errors.ifsc}
            pattern={ifscPattern}
            title="Format: 4 uppercase letters, 0, 6 digits (e.g., SBIN0XXXXXX)"
            disabled={!isEditing}
          />
          <InputWithLabel
            label="Branch Name/Address *"
            value={data.branch}
            onChange={handleChange("branch")}
            required
            showError={errors.branch}
            disabled={!isEditing}
          />
          <SelectWithLabel
            label="Account Type *"
            options={accountOpts}
            value={data.accountType}
            onChange={handleChange("accountType")}
            required
            showError={errors.accountType}
            disabled={!isEditing}
                    />
                  </div>
      )}
    </SectionWithToggle>
  );
};

// ------------------ Company Details Section ------------------
const CompanyDetails = () => (
  <section className={sectionClass}>
    <div className="flex items-center gap-2 mb-4">
      <Building2Icon className="w-5 h-5 text-blue-500" />
      <h3 className="text-xl font-semibold text-gray-800">
        Company Details (Filled by Company)
      </h3>
                  </div>
    <p className="text-sm text-gray-600 mb-4">
      These details are maintained by your employer and cannot be edited.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-50 pointer-events-none">
      <InputWithLabel label="Employee ID" />
      <InputWithLabel label="Designation / Job Title" />
      <InputWithLabel label="Department" />
      <InputWithLabel label="Joining Date" type="date" />
      <InputWithLabel label="Work Location/Office Address" />
      <InputWithLabel label="Team Allocated" />
      <InputWithLabel label="Salary" />
      <InputWithLabel label="EPF Deduction" />
      <InputWithLabel label="Insurance" />
      <InputWithLabel label="TDS Deduction" />
      <InputWithLabel label="Insurance Details" />
      <InputWithLabel label="Bonus" />
      <InputWithLabel label="Other Statutory" />
      <InputWithLabel label="Shift Allocated" />
      <InputWithLabel label="Break Time" />
      <InputWithLabel label="GPS Location" />
                  </div>
  </section>
);

// ------------------ Warning Section Component ------------------
const WarningSection = ({ formData }) => {
  const [pendingItems, setPendingItems] = useState([]);

  useEffect(() => {
    const checkPendingItems = () => {
      const pending = [];
      
      // Check Basic Information
      const requiredBasicFields = [
        "fullName",
        "dob",
        "fatherName",
        "permanentAddress",
        "localAddress",
        "aadhar",
        "phone",
        "gender",
        "maritalStatus",
        "nationality",
        "epfNumber"
      ];
      const basicInfoValid = requiredBasicFields.every(field => 
        formData.employeeOverview[field] && formData.employeeOverview[field].trim() !== ""
      );
      if (!basicInfoValid) pending.push("Basic Information");

      // Check Emergency Contacts
      const requiredEmergencyFields = ["contact1Name", "contact1Number", "contact1Relation"];
      const emergencyValid = requiredEmergencyFields.every(field =>
        formData.emergencyContacts[field] && formData.emergencyContacts[field].trim() !== ""
      );
      if (!emergencyValid) pending.push("Emergency Contacts");

      // Check Qualifications
      const qualificationsValid = formData.qualifications.length > 0 && 
        formData.qualifications[0].degreeType.trim() !== "";
      if (!qualificationsValid) pending.push("Qualification Details");

      // Check Bank Details
      const requiredBankFields = ["bankName", "accountNumber", "ifsc", "branch", "accountType"];
      const bankValid = requiredBankFields.every(field =>
        formData.bankDetails[field] && formData.bankDetails[field].trim() !== ""
      );
      if (!bankValid) pending.push("Bank Details");

      setPendingItems(pending);
    };

    checkPendingItems();
  }, [formData]);

  if (pendingItems.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-4 shadow-sm">
      <p className="font-semibold">⚠️ Pending Details:</p>
      <ul className="list-disc list-inside text-sm mt-2 space-y-1">
        {pendingItems.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
                  </div>
  );
};

// ------------------ Main Profile Component ------------------
const Profile = ({ darkMode }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState({
    adharCardDocument: "",
    panCardDocument: "",
    bankPassbook: "",
    resume: "",
    offerLetter: ""
   
  });
  const [formData, setFormData] = useState({
    employeeOverview: {
      fullName: "",
      email: "",
      dob: "",
      fatherName: "",
      spouseName: "",
      permanentAddress: "",
      localAddress: "",
      aadhar: "",
      phone: "",
      gender: "",
      maritalStatus: "",
      nationality: "",
      pan: "",
      bloodGroup: "",
      religion: "",
      epfNumber: "",
      esiNumber: ""
    },
    emergencyContacts: {
      contact1Name: "",
      contact1Number: "",
      contact1Alternate: "",
      contact1Relation: "",
      contact1Address: "",
      contact2Name: "",
      contact2Number: "",
      contact2Alternate: "",
      contact2Relation: "",
      contact2Address: ""
    },
    qualifications: [
      { id: 1, degreeType: "", specialization: "", year: "", percentage: "", institute: "" }
    ],
    experiences: [
      { id: 1, company: "", designation: "", start: "", end: "", reasonForLeaving: "", referenceContact: "" }
    ],
    bankDetails: {
      bankName: "",
      accountNumber: "",
      ifsc: "",
      branch: "",
      accountType: ""
    }
  });

  const navigate = useNavigate();

  // Fetch user profile data on component mount
useEffect(() => {
  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      console.log("Token found:", token);

      const response = await fetchUserProfile(token);
      console.log("Raw profile response:", response);

      // Handle case where user doesn't exist (response is 500)
      if (response === 500) {
        console.log("No existing profile found, using default form data");
        return;
      }

      // Check if response has the expected structure
      if (!response || typeof response !== 'object') {
        throw new Error("Invalid profile data structure received");
      }

      // Handle both possible response structures:
      // 1. Direct profile data (if API returns the employee object directly)
      // 2. Nested under 'res' property (if API returns {res: employeeData})
      const profileData = response.res || response;

      const parsedQualifications = profileData.qualifications
        ? typeof profileData.qualifications === 'string'
          ? JSON.parse(profileData.qualifications)
          : profileData.qualifications
        : [];

      const parsedExperiences = profileData.experiences
        ? typeof profileData.experiences === 'string'
          ? JSON.parse(profileData.experiences)
          : profileData.experiences
        : [];

         // ✅ Save the full profile to localStorage
      localStorage.setItem("profileData", JSON.stringify(profileData));

      setFormData({
        employeeOverview: {
          fullName: profileData.firstName || "",
          email: profileData.email || "",
          fatherName: profileData.fathersName || "",
          spouseName: profileData.spouseName || "",
          permanentAddress: profileData.permanentAddress || "",
          localAddress: profileData.localAddress || "",
          aadhar: profileData.aadharNumber || "",
          phone: profileData.mobileNumber || "",
          pan: profileData.panCard || "",
          epfNumber: profileData.uanNumber || "",
          esiNumber: profileData.esiNumber || "",
          dob: profileData.dob || "",
          maritalStatus: profileData.maritalStatus || "",
          nationality: profileData.nationality || "",
          bloodGroup: profileData.bloodGroup || "",
          religion: profileData.religion || "",
          gender: profileData.gender || "" // Added gender field which was missing
        },
        emergencyContacts: {
          contact1Name: profileData.emergencyContacts?.[0]?.name || "",
          contact1Number: profileData.emergencyContacts?.[0]?.number || "",
          contact1Relation: profileData.emergencyContacts?.[0]?.contact1Relation || "",
          contact1Address: profileData.emergencyContacts?.[0]?.contact1Address || "",
          contact1Alternate: profileData.emergencyContacts?.[0]?.contact1Alternate || "",
          // Initialize optional contact 2 fields
          contact2Name: "",
          contact2Number: "",
          contact2Relation: "",
          contact2Address: ""
        },
        qualifications: parsedQualifications.length > 0 
          ? parsedQualifications 
          : [{ id: Date.now(), degreeType: "", specialization: "", year: "", percentage: "", institute: "" }],
        experiences: parsedExperiences.length > 0 
          ? parsedExperiences 
          : [{ id: Date.now(), company: "", designation: "", start: "", end: "", reasonForLeaving: "", referenceContact: "" }],
        bankDetails: {
          bankName: profileData.bankDetails?.bankName || "",
          accountNumber: profileData.bankDetails?.accountNumber || "",
          ifsc: profileData.bankDetails?.ifsc || "",
          branch: profileData.bankDetails?.branch || "",
          accountType: profileData.bankDetails?.accountType || ""
        }
      });
      setDocuments({
        adharCardDocument: profileData.adharCardDocument || "",
        panCardDocument: profileData.panCardDocument || "",
        bankPassbook: profileData.bankPassbook || "",
        resume: profileData.resume || "",
        offerLetter: profileData.offerLetter || ""
      });
      
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.message.includes("Unauthorized") || error.message.includes("No token found")) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
      } else {
        toast.error("Failed to load profile data: " + error.message);
      }
    }
  };

  fetchProfileData();
  

}, [navigate]);
  

  const validateAll = () => {
    const { employeeOverview, emergencyContacts, qualifications, bankDetails } = formData;

    const reqEmp = [
      "fullName",
      "dob",
      "fatherName",
      "permanentAddress",
      "localAddress",
      "aadhar",
      "phone",
      "gender",
      "maritalStatus",
      "nationality",
      "epfNumber"
    ];
    let empValid = reqEmp.every((field) => employeeOverview[field]);
    let emergValid = emergencyContacts.contact1Name && emergencyContacts.contact1Number;
    let qualValid = qualifications.length > 0 && qualifications[0].degreeType.trim() !== "";
    const ifscPattern = /^[A-Z]{4}0[0-9]{6}$/;
    let bankValid =
      bankDetails.bankName &&
      bankDetails.accountNumber &&
      bankDetails.ifsc &&
      ifscPattern.test(bankDetails.ifsc) &&
      bankDetails.branch &&
      bankDetails.accountType;

    if (!empValid) toast.error("Please complete Basic Information.");
    if (!emergValid) toast.error("Please provide at least one emergency contact (Contact 1).");
    if (!qualValid) toast.error("Please add at least one qualification with Degree Type filled.");
    if (!bankValid) toast.error("Please complete Bank Details correctly.");
    return empValid && emergValid && qualValid && bankValid;
  };

  const handleGlobalSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        throw new Error("Authentication required. Please log in again.");
      }

      // Prepare the profile data according to the API format
      const profileData = {
        id: userId,
        firstName: formData.employeeOverview.fullName || "",
        email: formData.employeeOverview.email || "",
        fathersName: formData.employeeOverview.fatherName || "",
        spouseName: formData.employeeOverview.spouseName || "",
        permanentAddress: formData.employeeOverview.permanentAddress || "",
        localAddress: formData.employeeOverview.localAddress || "",
        aadharNumber: formData.employeeOverview.aadhar || "",
        mobileNumber: formData.employeeOverview.phone || "",
        panCard: formData.employeeOverview.pan || "",
        qualification: formData.qualifications[0]?.degreeType || "",
        uanNumber: formData.employeeOverview.epfNumber || "",
        
        emergencyContacts: [
          {
            name: formData.emergencyContacts.contact1Name || "",
            number: formData.emergencyContacts.contact1Number || "",
            contact1Alternate: formData.emergencyContacts.contact1Alternate || "",
            contact1Relation: formData.emergencyContacts.contact1Relation || "",
            contact1Address: formData.emergencyContacts.contact1Address || ""
          }
        ],
        bankDetails: {
          accountNumber: formData.bankDetails.accountNumber || "",
          bankName: formData.bankDetails.bankName || "",
          ifsc: formData.bankDetails.ifsc || "",
          branch: formData.bankDetails.branch || "",
          accountType: formData.bankDetails.accountType || ""
        },
        employeeCode: userId,
        esiNumber: formData.employeeOverview.esiNumber || "",
        teamAllocated: "",
        salary: "",
        epfDeduction: "",
        insurance: "",
        tdsDeduction: "",
        insuranceDetails: "",
        bonus: "",
        othersStatutory: "",
        shiftAllocated: "",
        breakTime: "",
        gpsLocation: "",
        dob: formData.employeeOverview.dob || "",
        gender : formData.employeeOverview.gender || "",
       
        maritalStatus: formData.employeeOverview.maritalStatus || "",
        nationality: formData.employeeOverview.nationality || "",
        bloodGroup: formData.employeeOverview.bloodGroup || "",
        religion: formData.employeeOverview.religion || "",
        qualifications: JSON.stringify(formData.qualifications) || "",
        experiences: JSON.stringify(formData.experiences) || "",
        adharCardDocument: documents.adharCardDocument,
        panCardDocument: documents.panCardDocument,
        bankPassbook: documents.bankPassbook,
        resume: documents.resume,
        offerLetter: documents.offerLetter,
        
       
      };

      console.log("Sending profile data:", JSON.stringify(profileData, null, 2));

      // Update the profile
      const response = await updateUserProfile(token, profileData);
      
      if (response) {
        toast.success("Profile updated successfully!");
        // Update the form data with the response
        setFormData({
          employeeOverview: {
            fullName: response.firstName || "",
            email: response.email || "",
            fatherName: response.fathersName || "",
            spouseName: response.spouseName || "",
            permanentAddress: response.permanentAddress || "",
            localAddress: response.localAddress || "",
            aadhar: response.aadharNumber || "",
            phone: response.mobileNumber || "",
            pan: response.panCard || "",
            epfNumber: response.uanNumber || "",
            esiNumber: response.esiNumber || "",
            dob: response.dob || "",
            gender: response.gender|| "",
            maritalStatus: response.maritalStatus || "",
            nationality: response.nationality || "",
            bloodGroup: response.bloodGroup || "",
            religion: response.religion || ""
          },
          emergencyContacts: {
            contact1Name: response.emergencyContacts?.[0]?.name || "",
            contact1Number: response.emergencyContacts?.[0]?.number || "",
            contact1Relation: response.emergencyContacts?.[0]?.contact1Relation || "",
            contact1Address: response.emergencyContacts?.[0]?.contact1Address || "",
            contact1Alternate: response.emergencyContacts?.[0]?.contact1Alternate || "",
          },
          qualifications: response.qualifications ? JSON.parse(response.qualifications) : [],
          experiences: response.experiences ? JSON.parse(response.experiences) : [],
          bankDetails: {
            accountNumber: response.bankDetails?.accountNumber || "",
            bankName: response.bankDetails?.bankName || "",
            ifsc: response.bankDetails?.ifsc || "",
            branch: response.bankDetails?.branch || "",
            accountType: response.bankDetails?.accountType || ""

          }
        });
        setDocuments({
          adharCardDocument: profileData.adharCardDocument || "",
          panCardDocument: profileData.panCardDocument || "",
          bankPassbook: profileData.bankPassbook || "",
          resume: profileData.resume || "",
          offerLetter: profileData.offerLetter || ""
        });

        setIsFirstTime(false);
  setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      if (error.message.includes("Unauthorized")) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
      }
      toast.error(error.message || "Failed to update profile");
    }
  };

  // Update form data handlers
  const updateEmployeeOverview = (data) => {
    setFormData(prev => ({
      ...prev,
      employeeOverview: { ...prev.employeeOverview, ...data }
    }));
  };

  const updateEmergencyContacts = (data) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: { ...prev.emergencyContacts, ...data }
    }));
  };

  const updateQualifications = (data) => {
    setFormData(prev => ({
      ...prev,
      qualifications: data
    }));
  };

  const updateExperiences = (data) => {
    setFormData(prev => ({
      ...prev,
      experiences: data
    }));
  };

  const updateBankDetails = (data) => {
    setFormData(prev => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, ...data }
    }));
  };


  return (

    <div className={`flex min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800"}`}>
      <Toaster position="top-right" />
      
      <main className={`w-full flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto space-y-6 sm:space-y-8 lg:space-y-10 ${darkMode ? "bg-gray-900 text-white" : ""}`}>
        <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold pb-3 sm:pb-4 border-b ${darkMode ? "border-gray-700" : "border-gray-300"} bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500`}>
          Employee Profile
        </h1>
  
        <ProgressTracker darkMode={darkMode} formData={formData} />

        <WarningSection formData={formData} darkMode={darkMode} />
        <EmployeeOverview 
          isLocked={isSubmitted} 
          data={formData.employeeOverview}
          onChange={updateEmployeeOverview}
          darkMode={darkMode}
          initialEditMode={isFirstTime}
          
        />
        <EmergencyContacts 
          isLocked={isSubmitted}
          data={formData.emergencyContacts}
          onChange={updateEmergencyContacts}
          darkMode={darkMode}
          initialEditMode={isFirstTime}
        />
        <QualificationsCard 
          isLocked={isSubmitted}
          data={formData.qualifications}
          onChange={updateQualifications}
          darkMode={darkMode}
          initialEditMode={isFirstTime}
        />
        <ExperienceCard 
          isLocked={isSubmitted}
          data={formData.experiences}
          onChange={updateExperiences}
          darkMode={darkMode}
          initialEditMode={isFirstTime}
        />
        <BankDetails 
          isLocked={isSubmitted}
          data={formData.bankDetails}
          onChange={updateBankDetails}
          darkMode={darkMode}
          initialEditMode={isFirstTime}
        />
        
        <DocumentUploads 
          onDocumentUpload={(field, data) => setDocuments(prev => ({ ...prev, [field]: data }))}
          documents={documents}
          darkMode={darkMode}
          initialEditMode={isFirstTime}
        />
  
        <ProfilePhotoUpload darkMode={darkMode} initialEditMode={isFirstTime} />
        <CompanyDetails darkMode={darkMode} />
  
        <div className="flex justify-center px-4">
          {isSubmitted ? (
            <button
              onClick={() => {
                setIsSubmitted(false);
                toast("Your changes will be notified to the employer.");
              }}
              className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 sm:px-6 py-2 sm:py-3 !rounded-lg font-semibold shadow-md transition text-sm sm:text-base w-full sm:w-auto"
            >
              Request Edit
            </button>
          ) : (
            <button
              onClick={handleGlobalSubmit}
              disabled={isLoading}
              className={`mt-4 ${
                isLoading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-green-500 hover:bg-green-600"
              } text-white px-4 sm:px-6 py-2 sm:py-3 !rounded-lg font-semibold shadow-md transition text-sm sm:text-base w-full sm:w-auto`}
            >
              {isLoading ? "Saving..." : "Submit All Details"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}  

export default Profile;