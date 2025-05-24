'use client';

import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: LucideIcon;
  description?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export function MetricsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  description,
  color = 'blue'
}: MetricsCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-primary-100',
      text: 'text-primary-600',
      accent: 'text-primary-600'
    },
    green: {
      bg: 'bg-success-100',
      text: 'text-success-600',
      accent: 'text-success-600'
    },
    purple: {
      bg: 'bg-secondary-100',
      text: 'text-secondary-600',
      accent: 'text-secondary-600'
    },
    orange: {
      bg: 'bg-warning-100',
      text: 'text-warning-600',
      accent: 'text-warning-600'
    },
    red: {
      bg: 'bg-error-100',
      text: 'text-error-600',
      accent: 'text-error-600'
    },
  };

  const changeColorClasses = {
    increase: 'text-success-600',
    decrease: 'text-error-600',
  };

  const selectedColor = colorClasses[color];

  return (
    <div className="card-elevated group hover:scale-105 transition-all duration-300">
      <div className="card-content p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="caption text-muted-foreground mb-1">{title}</p>
            <div className="text-3xl font-bold text-foreground">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
          </div>
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${selectedColor.bg} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`h-6 w-6 ${selectedColor.text}`} />
          </div>
        </div>
        
        <div className="space-y-1">
          {change && (
            <div className={`text-xs font-semibold ${changeColorClasses[change.type]} flex items-center gap-1`}>
              <span>{change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%</span>
              <span className="text-muted-foreground font-normal">vs last period</span>
            </div>
          )}
          
          {description && (
            <p className="caption text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 