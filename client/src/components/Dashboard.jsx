import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const userId = localStorage.getItem('user_id');
  const navigate = useNavigate();

  const [habits, setHabits] = useState([]);
  const [habitName, setHabitName] = useState('');
  const [goalDays, setGoalDays] = useState('');
  const [category, setCategory] = useState('daily');
  const [msg, setMsg] = useState('');
  const [missed, setMissed] = useState([]);
  const [history, setHistory] = useState([]);
  const [bestHabit, setBestHabit] = useState(null);
  const [worstHabit, setWorstHabit] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedGoal, setEditedGoal] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    navigate('/');
  };

  const loadHabits = async () => {
    const res = await axios.get(`http://127.0.0.1:5000/habits?user_id=${userId}`);
    setHabits(res.data);

    if (res.data.length > 0) {
      const sorted = [...res.data].sort((a, b) => b.consistency_percent - a.consistency_percent);
      setBestHabit(sorted[0]);
      setWorstHabit(sorted[sorted.length - 1]);
    }
  };

  const createHabit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:5000/habits', {
        name: habitName,
        goal: Number(goalDays),
        category,
        user_id: Number(userId),
      });
      setMsg('Habit created!');
      setHabitName('');
      setGoalDays('');
      setCategory('daily');
      loadHabits();
      loadMissed();
      loadHistory();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error creating habit');
    }
  };

  const completeHabit = async (habitId) => {
    try {
      await axios.post(`http://127.0.0.1:5000/habits/${habitId}/complete`);
      loadHabits();
      loadMissed();
      loadHistory();
    } catch (err) {
      alert('Already marked complete today!');
    }
  };

  const deleteHabit = async (habitId) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/habits/${habitId}`);
      setMsg('Habit deleted!');
      loadHabits();
      loadMissed();
      loadHistory();
    } catch (err) {
      setMsg('Failed to delete habit');
    }
  };

  const startEditing = (habitId, currentGoal) => {
    setEditingId(habitId);
    setEditedGoal(currentGoal);
  };

  const saveGoal = async (habitId) => {
    try {
      await axios.put(`http://127.0.0.1:5000/habits/${habitId}`, {
        goal: Number(editedGoal),
      });
      setEditingId(null);
      setEditedGoal('');
      loadHabits();
    } catch (err) {
      alert('Failed to update goal');
    }
  };

  const loadMissed = async () => {
    const [today, previous] = await Promise.all([
      axios.get(`http://127.0.0.1:5000/habits/missed/today?user_id=${userId}`),
      axios.get(`http://127.0.0.1:5000/habits/missed/previous?user_id=${userId}`),
    ]);
    setMissed([...today.data, ...previous.data]);
  };

  const loadHistory = async () => {
    const res = await axios.get(`http://127.0.0.1:5000/habits?user_id=${userId}`);
    const habitMap = {};
    res.data.forEach((h) => (habitMap[h.habit_id] = h.name));

    const start = res.data.reduce((min, h) => (h.created_at < min ? h.created_at : min), res.data[0].created_at);
    const end = new Date().toISOString().split('T')[0];

    const historyRes = await axios.get(
      `http://127.0.0.1:5000/habits/history?user_id=${userId}&start=${start}&end=${end}`
    );

    const fullData = historyRes.data.map((h) => ({
      ...h,
      name: habitMap[h.habit_id] || `Habit #${h.habit_id}`,
    }));
    setHistory(fullData);
  };

  useEffect(() => {
    loadHabits();
    loadMissed();
    loadHistory();
  }, []);

  return (
    <Wrapper>
      <TopBar>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </TopBar>

      <AddHabitSection>
        <h2>Create New Habit</h2>
        <form onSubmit={createHabit}>
          <input
            placeholder="Habit Name"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            required
          />
          <input
            placeholder="Goal Days"
            value={goalDays}
            type="number"
            onChange={(e) => setGoalDays(e.target.value)}
            required
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="custom">Custom</option>
          </select>
          <button type="submit">Add Habit</button>
        </form>
        <p>{msg}</p>
      </AddHabitSection>

      <Columns>
        <LeftColumn>
          <h3>Current Habits</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Created</th>
                <th>Goal</th>
                <th>Streak</th>
                <th>Mark as Complete</th>
                <th>Delete</th>
                <th>Edit</th>
                <th>Set Reminder</th>
              </tr>
            </thead>
            <tbody>
              {habits.map((h) => (
                <tr key={h.habit_id}>
                  <td>{h.name}</td>
                  <td>{h.created_at}</td>
                  <td>
                    {editingId === h.habit_id ? (
                      <input
                        type="number"
                        value={editedGoal}
                        onChange={(e) => setEditedGoal(e.target.value)}
                        style={{ width: '60px' }}
                      />
                    ) : (
                      h.goal_days
                    )}
                  </td>
                  <td>{h.current_streak}</td>
                  <td>
                    <input type="checkbox" onChange={() => completeHabit(h.habit_id)} />
                  </td>
                  <td>
                    <button onClick={() => deleteHabit(h.habit_id)}>🗑️</button>
                  </td>
                  <td>
                    {editingId === h.habit_id ? (
                      <button onClick={() => saveGoal(h.habit_id)}>Save</button>
                    ) : (
                      <button onClick={() => startEditing(h.habit_id, h.goal_days)}>✏️</button>
                    )}
                  </td>
                  <td>
                    <button onClick={() => alert('Reminder sent (mock)!')}>Remind</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {bestHabit && (
            <PerformanceSection>
              <h4>🏆 Best Performing Habit</h4>
              <p>{bestHabit.name} — {bestHabit.consistency_percent}% consistency</p>
            </PerformanceSection>
          )}

          {worstHabit && (
            <PerformanceSection>
              <h4>💤 Worst Performing Habit</h4>
              <p>{worstHabit.name} — {worstHabit.consistency_percent}% consistency</p>
            </PerformanceSection>
          )}
        </LeftColumn>

        <CenterColumn>
          <h3>Missed Habits</h3>
          {missed.map((m, i) => (
            <p key={i}>
              {m.name} {m.missed_date ? `(on ${m.missed_date})` : ''} ❌
            </p>
          ))}
        </CenterColumn>

        <RightColumn>
          <h3>Completion History</h3>
          <ul>
            {history.map((h, i) => (
              <li key={i}>
                {h.name} completed on {h.date}
              </li>
            ))}
          </ul>
        </RightColumn>
      </Columns>
    </Wrapper>
  );
}

export default Dashboard;

// Styled Components
const Wrapper = styled.div`
  padding: 20px;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.color};
  min-height: 100vh;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
`;

const LogoutButton = styled.button`
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 10px 20px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
`;

const AddHabitSection = styled.div`
  width: 100%;
  padding: 20px;
  margin-bottom: 30px;
  background: ${({ theme }) => (theme.isDark ? '#1e1e1e' : '#f0f0f0')};
  border-radius: 12px;

  form {
    display: flex;
    gap: 15px;
    margin-top: 10px;
  }

  input, button {
    padding: 10px;
    border-radius: 8px;
    border: none;
  }

  input {
    flex: 1;
  }

  button {
    background-color: #007bff;
    color: white;
    font-weight: bold;
    cursor: pointer;
  }
`;

const Columns = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: nowrap;
`;

const LeftColumn = styled.div`
  flex-basis: 60%;

  table {
    width: 100%;
    border-collapse: collapse;
    background: ${({ theme }) => (theme.isDark ? '#2c2c2c' : '#ffffff')};
    color: ${({ theme }) => theme.color};
  }

  th, td {
    border: 1px solid ${({ theme }) => (theme.isDark ? '#555' : '#ccc')};
    padding: 8px;
    text-align: center;
  }

  th {
    background: ${({ theme }) => (theme.isDark ? '#444' : '#eee')};
  }

  button {
    padding: 4px 8px;
    border-radius: 5px;
    background: #ffaa00;
    color: #000;
    font-weight: bold;
    border: none;
    cursor: pointer;
  }
`;

const CenterColumn = styled.div`
  flex-basis: 20%;
  background: ${({ theme }) => (theme.isDark ? '#1e1e1e' : '#f8f8f8')};
  padding: 20px;
  border-radius: 12px;
  height: fit-content;
`;

const RightColumn = styled.div`
  flex-basis: 20%;
  background: ${({ theme }) => (theme.isDark ? '#1e1e1e' : '#f8f8f8')};
  padding: 20px;
  border-radius: 12px;
  height: fit-content;
`;

const PerformanceSection = styled.div`
  margin-top: 20px;
  background: ${({ theme }) => (theme.isDark ? '#333' : '#e9f5ff')};
  padding: 12px;
  border-radius: 10px;

  h4 {
    margin-bottom: 5px;
  }
`;
