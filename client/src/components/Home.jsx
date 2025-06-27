import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <Card>
        <Title>Welcome to Habit Tracker</Title>
        <Subtext>Stay consistent. Build your streaks.</Subtext>
        <ButtonContainer>
          <StyledButton onClick={() => navigate('/login')}>Login</StyledButton>
          <StyledButton onClick={() => navigate('/register')} secondary>
            Register
          </StyledButton>
        </ButtonContainer>
      </Card>
    </PageWrapper>
  );
};

export default Home;

const PageWrapper = styled.div`
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.color};
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Card = styled.div`
  background: ${({ theme }) =>
    theme.isDark
      ? 'linear-gradient(145deg, #1e1e1e, #2a2a2a)'
      : 'linear-gradient(145deg, #f0f0f0, #e0e0e0)'};
  padding: 40px;
  border-radius: 20px;
  box-shadow: ${({ theme }) =>
    theme.isDark
      ? '0 0 20px rgba(0, 123, 255, 0.4)'
      : '0 0 20px rgba(0, 0, 0, 0.1)'};
  text-align: center;
  width: 400px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Subtext = styled.p`
  font-size: 16px;
  color: ${({ theme }) => (theme.isDark ? '#cccccc' : '#555')};
  margin-bottom: 30px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-around;
`;

const StyledButton = styled.button`
  background-color: ${({ secondary }) => (secondary ? '#28a745' : '#007bff')};
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background-color: ${({ secondary }) =>
      secondary ? '#218838' : '#0056b3'};
  }
`;
