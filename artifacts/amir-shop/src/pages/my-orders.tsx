import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { Search, Loader2, PackageX } from 'lucide-react';
import { format } from 'date-fns';

type OrderWithDetails = {
  id: number;
  user_id: string;
  whatsapp: string | null;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  games: { name: string } | null;
  packages: { name: string; amount: string } | null;
};

export default function MyOrders() {
  const { t } = useTranslation();
  
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, user_id, whatsapp, currency, status, created_at,
          games(name),
          packages(name, amount)
        `)
        .or(`user_id.eq.${query},whatsapp.eq.${query}`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (data) {
        setOrders(data as any);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-4">{t('myOrders.lookupTitle')}</h1>
        <p className="text-muted-foreground">{t('myOrders.lookupDesc')}</p>
      </div>

      <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-16 relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
        <div className="relative flex bg-card border border-white/10 rounded-xl overflow-hidden shadow-xl focus-within:border-primary/50 transition-colors">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your Player ID or WhatsApp number"
            className="flex-1 bg-transparent px-6 py-4 outline-none text-white placeholder:text-white/20"
          />
          <button 
            type="submit" 
            disabled={loading || !query.trim()}
            className="px-8 bg-primary/20 hover:bg-primary/30 text-primary transition-colors flex items-center justify-center border-l border-white/5"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </div>
      </form>

      {hasSearched && !loading && orders.length === 0 && (
        <div className="text-center py-20 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 text-muted-foreground">
            <PackageX className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t('myOrders.noOrders')}</h3>
          <p className="text-muted-foreground">We couldn't find any orders matching "{query}".</p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="bg-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">{t('myOrders.columns.orderId')}</th>
                  <th className="px-6 py-4">{t('myOrders.columns.game')}</th>
                  <th className="px-6 py-4">{t('myOrders.columns.package')}</th>
                  <th className="px-6 py-4">Player ID</th>
                  <th className="px-6 py-4">{t('myOrders.columns.date')}</th>
                  <th className="px-6 py-4 text-right">{t('myOrders.columns.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono text-white/70">#{order.id}</td>
                    <td className="px-6 py-4 font-medium text-white">
                      {order.games?.name}
                    </td>
                    <td className="px-6 py-4">
                      {order.packages?.amount} {order.packages?.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-white/70 text-xs">
                      {order.user_id}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {t(`myOrders.status.${order.status}`)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
