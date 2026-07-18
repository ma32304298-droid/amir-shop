import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Zap } from 'lucide-react';

type Game = Database['public']['Tables']['games']['Row'];
type Package = Database['public']['Tables']['packages']['Row'];

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  
  const [game, setGame] = useState<Game | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      
      const { data: gameData } = await supabase
        .from('games')
        .select('*')
        .eq('id', parseInt(id))
        .single();
        
      if (!gameData) {
        setLocation('/');
        return;
      }
      
      setGame(gameData);
      
      const { data: pkgData } = await supabase
        .from('packages')
        .select('*')
        .eq('game_id', gameData.id)
        .eq('active', true)
        .order('price', { ascending: true });
        
      if (pkgData) {
        setPackages(pkgData);
      }
      
      setLoading(false);
    }
    
    loadData();
  }, [id, setLocation]);

  if (loading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!game) return null;

  return (
    <div className="flex-1 w-full flex flex-col max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          {t('common.backToGames')}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Sidebar info */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-white/10 bg-card overflow-hidden shadow-2xl sticky top-24"
          >
            <div className="aspect-[4/3] w-full relative">
              {game.image ? (
                <img src={game.image} alt={game.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-90" />
              <h1 className="absolute bottom-4 left-6 right-6 text-3xl font-bold text-white text-glow drop-shadow-xl z-10">
                {game.name}
              </h1>
            </div>
          </motion.div>
        </div>

        {/* Packages selection */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-white">{t('game.selectPackage')}</h2>
          </div>

          {packages.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-white/20 bg-white/5">
              <p className="text-muted-foreground">No packages available for this game right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {packages.map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link 
                    href={`/order/${game.id}/${pkg.id}`}
                    className="group flex flex-col justify-between p-6 rounded-xl border border-white/10 bg-card/50 hover:bg-card hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors" />
                    
                    <div className="relative z-10">
                      <div className="font-bold text-xl text-white mb-1 group-hover:text-primary transition-colors">
                        {pkg.amount} {pkg.name}
                      </div>
                      {pkg.description && (
                        <div className="text-sm text-muted-foreground mt-1">{pkg.description}</div>
                      )}
                      <div className="text-2xl font-black text-secondary flex items-end gap-1 mt-4">
                        {pkg.price.toFixed(2)} <span className="text-sm font-medium text-muted-foreground mb-1">{pkg.currency}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                      <span>{t('game.buyNow')}</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
