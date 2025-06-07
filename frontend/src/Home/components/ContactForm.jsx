import React, { useState } from "react";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    contact: "",
    email: "",
    remark: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform form validation or API submission here
    console.log("Form submitted:", formData);
  };

  return (
    <div className="flex flex-col md:flex-row bg-gray-100 min-h-screen p-10 font-sans">
      {/* Left Section */}
      <div className="md:w-1/2 mb-10 md:mb-0">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          We’d love to <br /> hear from you
        </h2>
        <p className="text-gray-700">
          Share with us your business requirements and learn how our solutions
          can help you attain better business outcomes
        </p>
        <div className="w-16 h-1 bg-orange-500 mt-4"></div>
      </div>

      {/* Right Section */}
      <form
        onSubmit={handleSubmit}
        className="md:w-1/2 bg-white p-8 rounded-lg shadow-md"
      >
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Name (*)"
            value={formData.name}
            onChange={handleChange}
            required
            className="border p-3 rounded-md"
          />
          <input
            type="text"
            name="companyName"
            placeholder="Company Name (*)"
            value={formData.companyName}
            onChange={handleChange}
            required
            className="border p-3 rounded-md"
          />
          <input
            type="text"
            name="contact"
            placeholder="Mobile Number (*)"
            value={formData.contact}
            onChange={handleChange}
            required
            className="border p-3 rounded-md"
          />
          <input
            type="email"
            name="email"
            placeholder="Email ID (Optional)"
            value={formData.email}
            onChange={handleChange}
            className="border p-3 rounded-md"
          />
          <textarea
            name="remark"
            placeholder="Remark (*)"
            value={formData.remark}
            onChange={handleChange}
            required
            rows="4"
            className="border p-3 rounded-md resize-none mb-4"
            
          ></textarea>
        </div>

        <button
          type="submit"
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-semibold"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
