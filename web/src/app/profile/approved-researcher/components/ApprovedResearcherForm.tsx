"use client";

import { useState } from "react";

import "./ApprovedResearcherForm.css";

export default function ApprovedResearcherForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userID: "",
    department: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSubmitted(true);
  };

  return (
    <div className="form-container">
      <h1 className="form-title">User Info Form</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="input-field"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="input-field"
          required
        />

        <input
          type="text"
          name="userID"
          placeholder="User ID"
          value={formData.userID}
          onChange={handleChange}
          className="input-field"
          required
        />

        <input
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleChange}
          className="input-field"
          required
        />

        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>

      {submitted && (
        <div className="submitted-box">
          <p>Form submitted! Here`&apos;`s the data:</p>

          <pre>{JSON.stringify(formData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
