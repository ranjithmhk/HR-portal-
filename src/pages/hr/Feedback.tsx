import React, { useState } from 'react';
import {
  Heart,
  Star,
  Search,
  Users,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatStrip, StatItem } from '../../components/ui/StatStrip';
import { Card } from '../../components/ui/Card';
import { StarRating } from '../../components/ui/StarRating';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { FeedbackEntry } from '../../types';

export const Feedback: React.FC = () => {
  const { feedbackList } = useStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Management', 'General', 'Culture', 'Work Environment'];

  const filteredFeedback = feedbackList.filter(f => {
    const matchCat = selectedCategory === 'All' || f.category === selectedCategory;
    const matchSearch =
      f.comment.toLowerCase().includes(search.toLowerCase()) ||
      f.author.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const avgRating = (
    feedbackList.reduce((acc, curr) => acc + curr.rating, 0) / feedbackList.length
  ).toFixed(1);

  const statItems: StatItem[] = [
    {
      icon: <MessageSquare className="w-4 h-4" />,
      label: 'Total Responses',
      value: feedbackList.length,
      delta: { text: '100% Confidential', positive: true },
    },
    {
      icon: <Star className="w-4 h-4" />,
      label: 'Average Sentiment Rating',
      value: `${avgRating} / 5.0`,
      delta: { text: '+0.4 vs Q3 benchmark', positive: true },
      hasGradientAccent: true,
    },
    {
      icon: <Users className="w-4 h-4" />,
      label: 'Anonymous Submissions',
      value: `${Math.round((feedbackList.filter(f => f.author === 'Anonymous').length / feedbackList.length) * 100)}%`,
      delta: { text: 'High safety trust', neutral: true },
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      label: 'Feedback Categories',
      value: '4 Focus Areas',
      delta: { text: 'Culture & Leadership', neutral: true },
    },
  ];

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'HR Console', href: '/hr/overview' }, { label: 'Employee Feedback' }]}
        title="Workforce Sentiment & Feedback Pulse"
        subtitle="Review employee comments, satisfaction ratings, and workplace culture sentiment"
      />

      {/* Stat Strip */}
      <StatStrip stats={statItems} />

      {/* Search and Category Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-3.5" strokeWidth={1.75} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search feedback comments..."
            className="w-full h-10 pl-9 pr-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface border border-border text-text-secondary hover:text-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFeedback.map(fb => (
          <Card key={fb.id} className="p-5 space-y-3 shadow-sm hover:border-primary-300 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-sm text-text">{fb.author}</span>
                  {fb.author === 'Anonymous' && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-surface-muted text-text-tertiary">
                      Verified Anonymous
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-text-tertiary font-mono">{fb.date}</p>
              </div>

              <StatusBadge variant="info" size="sm">
                {fb.category}
              </StatusBadge>
            </div>

            <div>
              <StarRating value={fb.rating} readOnly size="sm" />
            </div>

            <p className="text-xs text-text-secondary leading-relaxed italic">
              "{fb.comment}"
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};
