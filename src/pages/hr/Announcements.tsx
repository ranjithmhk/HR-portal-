import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Pin,
  Trash2,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Heart,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { FeedPost } from '../../types';

export const Announcements: React.FC = () => {
  const { feedPosts, createPost, deletePost } = useStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<FeedPost['category']>('Announcement');
  const [isPinned, setIsPinned] = useState(true);
  const [success, setSuccess] = useState(false);

  const announcementsList = feedPosts.filter(
    p => p.category === 'Announcement' || p.category === 'Policy' || p.isPinned
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    createPost({
      title,
      body,
      category,
      isPinned,
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setIsAddOpen(false);
      setTitle('');
      setBody('');
    }, 1500);
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'HR Console', href: '/hr/overview' }, { label: 'Announcements' }]}
        title="Corporate Announcements & Broadcasts"
        subtitle="Manage official company memos, town hall highlights, and pinned policy directives"
        actions={
          <button
            onClick={() => setIsAddOpen(true)}
            className="h-9 px-4 rounded-btn hero-gradient text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-95"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>+ Create Announcement</span>
          </button>
        }
      />

      <div className="space-y-4">
        {announcementsList.map(post => (
          <Card key={post.id} className="p-6 space-y-3 shadow-sm hover:border-primary-300 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary flex items-center justify-center font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-sm text-text">{post.title}</h3>
                    {post.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-spark-50 text-spark">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-secondary">
                    Published by {post.authorName} · {post.timeAgo}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge
                  variant={post.category === 'Policy' ? 'danger' : 'warning'}
                  size="sm"
                >
                  {post.category}
                </StatusBadge>
                <button
                  onClick={() => deletePost(post.id)}
                  className="p-1.5 text-text-tertiary hover:text-[#C81E3A] rounded hover:bg-[#FDECEF]"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
              {post.body}
            </p>

            <div className="pt-2 border-t border-border flex items-center gap-4 text-xs text-text-tertiary">
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-magenta" /> {post.likes} Likes
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> {post.comments.length} Comments
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Announcement Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Publish Announcement"
        subtitle="Broadcast to all employees and pin to top of Company Feed"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block micro-label text-text-secondary mb-1">Headline</label>
            <input
              type="text"
              required
              placeholder="e.g. Q4 Company All-Hands Townhall"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block micro-label text-text-secondary mb-1">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Announcement">Announcement</option>
              <option value="Policy">Policy Directive</option>
              <option value="General">General Memo</option>
            </select>
          </div>

          <div>
            <label className="block micro-label text-text-secondary mb-1">Announcement Body</label>
            <textarea
              rows={5}
              required
              placeholder="Full text of the announcement..."
              value={body}
              onChange={e => setBody(e.target.value)}
              className="w-full p-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none leading-relaxed"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={e => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
            />
            <span>Pin this announcement to the top of everyone's feed</span>
          </label>

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
              Broadcast Announcement →
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
