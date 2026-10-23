import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  CheckCircle2,
  MapPin,
  CalendarDays,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { HolidayItem } from '../../types';

export const HolidayCalendar: React.FC = () => {
  const { holidays, addHoliday } = useStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-11-26');
  const [day, setDay] = useState('Thursday');
  const [type, setType] = useState<HolidayItem['type']>('Public');
  const [location, setLocation] = useState('US Offices');
  const [success, setSuccess] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addHoliday({
      title,
      date,
      day,
      type,
      location,
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setIsAddOpen(false);
      setTitle('');
    }, 1500);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'HR Console', href: '/hr/overview' }, { label: 'Holiday Calendar' }]}
        title="Corporate Holiday Calendar 2026–2027"
        subtitle="Public statutory holidays and company wellness observances across US and India offices"
        actions={
          <button
            onClick={() => setIsAddOpen(true)}
            className="h-9 px-4 rounded-btn hero-gradient text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-95"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>+ Add Holiday</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {holidays.map(hol => (
          <Card key={hol.id} className="p-5 space-y-3 shadow-sm hover:border-primary-300 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary flex flex-col items-center justify-center">
                <span className="font-heading font-extrabold text-base leading-none">
                  {hol.date.split('-')[2]}
                </span>
                <span className="text-[10px] uppercase font-bold text-text-tertiary">
                  {new Date(hol.date).toLocaleString('default', { month: 'short' })}
                </span>
              </div>

              <StatusBadge variant={hol.type === 'Public' ? 'info' : 'warning'} size="sm">
                {hol.type} Holiday
              </StatusBadge>
            </div>

            <div>
              <h4 className="font-heading font-bold text-sm text-text">{hol.title}</h4>
              <p className="text-xs text-text-secondary mt-0.5">{hol.day} · {hol.date}</p>
            </div>

            <div className="pt-2 border-t border-border flex items-center gap-1.5 text-xs text-text-tertiary">
              <MapPin className="w-3.5 h-3.5" />
              <span>{hol.location}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Holiday Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Corporate Holiday"
        subtitle="Broadcast holiday closure to timecards and attendance tracking"
      >
        {success ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#15803D] mx-auto" />
            <h4 className="font-heading font-bold text-sm text-text">Holiday Added</h4>
            <p className="text-xs text-text-secondary">Calendar synced for all employees.</p>
          </div>
        ) : (
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block micro-label text-text-secondary mb-1">Holiday Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Thanksgiving Day"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block micro-label text-text-secondary mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block micro-label text-text-secondary mb-1">Day of Week</label>
                <input
                  type="text"
                  value={day}
                  onChange={e => setDay(e.target.value)}
                  placeholder="e.g. Thursday"
                  className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block micro-label text-text-secondary mb-1">Holiday Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Public">Public Statutory</option>
                  <option value="Company">Company Wellness</option>
                </select>
              </div>

              <div>
                <label className="block micro-label text-text-secondary mb-1">Location Applicable</label>
                <select
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="US Offices">US Offices</option>
                  <option value="India Offices">India Offices</option>
                  <option value="All Locations">All Locations</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="h-9 px-4 rounded-btn border border-border text-xs text-text-secondary hover:text-text hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm"
              >
                Publish Holiday →
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
