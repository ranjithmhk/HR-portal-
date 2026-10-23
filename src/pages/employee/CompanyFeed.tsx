import React, { useState } from 'react';
import {
  Pin,
  Heart,
  MessageSquare,
  Share2,
  Image,
  Send,
  Sparkles,
  Maximize2,
  X,
  Filter,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { FeedPost } from '../../types';

export const CompanyFeed: React.FC = () => {
  const { feedPosts, likePost, addCommentToPost, createPost, currentUser } = useStore();

  const [filterCategory, setFilterCategory] = useState<'All' | 'Announcement' | 'Policy' | 'General'>('All');
  const [commentInput, setCommentInput] = useState<{ [postId: string]: string }>({});
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // New Post composer state
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState<FeedPost['category']>('General');
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const filteredPosts = feedPosts.filter(p => {
    if (filterCategory === 'All') return true;
    return p.category === filterCategory;
  });

  const pinnedPosts = feedPosts.filter(p => p.isPinned);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    createPost({
      title: newTitle,
      body: newBody,
      category: newCategory,
      isPinned: false,
    });
    setNewTitle('');
    setNewBody('');
    setIsComposerOpen(false);
  };

  const handleAddComment = (postId: string) => {
    const text = commentInput[postId];
    if (!text || !text.trim()) return;

    addCommentToPost(postId, text);
    setCommentInput(prev => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        breadcrumbs={[{ label: 'Home', href: '/employee/home' }, { label: 'Company Feed' }]}
        title="Company Broadcasts & Feed"
        subtitle="Town halls, cultural milestones and peer recognition across MHK offices"
        actions={
          <button
            onClick={() => setIsComposerOpen(!isComposerOpen)}
            className="h-9 px-4 rounded-btn bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-colors"
          >
            {isComposerOpen ? 'Close Composer' : '+ Create Post'}
          </button>
        }
      />

      {/* Main Feed Container: Centered 680px column + Right Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Centered Column (max 680px) -> 8/12 on desktop */}
        <div className="lg:col-span-8 max-w-[680px] w-full mx-auto space-y-6">
          {/* Post Composer Card */}
          {isComposerOpen && (
            <Card className="border-primary/40 shadow-md animate-fadeIn">
              <h3 className="text-sm font-bold text-text font-heading mb-3">Compose New Feed Post</h3>
              <form onSubmit={handleCreatePost} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Post title or headline..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-input border border-border bg-surface text-xs font-semibold text-text focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <textarea
                  rows={4}
                  required
                  placeholder="Share an update, team achievement, or announcement..."
                  value={newBody}
                  onChange={e => setNewBody(e.target.value)}
                  className="w-full p-3 rounded-input border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-text-tertiary"
                />

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-text-secondary">Category:</span>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value as any)}
                      className="h-8 px-2.5 rounded-lg border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="General">General</option>
                      <option value="Announcement">Announcement</option>
                      <option value="Policy">Policy</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsComposerOpen(false)}
                      className="h-8 px-3 rounded-btn border border-border text-xs text-text-secondary hover:text-text hover:bg-surface-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="h-8 px-4 rounded-btn hero-gradient text-white text-xs font-semibold shadow-sm"
                    >
                      Publish Post →
                    </button>
                  </div>
                </div>
              </form>
            </Card>
          )}

          {/* Posts List */}
          {filteredPosts.map(post => (
            <Card key={post.id} className="p-6 space-y-4">
              {/* Post Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-magenta text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {post.authorName
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-text">
                        {post.authorName}
                      </span>
                      {post.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-spark-50 text-spark">
                          <Pin className="w-3 h-3" strokeWidth={2} /> Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      {post.authorRole} · {post.timeAgo}
                    </p>
                  </div>
                </div>

                <StatusBadge
                  variant={
                    post.category === 'Announcement'
                      ? 'warning'
                      : post.category === 'Policy'
                      ? 'danger'
                      : 'info'
                  }
                  size="sm"
                >
                  {post.category}
                </StatusBadge>
              </div>

              {/* Title & Body */}
              <div className="space-y-2">
                <h2 className="text-base font-bold text-text font-heading">{post.title}</h2>
                <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                  {post.body}
                </p>
              </div>

              {/* Post Image with Lightbox link */}
              {post.imageUrl && (
                <div className="relative rounded-xl overflow-hidden border border-border group">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => setLightboxImage(post.imageUrl!)}
                    className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-white/90 text-text border border-border text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-sm shadow-xs hover:bg-white"
                  >
                    <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.75} /> View full size
                  </button>
                </div>
              )}

              {/* Like & Comment Bar */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => likePost(post.id)}
                    className={`inline-flex items-center gap-1.5 transition-colors ${
                      post.userLiked ? 'text-magenta font-semibold' : 'hover:text-text'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${post.userLiked ? 'fill-magenta text-magenta' : ''}`}
                      strokeWidth={1.75}
                    />
                    <span>{post.likes} Likes</span>
                  </button>

                  <div className="inline-flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-text-tertiary" strokeWidth={1.75} />
                    <span>{post.comments.length} Comments</span>
                  </div>
                </div>

                <button className="hover:text-text p-1" title="Share link">
                  <Share2 className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>

              {/* Inline Comments Thread */}
              {post.comments.length > 0 && (
                <div className="pt-2 space-y-2 border-t border-border/60">
                  {post.comments.map(c => (
                    <div key={c.id} className="p-2.5 rounded-lg bg-surface-muted flex items-start gap-2.5 text-xs">
                      <div className="w-6 h-6 rounded-full bg-primary-100 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {c.author
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-text">{c.author}</span>
                          <span className="text-[10px] text-text-tertiary">{c.timeAgo}</span>
                        </div>
                        <p className="text-text-secondary mt-0.5">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Write a supportive reply..."
                  value={commentInput[post.id] || ''}
                  onChange={e =>
                    setCommentInput(prev => ({ ...prev, [post.id]: e.target.value }))
                  }
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddComment(post.id);
                  }}
                  className="flex-1 h-9 px-3 text-xs rounded-input border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => handleAddComment(post.id)}
                  disabled={!commentInput[post.id]?.trim()}
                  className="h-9 px-3 rounded-btn bg-primary text-white text-xs font-semibold disabled:opacity-40"
                >
                  Reply
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Right Rail: Category Filter & Pinned Highlights */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Category Filter Card */}
          <Card className="space-y-3">
            <span className="micro-label text-text-secondary">Filter Stream</span>
            <div className="flex flex-col gap-1">
              {(['All', 'Announcement', 'Policy', 'General'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors flex items-center justify-between ${
                    filterCategory === cat
                      ? 'bg-primary-50 text-primary font-semibold'
                      : 'text-text-secondary hover:bg-surface-muted hover:text-text'
                  }`}
                >
                  <span>{cat === 'All' ? 'All Broadcasts' : `${cat}s`}</span>
                  <span className="text-[11px] font-mono opacity-70">
                    {cat === 'All'
                      ? feedPosts.length
                      : feedPosts.filter(p => p.category === cat).length}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Pinned Highlights Card */}
          <Card className="space-y-3">
            <div className="flex items-center gap-1.5 text-spark">
              <Pin className="w-4 h-4" strokeWidth={2} />
              <span className="micro-label font-bold text-spark">Executive Pinned Posts</span>
            </div>

            <div className="space-y-3 pt-1">
              {pinnedPosts.map(p => (
                <div key={p.id} className="p-3 rounded-lg bg-surface-muted space-y-1">
                  <p className="text-xs font-bold text-text line-clamp-1">{p.title}</p>
                  <p className="text-[11px] text-text-secondary line-clamp-2">{p.body}</p>
                  <p className="text-[10px] text-text-tertiary pt-1">By {p.authorName}</p>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={lightboxImage} alt="Enlarged view" className="rounded-2xl max-h-[85vh] object-contain shadow-2xl" />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-text hover:bg-white shadow-md transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
