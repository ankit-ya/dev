import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Bell } from 'react-feather';
import { fetchCheckInCheckOutData } from "../API/apiService";

const dummyData = [
  {
    "S.No": 1,
    userName: "john_doe",
    position: "Software Engineer",
    Name: "John Doe",
    Location: "New York",
    "Shift timing": "9 AM - 6 PM",
    checkIn: "09:05 AM",
    checkOut: "06:15 PM",
  },
  {
    "S.No": 2,
    userName: "jane_smith",
    position: "Product Manager",
    Name: "Jane Smith",
    Location: "San Francisco",
    "Shift timing": "10 AM - 7 PM",
    checkIn: "10:10 AM",
    checkOut: "07:05 PM",
  },
  {
    "S.No": 3,
    userName: "robert_brown",
    position: "UI/UX Designer",
    Name: "Robert Brown",
    Location: "Chicago",
    "Shift timing": "8 AM - 5 PM",
    checkIn: "08:00 AM",
    checkOut: "05:10 PM",
  },
];

const TeamAllocation = () => {
  const [tableData, setTableData] = useState(dummyData);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setTableData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    fetchCheckInCheckOutData()
      .then((data) => {
        const updatedTableData = tableData.map((row) => {
          const userData = data.find((d) => d.userName === row.userName);
          return userData
            ? { ...row, checkIn: userData.checkInTime, checkOut: userData.checkOutTime }
            : row;
        });
        setTableData(updatedTableData);
      })
      .catch((error) => {
        console.error("Error fetching check-in/check-out data:", error);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
     

      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-3">
            <label className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
              Upload Excel
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
              Export Report
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              <div className="grid grid-cols-8 gap-4 p-4 border-b border-gray-200 font-medium">
                <div>S.No</div>
                <div>Name</div>
                <div>Position</div>
                <div>Location</div>
                <div>Shift Timing</div>
                <div>Check In</div>
                <div>Check Out</div>
                <div>Actions</div>
              </div>

              {tableData.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-8 gap-4 p-4 border-b border-gray-200 items-center hover:bg-gray-50"
                >
                  <div>{row["S.No"]}</div>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 mr-3"></div>
                    <span>{row.Name}</span>
                  </div>
                  <div>{row.position}</div>
                  <div>{row.Location}</div>
                  <div>{row["Shift timing"]}</div>
                  <div>{row.checkIn || '--:--'}</div>
                  <div>{row.checkOut || '--:--'}</div>
                  <div>
                    <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamAllocation;
