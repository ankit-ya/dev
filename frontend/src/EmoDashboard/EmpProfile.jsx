import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { ChevronDown, ChevronRight, Trash2, PlusCircle } from "lucide-react";
import { getEmployerProfile, updateEmployerProfile } from "../API/apiService";

export default function EmployerProfile() {
  const [formData, setFormData] = useState({
    name: "",
    employerId: "",
    employeeSize: "",
    number: "",
    companyName: "",
    email: "",
    phone: "",
    contactPerson: "",
    signatoryPhonenumber: "",
    headOfficeAddress: "",
    companyType: "",
    gstnumber: "",
    epfnumber: "",
    esicnumber: "",
    companyLogo: null,
    registrationCertificate: null,
    locations: [{ address: "", city: "", state: "", pincode: "" }],
    bankDetails: [{ bankName: "", accountNumber: "", ifsccode: "" }],
    departments: [{ name: "", teams: [{ name: "" }] }],
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expanded, setExpanded] = useState({
    basic: true,
    company: true,
    regulatory: true,
    files: true,
    locations: true,
    bank: true,
    dept: true,
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
  
        const res = await getEmployerProfile(token);
  
        if (res) {
          setFormData((prev) => ({
            ...prev,
            ...res,
            employerId: userId || res.employerId || "", // ✅ ensures it fills from localStorage
            departments: Array.isArray(res.departments) ? res.departments : [{ name: "", teams: [{ name: "" }] }],
            locations: Array.isArray(res.locations) ? res.locations : [{ address: "", city: "", state: "", pincode: "" }],
            bankDetails: Array.isArray(res.bankDetails) ? res.bankDetails : [{ bankName: "", accountNumber: "", ifsccode: "" }],
          }));
        } else if (userId) {
          // No profile returned, but we have employerId from localStorage
          setFormData((prev) => ({
            ...prev,
            employerId: userId
          }));
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
  
    loadProfile();
  }, []);
  
  
    

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateFields()) {
        Swal.fire({
          icon: "error",
          title: "Please correct the errors.",
          timer: 2000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
        return;
      }
    
      try {
        setIsSaving(true);
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        console.log("userID:" , userId);
     
      const {
  employerId, // exclude this from the payload
  ...restFormData
} = formData;

const payload = {
  ...restFormData,
  id: employerId, // use employerId where needed
  userId: userId || employerId,
};

    
        if (payload.companyLogo instanceof File) {
          payload.companyLogo = await toBase64(payload.companyLogo);
        }
        if (payload.registrationCertificate instanceof File) {
          payload.registrationCertificate = await toBase64(payload.registrationCertificate);
        }
    
        console.log("Final Payload for submission:", payload);
    
        await updateEmployerProfile(token, payload);
        setSubmitted(true);
        Swal.fire({
          icon: "success",
          title: "Profile Saved",
          timer: 2000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Save failed:", error);
        Swal.fire({
          icon: "error",
          title: "Failed to save.",
          timer: 2000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      } finally {
        setIsSaving(false);
      }
    };
    

  const toggleCard = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const requiredFields = ["companyName", "email", "phone", "contactPerson", "signatoryPhonenumber", "headOfficeAddress", "companyType"];

  const validateFields = () => {
    const newErrors = {};
    requiredFields.forEach((field) => {
      if (!formData[field]?.trim()) newErrors[field] = "This field is required";
    });
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) newErrors.phone = "Phone must be 10 digits";
    if (formData.signatoryPhonenumber && !/^\d{10}$/.test(formData.signatoryPhonenumber)) newErrors.signatoryPhonenumber = "Phone must be 10 digits";
    if (formData.gstnumber && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstnumber)) newErrors.gstnumber = "Invalid GST number format";
    if (formData.epfnumber && !/^[A-Z]{2}\/\d{5}\/\d{7}$/.test(formData.epfnumber)) newErrors.epfnumber = "Invalid EPF number format";
    if (formData.esicnumber && !/^\d{17}$/.test(formData.esicnumber)) newErrors.esicnumber = "Invalid ESIC number format";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e, section, index, key) => {
    const { name, value, files } = e.target;
    if (section !== undefined && index !== undefined && key !== undefined) {
      const updated = [...formData[section]];
      updated[index][key] = value;
      setFormData((prev) => ({ ...prev, [section]: updated }));
      return;
    }
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const renderInput = (field, label, type = "text") => (
    <div className="flex flex-col">
      <label className="font-medium mb-1">
        {label}{requiredFields.includes(field) && <span className="text-red-500"> *</span>}
      </label>
      <input
        type={type}
        name={field}
        value={type !== "file" ? formData[field] || "" : undefined}
        onChange={handleChange}
        disabled={submitted}
        className={`border px-3 py-2 rounded-md transition-colors duration-300 focus:outline-none ${
          errors[field] ? "border-red-500" : "border-gray-300"
        }`}
      />
      {errors[field] && <p className="text-sm text-red-500 mt-1">{errors[field]}</p>}
    </div>
  );

  const addSectionEntry = (section, defaultObj) => {
    const current = Array.isArray(formData[section]) ? formData[section] : [];
    setFormData({ ...formData, [section]: [...current, defaultObj] });
  };

  const removeSectionEntry = (section, index) => {
    const updated = formData[section].filter((_, i) => i !== index);
    setFormData({ ...formData, [section]: updated });
  };

  const renderDynamicFields = (section, fields, labels) => (
    <>
      {Array.isArray(formData[section]) && formData[section].length > 0 && (
        <table className="min-w-full border mb-4 table-auto">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {labels.map((label, i) => (
                <th key={i} className="p-2 border">{label}</th>
              ))}
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {formData[section].map((item, index) => (
              <tr key={index} className="odd:bg-white even:bg-gray-50">
                {fields.map((field, i) => (
                  <td key={i} className="border px-2 py-1">
                    <input
                      type="text"
                      value={item[field]}
                      placeholder={labels[i]}
                      onChange={(e) => handleChange(e, section, index, field)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                    />
                  </td>
                ))}
                <td className="text-center">
                  <button onClick={() => removeSectionEntry(section, index)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button
        type="button"
        onClick={() => addSectionEntry(section, Object.fromEntries(fields.map((f) => [f, ""])))}
        className="flex items-center gap-2 text-blue-600 hover:underline"
      >
        <PlusCircle size={18} /> Add {section.slice(0, -1)}
      </button>
    </>
  );

  const handleChangeDepartmentName = (e, deptIndex) => {
    const updated = [...formData.departments];
    updated[deptIndex].name = e.target.value;
    setFormData((prev) => ({ ...prev, departments: updated }));
  };

  const handleChangeTeamName = (e, deptIndex, teamIndex) => {
    const updated = [...formData.departments];
    updated[deptIndex].teams[teamIndex].name = e.target.value;
    setFormData((prev) => ({ ...prev, departments: updated }));
  };

  const addTeam = (deptIndex) => {
    const updated = [...formData.departments];
    updated[deptIndex].teams.push({ name: "" });
    setFormData((prev) => ({ ...prev, departments: updated }));
  };

  const removeTeam = (deptIndex, teamIndex) => {
    const updated = [...formData.departments];
    updated[deptIndex].teams.splice(teamIndex, 1);
    setFormData((prev) => ({ ...prev, departments: updated }));
  };

  const renderDepartments = () => (
    <>
      {formData.departments.map((dept, deptIndex) => (
        <div key={deptIndex} className="border rounded p-4 mb-4 bg-white shadow-sm">
          <input
            type="text"
            value={dept.name}
            placeholder="Department Name"
            onChange={(e) => handleChangeDepartmentName(e, deptIndex)}
            className="border p-2 mb-3 rounded w-full"
          />
          {dept.teams.map((team, teamIndex) => (
            <div key={teamIndex} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={team.name}
                placeholder="Team Name"
                onChange={(e) => handleChangeTeamName(e, deptIndex, teamIndex)}
                className="border p-2 rounded w-full"
              />
              <button type="button" onClick={() => removeTeam(deptIndex, teamIndex)} className="text-red-500 hover:text-red-700">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addTeam(deptIndex)} className="flex items-center gap-1 text-blue-600 hover:underline">
            <PlusCircle size={16} /> Add Team
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => addSectionEntry('departments', { name: "", teams: [{ name: "" }] })}
        className="flex items-center gap-2 text-blue-600 hover:underline"
      >
        <PlusCircle size={18} /> Add Department
      </button>
    </>
  );

  const renderCard = (key, title, content) => (
    <div className="bg-white border rounded shadow-sm mb-4">
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50" onClick={() => toggleCard(key)}>
        <h2 className="text-xl font-semibold">{title}</h2>
        {expanded[key] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </div>
      {expanded[key] && <div className="px-4 pb-4 space-y-4">{content}</div>}
    </div>
  );

  return (
    <div className="max-w mx-auto p-4 pb-8 pr-6 bg-gray-50 shadow-lg rounded-md space-y-6 h-screen overflow-y-auto">
      <h1 className="text-3xl font-bold ">Employer Profile</h1>

      <form onSubmit={handleSubmit} className="min-h-screen pb-10 ">
        {renderCard("basic", "Basic Details", (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput("name", "Name")}
            <div className="flex flex-col">
              <label className="font-medium mb-1">Employer ID</label>
              <input type="text" value={formData.employerId} disabled className="border px-3 py-2 rounded-md bg-gray-100 text-gray-600" />
            </div>
            <div className="flex flex-col">
              <label className="font-medium mb-1">Employee Size</label>
              <input type="text" name="employeeSize" value={formData.employeeSize} onChange={handleChange} className="border px-3 py-2 rounded-md focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex flex-col">
              <label className="font-medium mb-1">Contact Number</label>
              <input type="text" value={formData.number} disabled className="border px-3 py-2 rounded-md bg-gray-100 text-gray-600" />
            </div>
          </div>
        ))}

        {renderCard("company", "Company Details", (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput("companyName", "Company Name")}
            {renderInput("email", "Email", "email")}
            {renderInput("phone", "Phone")}
            {renderInput("contactPerson", "Contact Person")}
            {renderInput("signatoryPhonenumber", "Signatory Phone")}
            {renderInput("headOfficeAddress", "Head Office Address")}
            {renderInput("companyType", "Company Type")}
          </div>
        ))}

        {renderCard("regulatory", "Regulatory Numbers", (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput("gstnumber", "GST Number")}
            {renderInput("epfnumber", "EPF Number")}
            {renderInput("esicnumber", "ESIC Number")}
          </div>
        ))}

        {renderCard("files", "Company Files", (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput("companyLogo", "Company Logo", "file")}
            {renderInput("registrationCertificate", "Registration Certificate", "file")}
          </div>
        ))}

        {renderCard("locations", "Branch Locations", renderDynamicFields("locations", ["address", "city", "state", "pincode"], ["Address", "City", "State", "Pincode"]))}
        {renderCard("bank", "Bank Details", renderDynamicFields("bankDetails", ["bankName", "accountNumber", "ifsccode"], ["Bank Name", "Account Number", "IFSC Code"]))}
        {renderCard("dept", "Departments", renderDepartments())}

        <div className="flex justify-end mt-6">
          <button type="submit" disabled={submitted || isSaving} className={`px-6 py-2 pr-7 rounded text-white ${submitted ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"} disabled:opacity-50`}>
            {isSaving ? "Saving..." : submitted ? "Submitted" : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
