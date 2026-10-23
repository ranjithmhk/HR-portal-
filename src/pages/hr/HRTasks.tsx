import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Calendar,
  AlertTriangle,
  Clock,
  Filter,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { Task } from '../../types';

export const HRTasks: React.FC<{ isPersonalOnly?: boolean }> = ({ isPersonalOnly = false }) => {
  const { tasks, addTask, currentUser, toggleTaskStatus } = useStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newProject, setNewProject] = useState('People Operations');
  const [newPriority, setNewPriority] = useState<Task['priority']>('High');
  const [newDueDate, setNewDueDate] = useState('2026-10-25');
  const [newAssignee, setNewAssignee] = useState(currentUser.id);
  const [success, setSuccess] = useState(false);

  const displayedTasks = isPersonalOnly
    ? tasks.filter(t => t.assignedTo === currentUser.id)
    : tasks;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle,
      project: newProject,
      priority: newPriority,
      dueDate: newDueDate,
      assignedTo: newAssignee,
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setIsAddOpen(false);
      setNewTitle('');
    }, 1500);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'HR Console', href: '/hr/overview' }, { label: isPersonalOnly ? 'My Tasks' : 'All Tasks' }]}
        title={isPersonalOnly ? 'My Personal Tasks & Priorities' : 'Organizational Work Tasks'}
        subtitle={
          isPersonalOnly
            ? 'Action items assigned specifically to your HR operations role'
            : 'Enterprise-wide sprint priorities, compliance deadlines and audit tasks'
        }
        actions={
          <button
            onClick={() => setIsAddOpen(true)}
            className="h-9 px-4 rounded-btn hero-gradient text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-95"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>+ New Task</span>
          </button>
        }
      />

      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-text">
            {isPersonalOnly ? 'My Active Tasks' : 'All Cross-Functional Tasks'} ({displayedTasks.length})
          </h3>
          <span className="text-xs text-text-tertiary">Real-time status</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-text-secondary border-b border-border">
                <th className="px-5 py-3">Task Title</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayedTasks.map(t => (
                <tr key={t.id} className="hover:bg-primary-50/20 transition-colors h-[54px]">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-text max-w-sm truncate">{t.title}</p>
                    <span className="text-[10px] text-text-tertiary font-mono">{t.id}</span>
                  </td>

                  <td className="px-4 py-3 text-text-secondary">{t.project}</td>

                  <td className="px-4 py-3">
                    <StatusBadge
                      variant={
                        t.priority === 'Urgent'
                          ? 'danger'
                          : t.priority === 'High'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {t.priority}
                    </StatusBadge>
                  </td>

                  <td className="px-4 py-3 font-mono">
                    <span className={t.isOverdue ? 'text-[#C81E3A] font-bold' : 'text-text-secondary'}>
                      {t.dueDate} {t.isOverdue && '(Overdue)'}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge
                      variant={
                        t.status === 'Verified'
                          ? 'success'
                          : t.status === 'Submitted'
                          ? 'info'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {t.status}
                    </StatusBadge>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleTaskStatus(t.id)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Advance Status →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create New Operational Task"
        subtitle="Assign an item to team members or your personal queue"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block micro-label text-text-secondary mb-1">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Complete quarterly ERISA 401(k) compliance audit"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block micro-label text-text-secondary mb-1">Project</label>
              <input
                type="text"
                value={newProject}
                onChange={e => setNewProject(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block micro-label text-text-secondary mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={e => setNewPriority(e.target.value as any)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block micro-label text-text-secondary mb-1">Due Date</label>
            <input
              type="date"
              required
              value={newDueDate}
              onChange={e => setNewDueDate(e.target.value)}
              className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
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
              Add Task →
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
