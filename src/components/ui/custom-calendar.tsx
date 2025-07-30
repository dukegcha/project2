'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

interface CustomCalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  disabled?: (date: Date) => boolean;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  selected,
  onSelect,
  disabled
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
  
  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Day abbreviations
  const dayAbbreviations = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  // Create calendar grid
  const calendarDays = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }
  
  // Handle date selection
  const handleDateClick = (date: Date) => {
    if (disabled && disabled(date)) return;
    onSelect?.(date);
  };
  
  // Check if date is selected
  const isSelected = (date: Date) => {
    if (!selected) return false;
    return date.toDateString() === selected.toDateString();
  };
  
  // Check if date is today
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };
  
  // Check if date is disabled
  const isDisabled = (date: Date) => {
    return disabled ? disabled(date) : false;
  };
  
  return (
    <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px', position: 'relative' }}>
        <Button
          variant="outline"
          size="icon"
          onClick={previousMonth}
          style={{ position: 'absolute', left: '4px', width: '28px', height: '28px' }}
        >
          <ChevronLeft style={{ width: '16px', height: '16px' }} />
        </Button>
        
        <h3 style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>
          {monthNames[month]} {year}
        </h3>
        
        <Button
          variant="outline"
          size="icon"
          onClick={nextMonth}
          style={{ position: 'absolute', right: '4px', width: '28px', height: '28px' }}
        >
          <ChevronRight style={{ width: '16px', height: '16px' }} />
        </Button>
      </div>
      
      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0' }}>
        {/* Day headers */}
        {dayAbbreviations.map(day => (
          <div
            key={day}
            style={{
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '400',
              color: '#6b7280'
            }}
          >
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((date, index) => (
          <div
            key={index}
            style={{
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {date && (
              <button
                onClick={() => handleDateClick(date)}
                disabled={isDisabled(date)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: isSelected(date) 
                    ? '#111827' 
                    : isToday(date) 
                    ? '#f3f4f6' 
                    : 'transparent',
                  color: isSelected(date) 
                    ? 'white' 
                    : isDisabled(date) 
                    ? '#9ca3af' 
                    : '#111827',
                  fontSize: '14px',
                  cursor: isDisabled(date) ? 'not-allowed' : 'pointer',
                  opacity: isDisabled(date) ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isDisabled(date) && !isSelected(date)) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDisabled(date) && !isSelected(date)) {
                    e.currentTarget.style.backgroundColor = isToday(date) ? '#f3f4f6' : 'transparent';
                  }
                }}
              >
                {date.getDate()}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomCalendar;