import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, Users, Heart, MessageCircle } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const metrics = [
    {
      title: 'Total Views',
      value: '124.5K',
      change: '+12.5%',
      icon: TrendingUp,
      color: 'text-neon-blue',
    },
    {
      title: 'Followers',
      value: '8.2K',
      change: '+5.2%',
      icon: Users,
      color: 'text-neon-purple',
    },
    {
      title: 'Engagement',
      value: '94.3%',
      change: '+8.1%',
      icon: Heart,
      color: 'text-neon-pink',
    },
    {
      title: 'Comments',
      value: '2.1K',
      change: '+15.3%',
      icon: MessageCircle,
      color: 'text-green-400',
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div key={metric.title} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                  <div>
                    <p className="text-white font-medium">{metric.value}</p>
                    <p className="text-sm text-white/60">{metric.title}</p>
                  </div>
                </div>
                <span className="text-sm text-green-400">{metric.change}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audience Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-white/5 rounded-xl">
              <p className="text-sm text-white/80 mb-2">Top Comment Themes:</p>
              <ul className="text-xs text-white/60 space-y-1">
                <li>• "Love the content quality!"</li>
                <li>• "More tutorials please"</li>
                <li>• "Great editing style"</li>
              </ul>
            </div>
            <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
              <p className="text-sm text-green-400 font-medium">Sentiment: 87% Positive</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monetization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/80">This Month</span>
              <span className="text-white font-semibold">$2,450</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Last Month</span>
              <span className="text-white/60">$2,180</span>
            </div>
            <div className="pt-2 border-t border-white/10">
              <span className="text-green-400 text-sm">+12.4% growth</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};