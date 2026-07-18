import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminLayout } from '@/components/admin-layout';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Package = Database['public']['Tables']['packages']['Row'] & { games: { name: string } | null };
type Game = Database['public']['Tables']['games']['Row'];

export default function AdminPackages() {
  const { t } = useTranslation();
  useAdminAuth();

  const [packages, setPackages] = useState<Package[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [filterGameId, setFilterGameId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    game_id: 0,
    name: '',
    amount: '',
    price: 0,
    currency: 'USD',
    description: '',
    active: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: gamesData } = await supabase.from('games').select('*').order('name');
      if (gamesData) setGames(gamesData);

      let query = supabase.from('packages').select('*, games(name)').order('created_at', { ascending: false });
      if (filterGameId !== 'all') {
        query = query.eq('game_id', parseInt(filterGameId));
      }
      
      const { data: pkgsData, error } = await query;
      if (error) throw error;
      if (pkgsData) setPackages(pkgsData as any);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterGameId]);

  const openModal = (pkg?: Package) => {
    if (pkg) {
      setEditingId(pkg.id);
      setFormData({
        game_id: pkg.game_id,
        name: pkg.name,
        amount: pkg.amount,
        price: pkg.price,
        currency: pkg.currency,
        description: pkg.description || '',
        active: pkg.active,
      });
    } else {
      setEditingId(null);
      setFormData({
        game_id: games[0]?.id || 0,
        name: '',
        amount: '',
        price: 0,
        currency: 'USD',
        description: '',
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.game_id) return toast.error("Please select a game");
    
    setSubmitting(true);
    const payload = {
      game_id: formData.game_id,
      name: formData.name,
      amount: formData.amount,
      price: formData.price,
      currency: formData.currency,
      description: formData.description || null,
      active: formData.active,
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('packages').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Package updated successfully');
      } else {
        const { error } = await supabase.from('packages').insert(payload);
        if (error) throw error;
        toast.success('Package added successfully');
      }
      closeModal();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    try {
      const { error } = await supabase.from('packages').delete().eq('id', id);
      if (error) throw error;
      toast.success('Package deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">{t('admin.packages.title')}</h1>
          
          <div className="flex items-center gap-4">
            <select 
              value={filterGameId} 
              onChange={(e) => setFilterGameId(e.target.value)}
              className="bg-card border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
            >
              <option value="all">All Games</option>
              {games.map(g => (
                <option key={g.id} value={g.id.toString()}>{g.name}</option>
              ))}
            </select>
            
            <button 
              onClick={() => openModal()}
              className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg flex items-center gap-2 font-medium glow-secondary transition-all"
            >
              <Plus className="w-5 h-5" />
              {t('admin.packages.add')}
            </button>
          </div>
        </div>

        <div className="bg-card border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-secondary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Game</th>
                    <th className="px-6 py-4">Package Name</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 font-medium text-white">{pkg.games?.name}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{pkg.name}</div>
                        {pkg.description && <div className="text-xs text-muted-foreground mt-0.5">{pkg.description}</div>}
                      </td>
                      <td className="px-6 py-4 font-mono text-secondary">{pkg.amount}</td>
                      <td className="px-6 py-4 font-bold text-white">{pkg.price} {pkg.currency}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${pkg.active ? 'bg-green-500/20 text-green-500' : 'bg-white/10 text-white/50'}`}>
                          {pkg.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openModal(pkg)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(pkg.id)} className="p-2 hover:bg-white/10 rounded-lg text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {packages.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No packages found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-white/10 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">{editingId ? t('admin.packages.edit') : t('admin.packages.add')}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white/80">{t('admin.packages.game')}</label>
                <select required value={formData.game_id} onChange={e => setFormData({...formData, game_id: parseInt(e.target.value)})} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-secondary">
                  <option value={0} disabled>Select a Game</option>
                  {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white/80">{t('admin.packages.name')}</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-secondary" placeholder="e.g. UC, Diamonds" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white/80">{t('admin.packages.amount')}</label>
                  <input required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-secondary font-mono" placeholder="e.g. 60+3" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white/80">Description (optional)</label>
                <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-secondary" placeholder="e.g. Best value pack" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white/80">{t('admin.packages.price')}</label>
                  <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-secondary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white/80">{t('admin.packages.currency')}</label>
                  <input required value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-secondary" />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer mt-2 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-5 h-5 accent-secondary bg-background border-white/20" />
                <span className="font-medium text-white">{t('admin.packages.isActive')}</span>
              </label>

              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-colors">{t('common.cancel')}</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 rounded-lg bg-secondary hover:bg-secondary/90 text-white font-medium transition-colors flex items-center gap-2">
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
