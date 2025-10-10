'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, BarChart3, Eye, MousePointerClick } from 'lucide-react';

interface Ad {
  id: number;
  title: string;
  content: string;
  link: string | null;
  imageUrl: string | null;
  position: string;
  active: boolean;
}

interface AdStats {
  adId: number;
  clicks: number;
  views: number;
  ctr: number;
}

export default function AdsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [activeTab, setActiveTab] = useState<'ads' | 'analytics'>(
    searchParams.get('analytics') === 'true' ? 'analytics' : 'ads'
  );
  const [stats, setStats] = useState<Record<number, AdStats>>({});
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    link: '',
    imageUrl: '',
    position: 'sidebar',
    active: true,
  });

  useEffect(() => {
    fetchAds();
    fetchStats();
  }, []);

  const fetchAds = async () => {
    const res = await fetch('/api/ads');
    const data = await res.json();
    setAds(data);
  };

  const fetchStats = async () => {
    const res = await fetch('/api/ads/stats');
    const data = await res.json();
    const statsMap: Record<number, AdStats> = {};
    data.forEach((stat: AdStats) => {
      statsMap[stat.adId] = stat;
    });
    setStats(statsMap);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAd) {
      await fetch(`/api/ads/${editingAd.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } else {
      await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    }

    setShowForm(false);
    setEditingAd(null);
    setFormData({ title: '', content: '', link: '', imageUrl: '', position: 'sidebar', active: true });
    fetchAds();
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      content: ad.content,
      link: ad.link || '',
      imageUrl: ad.imageUrl || '',
      position: ad.position,
      active: ad.active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this ad?')) return;
    await fetch(`/api/ads/${id}`, { method: 'DELETE' });
    fetchAds();
    fetchStats();
  };

  const toggleActive = async (ad: Ad) => {
    await fetch(`/api/ads/${ad.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...ad, active: !ad.active }),
    });
    fetchAds();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Advertisements</h1>
          <p className="text-muted-foreground mt-2">Manage ads across your app</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Create Ad
        </button>
      </div>

      <div className="flex gap-2 mb-8 border-b">
        <button
          onClick={() => {
            setActiveTab('ads');
            router.push('/admin/ads');
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'ads'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Advertisements
        </button>
        <button
          onClick={() => {
            setActiveTab('analytics');
            router.push('/admin/ads?analytics=true');
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Analytics
        </button>
      </div>

      {activeTab === 'ads' && showForm && (
        <div className="mb-8 p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">{editingAd ? 'Edit' : 'Create'} Advertisement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={3}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Link (Optional)</label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Image URL (Optional)</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Position</label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="sidebar">Sidebar</option>
                <option value="banner">Banner</option>
                <option value="footer">Footer</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              <label htmlFor="active" className="text-sm font-medium">Active</label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                {editingAd ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingAd(null);
                  setFormData({ title: '', content: '', link: '', imageUrl: '', position: 'sidebar', active: true });
                }}
                className="px-4 py-2 border rounded-md hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'ads' && (
        <div className="space-y-4">
          {ads.map((ad) => (
            <div key={ad.id} className="border rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      {stats[ad.id]?.views || 0} views
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MousePointerClick className="w-4 h-4" />
                      {stats[ad.id]?.clicks || 0} clicks
                    </div>
                    {stats[ad.id] && (
                      <div className="text-sm font-medium text-primary">
                        CTR: {stats[ad.id].ctr.toFixed(2)}%
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{ad.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${ad.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}>
                      {ad.active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {ad.position}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{ad.content}</p>
                  {ad.link && (
                    <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                      {ad.link}
                    </a>
                  )}
                  {ad.imageUrl && (
                    <img src={ad.imageUrl} alt={ad.title} className="mt-3 max-w-xs rounded border" />
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(ad)}
                    className="px-3 py-1 text-sm border rounded hover:bg-accent"
                  >
                    {ad.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(ad)}
                    className="p-2 border rounded hover:bg-accent"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id)}
                    className="p-2 border rounded hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {ads.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No ads yet. Create your first ad!</p>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-lg p-6 bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Eye className="w-5 h-5" />
                <span className="text-sm font-medium">Total Views</span>
              </div>
              <p className="text-3xl font-bold">
                {Object.values(stats).reduce((sum, s) => sum + s.views, 0)}
              </p>
            </div>
            <div className="border rounded-lg p-6 bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <MousePointerClick className="w-5 h-5" />
                <span className="text-sm font-medium">Total Clicks</span>
              </div>
              <p className="text-3xl font-bold">
                {Object.values(stats).reduce((sum, s) => sum + s.clicks, 0)}
              </p>
            </div>
            <div className="border rounded-lg p-6 bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm font-medium">Avg CTR</span>
              </div>
              <p className="text-3xl font-bold">
                {Object.values(stats).length > 0
                  ? (Object.values(stats).reduce((sum, s) => sum + s.ctr, 0) / Object.values(stats).length).toFixed(2)
                  : 0}%
              </p>
            </div>
          </div>

          <div className="border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Ad Performance</h3>
            </div>
            <div className="divide-y">
              {ads.map((ad) => {
                const adStats = stats[ad.id] || { views: 0, clicks: 0, ctr: 0 };
                return (
                  <div key={ad.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{ad.title}</h4>
                        <p className="text-sm text-muted-foreground">{ad.position}</p>
                      </div>
                      <div className="flex gap-8 text-sm">
                        <div className="text-center">
                          <div className="text-muted-foreground mb-1">Views</div>
                          <div className="font-bold">{adStats.views}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground mb-1">Clicks</div>
                          <div className="font-bold">{adStats.clicks}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground mb-1">CTR</div>
                          <div className="font-bold text-primary">{adStats.ctr.toFixed(2)}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
