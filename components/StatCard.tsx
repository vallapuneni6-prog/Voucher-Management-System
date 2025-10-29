
import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => {
  return (
    <div className="bg-brand-surface p-4 rounded-xl shadow-lg text-center">
      <p className="text-sm font-medium text-brand-text-secondary">{title}</p>
      <p className={`text-4xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
};

export default StatCard;
