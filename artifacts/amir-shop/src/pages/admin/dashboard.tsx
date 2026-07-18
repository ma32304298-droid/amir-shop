import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminLayout } from '@/components/admin-layout';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, Clock, CheckCircle, Gamepad2, Package } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { t } = useTranslation();
  useAdminAuth();

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalGames: 0,
    totalPackages: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [
          { count: totalOrders },
          { count: pendingOrders },
          { count: completedOrders },
          { count: totalGames },
          { count: totalPackages },
          { data: recent }
        ] = await Promise.all([
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
          supabase.from('games').select('*', { count: 'exact', head: true }),
          supabase.from('packages').select('*', { count: 'exact', head: true }),
          supabase.from('orders')
            .select('id, currency, status, created_at, user_id, whatsapp, games(name), packages(name, amount)')
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        setStats({
          totalOrders: totalOrders || 0,
          pendingOrders: pendingOrders || 0,
          completedOrders: completedOrders || 0,
          totalGames: totalGames || 0,
          totalPackages: totalPackages || 0,
        });
        
        if (recent) setRecentOrders(recent);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadStats();
  }, []);

  const statCards = [
    { label: t('admin.dashboard.totalOrders'), value: stats.totalOrders, icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
    { label: t('admin.dashboard.pending'), value: stats.pendingOrders, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: t('admin.dashboard.completed'), value: stats.completedOrders, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { label: t('admin.dashboard.games'), value: stats.totalGames, icon: Gamepad2, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { label: 'Total Packages', value: stats.totalPackages, icon: Package, color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/20' },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-white">{t('admin.dashboard.title')}</h1>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-32 rounded-xl bg-card border border-white/5 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {statCards.map((stat, i) => (
              <div key={i} className={`p-6 rounded-xl bg-card border ${stat.border} flex flex-col relative overflow-hidden group`}>
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-20 transition-transform group-hover:scale-110 ${stat.bg}`} />
                <stat.icon className={`w-8 h-8 mb-4 ${stat.color}`} />
                <div className="text-sm text-muted-foreground font-medium mb-1">{stat.label}</div>
                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-card border border-white/10 rounded-2xl overflow-hidden shadow-xl mt-4">
          <div className="px-6 py-5 border-b border-white/10 bg-white/[0.02]">
            <h3 className="font-bold text-white">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Player ID</th>
                  <th className="px-6 py-4">Game</th>
                  <th className="px-6 py-4">Package</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-mono text-white/70">#{order.id}</td>
                    <td className="px-6 py-4 font-mono text-xs text-white/80">{order.user_id}</td>
                    <td className="px-6 py-4">{order.games?.name}</td>
                    <td className="px-6 py-4 text-secondary font-mono text-xs">{order.packages?.amount} {order.packages?.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{format(new Date(order.created_at), 'MMM dd, HH:mm')}</td>
                    <td className="px-6 py-4 text-right">
                       <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                         order.status === 'pending' ? 'bg-amber-500/20 text-amber-500' :
                         order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                         order.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                         'bg-blue-500/20 text-blue-500'
                       }`}>
                         {order.status}
                       </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
