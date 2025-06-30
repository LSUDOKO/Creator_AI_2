import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

export const ContentCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const scheduledContent = {
    '2024-01-15': [{ title: 'Instagram Post', time: '2:00 PM' }],
    '2024-01-18': [{ title: 'YouTube Video', time: '10:00 AM' }],
    '2024-01-22': [{ title: 'TikTok Video', time: '6:00 PM' }],
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Content Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-white font-medium min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button variant="ghost" size="icon" onClick={() => navigateMonth('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-white/60 p-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const hasContent = scheduledContent[dateKey as keyof typeof scheduledContent];
            
            return (
              <div
                key={day.toString()}
                className={`
                  min-h-[80px] p-2 rounded-lg border border-white/10 
                  ${isSameMonth(day, currentDate) ? 'bg-white/5' : 'bg-white/2'}
                  ${isToday(day) ? 'border-neon-blue bg-neon-blue/10' : ''}
                  hover:bg-white/10 transition-colors cursor-pointer
                `}
              >
                <div className="text-sm text-white/80 mb-1">
                  {format(day, 'd')}
                </div>
                {hasContent && (
                  <div className="space-y-1">
                    {hasContent.map((content, index) => (
                      <div
                        key={index}
                        className="text-xs bg-neon-blue/20 text-neon-blue px-2 py-1 rounded truncate"
                      >
                        {content.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Schedule Content
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};