import { useTranslation } from 'react-i18next';
import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2, Upload, ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';

type Game = Database['public']['Tables']['games']['Row'];
type Package = Database['public']['Tables']['packages']['Row'];

export default function OrderForm() {
  const { gameId, packageId } = useParams<{ gameId: string; packageId: string }>();
  const { t } = useTranslation();

  const [game, setGame] = useState<Game | null>(null);
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);

  // Order form fields
  const [userId, setUserId] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Proof upload fields
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      if (!gameId || !packageId) return;
      const { data: gData } = await supabase.from('games').select('*').eq('id', parseInt(gameId)).single();
      const { data: pData } = await supabase.from('packages').select('*').eq('id', parseInt(packageId)).single();
      if (gData) setGame(gData);
      if (pData) setPkg(pData);
      setLoading(false);
    }
    loadData();
  }, [gameId, packageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!game || !pkg) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          game_id: game.id,
          package_id: pkg.id,
          user_id: userId,
          whatsapp: whatsapp || null,
          notes: notes || null,
          currency: pkg.currency,
          status: 'pending',
        })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setOrderId(data.id);
        toast.success(t('order.success'));
      }
    } catch (err: any) {
      toast.error(err.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Please select an image file (JPG, PNG, GIF, WebP)');
      return;
    }
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setProofPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUploadProof = async () => {
    if (!proofFile || !orderId) return;
    setUploading(true);
    try {
      const ext = proofFile.name.split('.').pop() || 'jpg';
      const filePath = `${orderId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, proofFile, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('payment_proofs')
        .insert({ order_id: orderId, proof_url: publicUrl, status: 'pending' });
      if (dbError) throw dbError;

      setProofUploaded(true);
      toast.success(t('order.uploadSuccess'));
    } catch (err: any) {
      toast.error(err.message || t('common.error'));
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="flex-1 w-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
  if (!game || !pkg) return <div className="p-8 text-center">Invalid request</div>;

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
      {!orderId && (
        <div className="mb-8">
          <Link href={`/games/${game.id}`} className="text-muted-foreground hover:text-primary flex items-center gap-2 w-fit">
            <ArrowLeft className="w-4 h-4" />
            {t('common.cancel')}
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-5 gap-8">
        {/* Summary sidebar */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="p-6 rounded-2xl bg-card border border-white/10 sticky top-24">
            <h3 className="font-bold text-lg mb-6 border-b border-white/10 pb-4">{t('order.package')}</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {game.image && <img src={game.image} alt="Game" className="w-full h-full object-cover" />}
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{game.name}</div>
                <div className="font-bold text-white">{pkg.amount} {pkg.name}</div>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between items-center text-lg">
              <span className="text-muted-foreground">{t('order.total')}</span>
              <span className="font-black text-secondary">{pkg.price.toFixed(2)} {pkg.currency}</span>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="md:col-span-3">

          {/* ── Step 1: Order form ── */}
          {!orderId && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 sm:p-8 rounded-2xl bg-card border border-white/10 shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-8 text-white">{t('order.title')}</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="userId" className="text-sm font-medium text-white/80">{t('order.playerId')} *</label>
                  <input
                    id="userId"
                    type="text"
                    required
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder={t('order.playerIdPlaceholder')}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-white/20"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="whatsapp" className="text-sm font-medium text-white/80">WhatsApp Number</label>
                  <input
                    id="whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-white/20"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="notes" className="text-sm font-medium text-white/80">Notes (optional)</label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional information..."
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-white/20 resize-none"
                  />
                </div>

                <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20 flex gap-3 text-sm text-secondary/90 mt-4">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>Please make sure your Player ID is correct. We cannot refund orders delivered to wrong IDs.</p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4 py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-all glow-primary flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {t('order.placeOrder')}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── Step 2: Upload payment proof ── */}
          {orderId && !proofUploaded && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 sm:p-8 rounded-2xl bg-card border border-primary/30 shadow-2xl"
            >
              {/* Order confirmed header */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Order confirmed</div>
                  <div className="font-mono font-bold text-white">#{orderId}</div>
                </div>
              </div>

              <h2 className="text-xl font-bold mb-2 text-white">{t('order.uploadProof')}</h2>
              <p className="text-muted-foreground text-sm mb-6">{t('order.uploadProofDesc')}</p>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all mb-6 ${
                  dragOver
                    ? 'border-primary bg-primary/10 scale-[1.01]'
                    : proofFile
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-white/20 bg-white/[0.02] hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />

                {proofFile && proofPreview ? (
                  <div className="relative p-4">
                    <img
                      src={proofPreview}
                      alt="Payment proof preview"
                      className="w-full max-h-56 object-contain rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setProofFile(null); setProofPreview(null); }}
                      className="absolute top-6 right-6 w-7 h-7 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="mt-3 text-center text-sm text-green-400 font-medium">{proofFile.name}</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-muted-foreground">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <p className="text-sm text-white/60 mb-1">{t('order.uploadProofDrag')}</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleUploadProof}
                  disabled={!proofFile || uploading}
                  className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-all glow-primary flex justify-center items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />{t('order.uploading')}</>
                  ) : (
                    <><Upload className="w-5 h-5" />{t('order.uploadBtn')}</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setProofUploaded(true)}
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  {t('order.skipUpload')}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Final confirmation ── */}
          {orderId && proofUploaded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 sm:p-10 rounded-2xl bg-card border border-primary/30 shadow-[0_0_40px_rgba(124,58,237,0.15)] flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h2 className="text-2xl font-bold mb-3 text-white">{t('order.uploadSuccess')}</h2>
              <div className="font-mono text-3xl font-black text-primary mb-3">#{orderId}</div>
              <p className="text-muted-foreground mb-8">{t('order.uploadSuccessDesc')}</p>

              <div className="flex gap-4">
                <Link
                  href="/orders"
                  className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors glow-primary"
                >
                  Track My Orders
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
