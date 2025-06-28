import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:5000/login", {
        username,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem("user_id", response.data.user_id);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err.response?.data);
      alert(err.response?.data?.error || "Invalid username or password.");
    }
  };

  return (
    <PageWrapper>
      <FormWrapper onSubmit={handleSubmit}>
        <Title>Login</Title>
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoFocus
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <SubmitButton type="submit">Login</SubmitButton>
      </FormWrapper>
    </PageWrapper>
  );
}

export default Login;

const PageWrapper = styled.div`
  height: 100vh;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Arial, sans-serif;
`;

const FormWrapper = styled.form`
  background-color: #f7f3ff;
  padding: 30px 25px;
  border-radius: 10px;
  box-shadow: 0 0 10px #b3a7e6;
  width: 320px;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  color: #6b5b9a;
  text-align: center;
`;

const Input = styled.input`
  padding: 12px 14px;
  margin-bottom: 18px;
  border: 1.5px solid #b3a7e6;
  border-radius: 6px;
  font-size: 1rem;
  &:focus {
    outline-color: #6b5b9a;
    border-color: #6b5b9a;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 0;
  background-color: #6b5b9a;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #574a7d;
  }
`;
