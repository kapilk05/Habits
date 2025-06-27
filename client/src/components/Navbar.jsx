import React, { useContext, useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '../components/ThemeContext';
import { AuthContext } from '../components/AuthContext';
import Switch from '../Switch';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { user, setUser } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Nav>
      <Logo href="/">CF Progress Pulse</Logo>
      <NavRight>
        {!user ? (
          <GetStartedButton href="/login" isDark={isDark}>
            Get Started
          </GetStartedButton>
        ) : (
          <ProfileWrapper ref={dropdownRef}>
            <ProfileImage
              src={user.avatarUrl || 'https://i.pravatar.cc/40'}
              alt="Profile"
              onClick={() => setShowDropdown(!showDropdown)}
              title={user.name || 'User'}
            />
            {showDropdown && (
              <DropdownMenu isDark={isDark}>
                <DropdownItem
                  isDark={isDark}
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/profile');
                  }}
                >
                  View Profile
                </DropdownItem>
                <DropdownItem
                  isDark={isDark}
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/resume');
                  }}
                >
                  View Resume
                </DropdownItem>
                <DropdownItem
  isDark={isDark}
  onClick={() => {
    setShowDropdown(false);
    navigate('/profile');  // Navigates to Profile page on click
  }}
>
  View Profile
</DropdownItem>
              </DropdownMenu>
            )}
          </ProfileWrapper>
        )}
        <SwitchWrapper>
          <Switch isChecked={isDark} onToggle={toggleTheme} />
        </SwitchWrapper>
      </NavRight>
    </Nav>
  );
};

export default Navbar;

// Styled Components

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background-color: ${({ theme }) => theme.background};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const Logo = styled.a`
  font-weight: 700;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.color};
  text-decoration: none;
  user-select: none;

  &:hover {
    opacity: 0.8;
  }
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const GetStartedButton = styled.a`
  padding: 8px 16px;
  background-color: #28a745;
  color: ${({ isDark }) => (isDark ? 'white' : 'black')};
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.3s ease;
  user-select: none;

  &:hover {
    background-color: #218838;
  }
`;

const SwitchWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const ProfileWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const ProfileImage = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid ${({ theme }) => theme.color};
  transition: border-color 0.3s ease;

  &:hover {
    border-color: #4da6ff;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 48px;
  right: 0;
  background-color: ${({ isDark }) => (isDark ? '#ffffff' : '#000000')};
  color: ${({ isDark }) => (isDark ? '#000000' : '#ffffff')};
  border-radius: 8px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-width: 160px;
  z-index: 100;
  user-select: none;
`;

const DropdownItem = styled.div`
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  color: inherit;

  &:hover {
    background-color: ${({ isDark }) => (isDark ? '#f0f0f0' : '#222222')};
  }
`;
