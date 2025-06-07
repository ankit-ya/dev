import React, { useState } from "react";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../components/ui/select";
import { Card, CardContent } from "../components/ui/card";
import Button from "../components/ui/button";

const SalaryCalculator = () => {
  const [salaryType, setSalaryType] = useState("monthly");
  const [basicSalary, setBasicSalary] = useState("");
  const [epfOption, setEpfOption] = useState("fixed");
  const [customEPFBase, setCustomEPFBase] = useState("");
  const [esiOption, setEsiOption] = useState("fixed");
  const [earnings, setEarnings] = useState({
    hra: "",
    da: "",
    conveyance: "",
    medical: "",
    special: "",
    lta: "",
    bonus: "",
    overtime: "",
    incentives: "",
    commission: "",
    other: { label: "", value: "" },
  });
  const [deductions, setDeductions] = useState({
    professionalTax: "",
    lwf: "",
    tds: "",
    loanRecovery: "",
    salaryAdvance: "",
    leaveDeductions: "",
    insurance: "",
    otherDeductions: { label: "", value: "" },
  });

  // Calculate Gross Salary
  const grossSalary =
    (parseFloat(basicSalary) || 0) +
    Object.values(earnings)
      .reduce((acc, val) => acc + (typeof val === "object" ? parseFloat(val.value) || 0 : parseFloat(val) || 0), 0);

  // Calculate EPF based on selected option
  let calculatedEPF = 0;
  if (epfOption === "fixed") {
    calculatedEPF = (basicSalary >= 15000 ? basicSalary : 0) * 0.12;
  } else if (epfOption === "full") {
    calculatedEPF = basicSalary * 0.12;
  } else if (epfOption === "customAmount" && customEPFBase) {
    calculatedEPF = customEPFBase * 0.12;
  }

  // Calculate ESI based on selected option
  let calculatedESI = 0;
  if (esiOption === "fixed") {
    calculatedESI = (basicSalary >= 21000 ? basicSalary : 0) * 0.0075;
  } else if (esiOption === "full") {
    calculatedESI = basicSalary * 0.0075;
  }

  // Calculate Total Deductions
  const totalDeductions =
    calculatedEPF +
    calculatedESI +
    Object.values(deductions)
      .reduce((acc, val) => acc + (typeof val === "object" ? parseFloat(val.value) || 0 : parseFloat(val) || 0), 0);

  // Calculate Net Salary
  const netSalary = grossSalary - totalDeductions;

  // Handle input change and prevent negative values
  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    if (value >= 0) {
      setter(value);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Salary Calculator</h2>
      </div>

      {/* Scrollable Content */}
      <div className="relative h-[calc(100vh-73px)] overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent !pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
          {/* Salary Type Selection */}
          <div className="space-y-2 sm:space-y-3">
            <label className="text-sm sm:text-base font-medium text-gray-600">Salary Type</label>
            <Select onValueChange={setSalaryType} value={salaryType}>
              <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                <SelectValue placeholder="Select Salary Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly" className="text-sm sm:text-base">Monthly Salary</SelectItem>
                <SelectItem value="per-day" className="text-sm sm:text-base">Per Day Salary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Earnings Section */}
          <Card className="border border-gray-200">
            <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700">Earnings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-medium text-gray-600">Basic Salary *</label>
                  <Input
                    type="number"
                    placeholder="Enter Basic Salary"
                    value={basicSalary}
                    onChange={handleInputChange(setBasicSalary)}
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>
                {Object.entries(earnings).map(([key, value]) =>
                  key !== "other" ? (
                    <div key={key} className="space-y-2">
                      <label className="text-sm sm:text-base font-medium text-gray-600">
                        {key.toUpperCase().replace("_", " ")}
                      </label>
                      <Input
                        type="number"
                        placeholder={`Enter ${key.toUpperCase()}`}
                        value={value}
                        onChange={handleInputChange((val) => setEarnings({ ...earnings, [key]: val }))}
                        className="h-10 sm:h-11 text-sm sm:text-base"
                      />
                    </div>
                  ) : (
                    <React.Fragment key={key}>
                      <div className="space-y-2">
                        <label className="text-sm sm:text-base font-medium text-gray-600">Other Earning Name</label>
                        <Input
                          placeholder="Enter Name"
                          value={value.label}
                          onChange={(e) => setEarnings({ ...earnings, other: { ...value, label: e.target.value } })}
                          className="h-10 sm:h-11 text-sm sm:text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm sm:text-base font-medium text-gray-600">Other Earning Amount</label>
                        <Input
                          type="number"
                          placeholder="Enter Amount"
                          value={value.value}
                          onChange={handleInputChange((val) => setEarnings({ ...earnings, other: { ...value, value: val } }))}
                          className="h-10 sm:h-11 text-sm sm:text-base"
                        />
                      </div>
                    </React.Fragment>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* EPF Options */}
          <Card className="border border-gray-200">
            <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700">EPF Options</h3>
              <div className="space-y-4">
                <label className="text-sm sm:text-base font-medium text-gray-600">Select EPF Deduction Option</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { value: "fixed", label: "Deduct 12% of Basic Salary (if >= 15,000)" },
                    { value: "full", label: "Deduct 12% of Full Basic Salary" },
                    { value: "customAmount", label: "Custom EPF Amount" },
                    { value: "none", label: "No Deduction for EPF" }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="epfOption"
                        value={option.value}
                        checked={epfOption === option.value}
                        onChange={(e) => setEpfOption(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm sm:text-base text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
                {epfOption === "customAmount" && (
                  <div className="space-y-2">
                    <label className="text-sm sm:text-base font-medium text-gray-600">Custom EPF Base Amount</label>
                    <Input
                      type="number"
                      placeholder="Enter Custom EPF Base"
                      value={customEPFBase}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value >= 0 && value <= basicSalary) {
                          setCustomEPFBase(value);
                        }
                      }}
                      className="h-10 sm:h-11 text-sm sm:text-base"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ESI Options */}
          <Card className="border border-gray-200">
            <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700">ESI Options</h3>
              <div className="space-y-4">
                <label className="text-sm sm:text-base font-medium text-gray-600">Select ESI Deduction Option</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { value: "fixed", label: "Deduct 0.75% of Basic Salary (if >= 21,000)" },
                    { value: "full", label: "Deduct 0.75% of Full Basic Salary" },
                    { value: "none", label: "No Deduction for ESI" }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="esiOption"
                        value={option.value}
                        checked={esiOption === option.value}
                        onChange={(e) => setEsiOption(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm sm:text-base text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deductions Section */}
          <Card className="border border-gray-200">
            <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700">Deductions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-medium text-gray-600">EPF (12% of Basic Salary)</label>
                  <Input
                    type="number"
                    value={calculatedEPF.toFixed(2)}
                    disabled
                    className="h-10 sm:h-11 text-sm sm:text-base bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-medium text-gray-600">ESI (0.75% of Basic Salary)</label>
                  <Input
                    type="number"
                    value={calculatedESI.toFixed(2)}
                    disabled
                    className="h-10 sm:h-11 text-sm sm:text-base bg-gray-50"
                  />
                </div>
                {Object.entries(deductions).map(([key, value]) =>
                  key !== "otherDeductions" ? (
                    <div key={key} className="space-y-2">
                      <label className="text-sm sm:text-base font-medium text-gray-600">
                        {key.toUpperCase().replace("_", " ")}
                      </label>
                      <Input
                        type="number"
                        placeholder={`Enter ${key.toUpperCase()}`}
                        value={value}
                        onChange={handleInputChange((val) => setDeductions({ ...deductions, [key]: val }))}
                        className="h-10 sm:h-11 text-sm sm:text-base"
                      />
                    </div>
                  ) : (
                    <React.Fragment key={key}>
                      <div className="space-y-2">
                        <label className="text-sm sm:text-base font-medium text-gray-600">Other Deduction Name</label>
                        <Input
                          placeholder="Enter Name"
                          value={value.label}
                          onChange={(e) => setDeductions({ ...deductions, otherDeductions: { ...value, label: e.target.value } })}
                          className="h-10 sm:h-11 text-sm sm:text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm sm:text-base font-medium text-gray-600">Other Deduction Amount</label>
                        <Input
                          type="number"
                          placeholder="Enter Amount"
                          value={value.value}
                          onChange={handleInputChange((val) => setDeductions({ ...deductions, otherDeductions: { ...value, value: val } }))}
                          className="h-10 sm:h-11 text-sm sm:text-base"
                        />
                      </div>
                    </React.Fragment>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Section */}
          <Card className="border border-blue-200">
            <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4">
              <h4 className="text-base sm:text-lg lg:text-xl font-semibold text-blue-600">Salary Summary</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm sm:text-base text-gray-600">Gross Salary</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">₹{grossSalary.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm sm:text-base text-gray-600">Total Deductions</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">₹{totalDeductions.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm sm:text-base text-blue-600">Net Salary</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-800">₹{netSalary.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculator;