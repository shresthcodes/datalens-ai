import React from 'react';
import KPICard from './KPICard';

const KPIRow = ({ cards = [] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <KPICard
          key={idx}
          label={card.label}
          value={card.value}
          unit={card.unit}
          icon={card.icon}
        />
      ))}
    </div>
  );
};

export default KPIRow;
