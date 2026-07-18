import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminLayout } from '@/components/admin-layout';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { Plus, Edit2, Trash2, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

type Game = Database['public']['Tables']['games']['Row'];

export default function AdminGames() {
  const { t } = useTranslation();
  useAdminAuth();

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    image: '',
    active: true,
  });

  const fetchGames = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('games').select('*').order('created_at', { ascending: false });
    if (data) setGames(data);
    if (error) toast.error(error.message);
    setLoading(false);
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const openModal = (game?: Game) => {
    if (game) {
      setEditingId(game.id);
      setFormData({
        name: game.name,
        image: game.image || '',
        active: game.active,
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', image: '', active: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name: formData.name,
      image: formData.image || null,
      active: formData.active,
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('games').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Game updated successfully');
      } else {
        const { error } = await supabase.from('games').insert(payload);
        if (error) throw error;
        toast.success('Game added successfully');
      }
      closeModal();
      fetchGames();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.games.confirmDelete'))) return;
    try {
      const { error } = await supabase.from('games').delete().eq('id', id);
      if (error) throw error;
      toast.success('Game deleted successfully');
      fetchGames();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">{t('admin.games.title')}</h1>
          <button 
            onClick={() => openModal()}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center gap-2 font-medium glow-primary transition-all"
          >
            <Plus className="w-5 h-5" />
            {t('admin.games.add')}
          </button>
        </div>

        <div className="bg-card border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 w-20">Image</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {games.map((game) => (
                    <tr key={game.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded overflow-hidden bg-white/5 flex items-center justify-center">
                          {game.image ? (
                            <img src={game.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-white/20" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{game.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${game.active ? 'bg-green-500/20 text-green-500' : 'bg-white/10 text-white/50'}`}>
                          {game.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openModal(game)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(game.id)} className="p-2 hover:bg-white/10 rounded-lg text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {games.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No games found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-white/10 rounded-2xl w-full max-w-md flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">{editingId ? t('admin.games.edit') : t('admin.games.add')}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white/80">{t('admin.games.name')}</label>
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
                  placeholder="e.g. PUBG Mobile"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-white/80">{t('admin.games.imageUrl')}</label>
                <input
                  value={formData.image}
                  onChange={e => setFormData({...formData, image: e.target.value})}
                  className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
                  placeholder="https://..."
                />
                {formData.image && (
                  <div className="mt-2 w-16 h-16 rounded overflow-hidden border border-white/10">
                    <img src={formData.image} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>

              <label className="flex items-center gap-3 cursor-pointer mt-2 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-5 h-5 accent-primary bg-background border-white/20" />
                <span className="font-medium text-white">{t('admin.games.isActive')}</span>
              </label>

              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-colors">{t('common.cancel')}</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-colors flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
