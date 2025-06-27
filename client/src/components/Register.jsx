import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("http://127.0.0.1:5000/register", {
      username,
      password,
    });

    const userId = res.data.user_id;
    localStorage.setItem("user_id", userId); // ✅ save numeric user_id
    alert("Registration successful!");
    navigate("/dashboard"); // ✅ go to dashboard after register
  } catch (err) {
    console.error("Registration failed:", err.response?.data);
    alert(err.response?.data?.error || "Registration error.");
  }
};


  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow">
        <h2 className="text-lg font-bold mb-4">Register</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
