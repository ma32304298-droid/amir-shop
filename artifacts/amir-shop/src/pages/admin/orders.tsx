import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminLayout } from '@/components/admin-layout';
import { supabase } from '@/lib/supabase';
import { Loader2, X, Save, ImageIcon, ExternalLink, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type Order = any;
type PaymentProof = { id: number; order_id: number; proof_url: string; status: string; created_at: string };

export default function AdminOrders() {
  const { t } = useTranslation();
  useAdminAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const [orderProofs, setOrderProofs] = useState<PaymentProof[]>([]);
  const [loadingProofs, setLoadingProofs] = useState(false);
  const [updatingProofId, setUpdatingProofId] = useState<number | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select(`*, games(name), packages(name, amount, price)`)
        .order('created_at', { ascending: false });
        
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      if (data) setOrders(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const openOrderModal = async (order: Order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.status);
    setUpdateNotes(order.notes || '');
    setOrderProofs([]);
    setIsModalOpen(true);

    // Fetch payment proofs for this order
    setLoadingProofs(true);
    try {
      const { data, error } = await supabase
        .from('payment_proofs')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setOrderProofs(data as PaymentProof[]);
    } catch (err: any) {
      console.error('Could not load proofs:', err.message);
    } finally {
      setLoadingProofs(false);
    }
  };

  const handleUpdateProofStatus = async (proofId: number, newStatus: string) => {
    setUpdatingProofId(proofId);
    try {
      const { error } = await supabase
        .from('payment_proofs')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', proofId);
      if (error) throw error;
      setOrderProofs(prev => prev.map(p => p.id === proofId ? { ...p, status: newStatus } : p));
      toast.success('Proof status updated');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdatingProofId(null);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setSavingStatus(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: updateStatus as any, notes: updateNotes, updated_at: new Date().toISOString() })
        .eq('id', selectedOrder.id);
        
      if (error) throw error;
      toast.success('Order updated');
      setIsModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">{t('admin.orders.title')}</h1>
          
          <div className="flex items-center gap-2 bg-card border border-white/10 rounded-lg p-1">
            {['all', 'pending', 'processing', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === status 
                    ? 'bg-primary text-white shadow-lg glow-primary' 
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">{t('admin.orders.columns.id')}</th>
                    <th className="px-6 py-4">Player / WhatsApp</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4">Currency</th>
                    <th className="px-6 py-4">{t('admin.orders.columns.date')}</th>
                    <th className="px-6 py-4">{t('admin.orders.columns.status')}</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 font-mono text-white/70">#{order.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-white text-xs">{order.user_id}</div>
                        {order.whatsapp && <div className="text-xs text-muted-foreground mt-0.5">📱 {order.whatsapp}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{order.games?.name}</div>
                        <div className="text-secondary font-mono text-xs mt-1 bg-secondary/10 inline-block px-1.5 rounded">{order.packages?.amount} {order.packages?.name}</div>
                      </td>
                      <td className="px-6 py-4 text-white/80">{order.currency}</td>
                      <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                        {format(new Date(order.created_at), 'MMM dd, HH:mm')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          order.status === 'pending' ? 'bg-amber-500/20 text-amber-500' :
                          order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                          order.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                          'bg-blue-500/20 text-blue-500'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openOrderModal(order)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded transition-colors text-xs font-medium border border-white/10"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No orders found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-white/10 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white">Order #{selectedOrder.id}</h2>
                <div className="text-sm text-muted-foreground">{format(new Date(selectedOrder.created_at), 'PPP p')}</div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              {/* Player Info */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-medium text-white/50 mb-3 text-xs uppercase tracking-wider">Player Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Player ID:</span> <span className="font-mono text-white">{selectedOrder.user_id}</span></div>
                  {selectedOrder.whatsapp && (
                    <div className="flex justify-between"><span className="text-muted-foreground">WhatsApp:</span> <span className="text-white">{selectedOrder.whatsapp}</span></div>
                  )}
                </div>
              </div>

              {/* Package Info */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-medium text-white/50 mb-3 text-xs uppercase tracking-wider">Package</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Game:</span> <span className="text-white font-medium">{selectedOrder.games?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Item:</span> <span className="text-secondary font-bold bg-secondary/10 px-2 rounded">{selectedOrder.packages?.amount} {selectedOrder.packages?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Price:</span> <span className="text-white font-bold">{selectedOrder.packages?.price?.toFixed(2)} {selectedOrder.currency}</span></div>
                </div>
              </div>

              {/* Payment Proof */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-medium text-white/50 mb-3 text-xs uppercase tracking-wider">Payment Proof</h3>
                {loadingProofs ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                  </div>
                ) : orderProofs.length === 0 ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <ImageIcon className="w-4 h-4" /> No proof uploaded yet
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {orderProofs.map((proof) => (
                      <div key={proof.id} className="flex flex-col gap-3">
                        <a href={proof.proof_url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-white/10 hover:border-primary/50 transition-colors group relative">
                          <img
                            src={proof.proof_url}
                            alt="Payment proof"
                            className="w-full max-h-48 object-contain bg-black/40"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                            <ExternalLink className="w-6 h-6 text-white" />
                          </div>
                        </a>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground">{format(new Date(proof.created_at), 'MMM dd, HH:mm')}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded font-medium ${
                              proof.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                              proof.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {proof.status}
                            </span>
                            <button
                              onClick={() => handleUpdateProofStatus(proof.id, 'approved')}
                              disabled={proof.status === 'approved' || updatingProofId === proof.id}
                              title="Approve"
                              className="p-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              {updatingProofId === proof.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleUpdateProofStatus(proof.id, 'rejected')}
                              disabled={proof.status === 'rejected' || updatingProofId === proof.id}
                              title="Reject"
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status & Notes */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-white/80">{t('admin.orders.updateStatus')}</label>
                <select 
                  value={updateStatus} 
                  onChange={e => setUpdateStatus(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <label className="text-sm font-medium text-white/80 mt-2">{t('admin.orders.notes')}</label>
                <textarea 
                  rows={3} 
                  value={updateNotes} 
                  onChange={e => setUpdateNotes(e.target.value)}
                  placeholder="Notes (visible to team)"
                  className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary resize-none" 
                />
                
                <button 
                  onClick={handleUpdateStatus}
                  disabled={savingStatus}
                  className="mt-2 w-full py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition-all glow-primary flex items-center justify-center gap-2"
                >
                  {savingStatus ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
