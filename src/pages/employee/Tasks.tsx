import React, { useState } from 'react';
import {
  CheckSquare,
  LayoutList,
  Kanban,
  Plus,
  Calendar,
  AlertTriangle,
  MessageSquare,
  Upload,
  CheckCircle2,
  Clock,
  User,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Drawer } from '../../components/ui/Drawer';
import { Task } from '../../types';

export const Tasks: React.FC = () => {
  const { tasks, toggleTaskStatus, addTask, currentUser } = useStore();

  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'completed'>('today');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // New task drawer state
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newProject, setNewProject] = useState('Cloud Infra');
  const [newPriority, setNewPriority] = useState<Task['priority']>('High');
  const [newDueDate, setNewDueDate] = useState('2026-10-23');
  const [newDesc, setNewDesc] = useState('');

  const userTasks = tasks.filter(t => t.assignedTo === currentUser.id);

  const filteredTasks = userTasks.filter(t => {
    if (activeTab === 'completed') return t.status === 'Submitted' || t.status === 'Verified';
    if (activeTab === 'today') return t.dueDate === '2026-10-22' || t.isOverdue;
    return true; // week
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle,
      project: newProject,
      priority: newPriority,
      dueDate: newDueDate,
      description: newDesc,
      assignedTo: currentUser.id,
    });

    setNewTitle('');
    setNewDesc('');
    setIsNewTaskOpen(false);
  };

  const boardColumns: Array<{ status: Task['status']; title: string }> = [
    { status: 'Pending', title: 'To Do / Backlog' },
    { status: 'In progress', title: 'In Progress' },
    { status: 'Submitted', title: 'Submitted for Review' },
    { status: 'Verified', title: 'Verified / Done' },
  ];

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Home', href: '/employee/home' }, { label: 'Tasks' }]}
        title="Engineering Tasks & Deliverables"
        subtitle="Manage sprint focus items, milestone deliverables, and verification checkpoints"
        actions={
          <div className="flex items-center gap-3">
            {/* List / Board Toggle */}
            <div className="flex items-center p-1 rounded-lg bg-surface border border-border">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-50 text-primary shadow-sm font-semibold'
                    : 'text-text-secondary hover:text-text'
                }`}
                title="List View"
              >
                <LayoutList className="w-4 h-4" strokeWidth={1.75} />
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'board'
                    ? 'bg-primary-50 text-primary shadow-sm font-semibold'
                    : 'text-text-secondary hover:text-text'
                }`}
                title="Kanban Board View"
              >
                <Kanban className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            <button
              onClick={() => setIsNewTaskOpen(true)}
              className="h-9 px-4 rounded-btn hero-gradient text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>+ New Task</span>
            </button>
          </div>
        }
        tabs={[
          { id: 'today', label: 'Today', count: userTasks.filter(t => t.dueDate === '2026-10-22' || t.isOverdue).length },
          { id: 'week', label: 'This Week', count: userTasks.length },
          { id: 'completed', label: 'Completed', count: userTasks.filter(t => t.status === 'Submitted' || t.status === 'Verified').length },
        ]}
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab as any)}
      />

      {/* VIEW: List */}
      {viewMode === 'list' && (
        <div className="bg-surface rounded-xl border border-border divide-y divide-border overflow-hidden shadow-sm">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-xs text-text-secondary">
              No tasks in this view.
            </div>
          ) : (
            filteredTasks.map(task => {
              const isDone = task.status === 'Submitted' || task.status === 'Verified';

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-primary-50/20 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        toggleTaskStatus(task.id);
                      }}
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        isDone
                          ? 'bg-[#15803D] border-[#15803D] text-white'
                          : 'border-border-strong hover:border-primary text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-semibold truncate ${
                            isDone ? 'line-through text-text-tertiary' : 'text-text'
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-muted text-text-tertiary">
                          {task.project}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-text-tertiary" /> Due {task.dueDate}
                        </span>
                        {task.commentsCount !== undefined && task.commentsCount > 0 && (
                          <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
                            <MessageSquare className="w-3.5 h-3.5" /> {task.commentsCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {task.isOverdue && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FDECEF] text-[#C81E3A]">
                        Overdue
                      </span>
                    )}

                    <StatusBadge
                      variant={
                        task.priority === 'Urgent'
                          ? 'danger'
                          : task.priority === 'High'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {task.priority}
                    </StatusBadge>

                    <StatusBadge
                      variant={
                        task.status === 'Verified'
                          ? 'success'
                          : task.status === 'Submitted'
                          ? 'info'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {task.status}
                    </StatusBadge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW: Board (Kanban Columns) */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {boardColumns.map(col => {
            const colTasks = userTasks.filter(t => t.status === col.status);

            return (
              <div key={col.status} className="p-3 rounded-xl bg-surface-muted/50 border border-border space-y-3 min-h-[400px]">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="font-heading font-bold text-xs text-text uppercase tracking-wide">
                    {col.title}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-surface border border-border text-text-secondary font-semibold">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {colTasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTask(t)}
                      className="p-3.5 rounded-xl bg-surface border border-border hover:border-primary-300 shadow-sm cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
                          {t.project}
                        </span>
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
                      </div>

                      <h4 className="font-bold text-xs text-text group-hover:text-primary transition-colors line-clamp-2">
                        {t.title}
                      </h4>

                      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-text-tertiary">
                        <span className="font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {t.dueDate.split('-').slice(1).join('/')}
                        </span>
                        {t.isOverdue && (
                          <span className="text-[#C81E3A] font-bold text-[10px]">Overdue</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Detail Drawer */}
      <Drawer
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title || 'Task Details'}
        subtitle={`Task ID: ${selectedTask?.id} · ${selectedTask?.project}`}
      >
        {selectedTask && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-surface-muted border border-border flex items-center justify-between">
              <div>
                <span className="micro-label text-text-secondary">Current Status</span>
                <p className="font-heading font-bold text-base text-text mt-0.5">{selectedTask.status}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  toggleTaskStatus(selectedTask.id);
                  setSelectedTask(prev =>
                    prev
                      ? {
                          ...prev,
                          status: prev.status === 'Submitted' ? 'Verified' : 'Submitted',
                        }
                      : null
                  );
                }}
                className="h-8 px-3 rounded-btn hero-gradient text-white text-xs font-semibold"
              >
                Advance Status →
              </button>
            </div>

            <div className="space-y-2">
              <span className="micro-label text-text-secondary">Task Description</span>
              <p className="text-xs text-text-secondary leading-relaxed p-3.5 rounded-lg bg-surface border border-border">
                {selectedTask.description ||
                  'Ensure all VPC routing tables, security group ingress rules, and replica heartbeat monitors are documented with complete step-by-step failover execution instructions.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-surface border border-border">
                <span className="text-text-tertiary block">Due Date:</span>
                <span className="font-semibold text-text font-mono mt-0.5 block">{selectedTask.dueDate}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface border border-border">
                <span className="text-text-tertiary block">Priority Level:</span>
                <span className="font-semibold text-text mt-0.5 block">{selectedTask.priority}</span>
              </div>
            </div>

            {/* Comments & Discussion */}
            <div className="space-y-3 pt-2">
              <span className="micro-label text-text-secondary">Delivery Thread & Feedback</span>
              <div className="p-3 rounded-lg bg-surface-muted text-xs space-y-1">
                <div className="flex items-center justify-between text-text-secondary font-semibold">
                  <span>Marcus Chen (Tech Lead)</span>
                  <span className="text-[10px] text-text-tertiary font-mono">Yesterday 4:15 PM</span>
                </div>
                <p className="text-text">
                  Please confirm replica health check intervals before pushing to production pipeline.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Post comment or handoff update..."
                  className="flex-1 h-9 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  className="h-9 px-3 rounded-btn bg-primary text-white text-xs font-semibold"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* New Task Drawer */}
      <Drawer
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        title="Create Sprint Task"
        subtitle="Add a new deliverable item assigned to your workflow"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block micro-label text-text-secondary mb-1">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Audit Kubernetes ingress SSL certs"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block micro-label text-text-secondary mb-1">Project</label>
              <select
                value={newProject}
                onChange={e => setNewProject(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Cloud Infra">Cloud Infra</option>
                <option value="Client Delivery">Client Delivery</option>
                <option value="Compliance">Compliance</option>
                <option value="Platform Engineering">Platform Engineering</option>
              </select>
            </div>

            <div>
              <label className="block micro-label text-text-secondary mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={e => setNewPriority(e.target.value as any)}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
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

          <div>
            <label className="block micro-label text-text-secondary mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Provide context, acceptance criteria or links..."
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              className="w-full p-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewTaskOpen(false)}
              className="h-9 px-4 rounded-btn border border-border text-xs text-text-secondary hover:text-text hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-5 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm"
            >
              Create Task →
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
