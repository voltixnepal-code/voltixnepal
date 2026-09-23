'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import CloudinaryUploader from '@/components/common/CloudinaryUploader';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blog?all=true');
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenEdit = (post: any) => {
    setEditingPost({ ...post });
    setIsNew(false);
  };

  const handleOpenNew = () => {
    setEditingPost({
      title: '',
      slug: '',
      category: 'Electrical Safety',
      summary: '',
      content: '',
      featuredImage:
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
      tags: 'electrical,wiring,nepal',
      author: 'Sanjeet Mishra',
      isPublished: true,
    });
    setIsNew(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isNew ? '/api/blog' : `/api/blog/${editingPost.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPost),
      });

      const data = await res.json();
      if (data.success) {
        setEditingPost(null);
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
      if (res.ok) fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Safety Guides & Blog Articles
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish electrical advice, homeowner safety tips, and technical guides
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Loading articles...
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{p.title}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      /blog/{p.slug}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {p.author}
                  </td>
                  <td className="py-3 px-4">
                    {p.isPublished ? (
                      <span className="text-emerald-700 font-bold text-xs">
                        ● Published
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">○ Draft</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="btn-secondary text-xs py-1 px-2.5"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.title)}
                      className="btn-secondary text-xs py-1 px-2.5 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 max-w-2xl w-full p-6 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {isNew ? 'New Article' : `Edit: ${editingPost.title}`}
              </h2>
              <button
                onClick={() => setEditingPost(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xs">Article Title</label>
                  <input
                    type="text"
                    required
                    value={editingPost.title}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, title: e.target.value })
                    }
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Category</label>
                  <input
                    type="text"
                    required
                    value={editingPost.category}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, category: e.target.value })
                    }
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-xs">Short Summary</label>
                <textarea
                  rows={2}
                  required
                  value={editingPost.summary}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, summary: e.target.value })
                  }
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs">Full Article Content</label>
                <textarea
                  rows={8}
                  required
                  value={editingPost.content}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, content: e.target.value })
                  }
                  className="form-input text-xs font-mono"
                />
              </div>

              <div>
                <CloudinaryUploader
                  label="Featured Article Image / Video (Cloudinary)"
                  value={editingPost.featuredImage}
                  onChange={(url) =>
                    setEditingPost({ ...editingPost, featuredImage: url })
                  }
                  folder="voltixnepal/blog"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xs">Author Name</label>
                  <input
                    type="text"
                    required
                    value={editingPost.author}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, author: e.target.value })
                    }
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPost.isPublished}
                    onChange={(e) =>
                      setEditingPost({
                        ...editingPost,
                        isPublished: e.target.checked,
                      })
                    }
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="font-semibold text-slate-800">
                    Publish Publicly
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPost(null)}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary text-xs flex items-center gap-1.5"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Article</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
