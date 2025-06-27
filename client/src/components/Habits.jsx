import React from "react";

function Habits({ habit }) {
  return (
    <div className="p-4 bg-gray-100 rounded shadow">
      <h2 className="font-bold">{habit.name}</h2>
      <p>Goal: {habit.goal_days} days</p>
      <p>Total Completed: {habit.completed_days}</p>
      <p>Current Streak: {habit.current_streak}</p>
      <p>Consistency: {habit.consistency_percent}%</p>
    </div>
  );
}

export default Habits;
