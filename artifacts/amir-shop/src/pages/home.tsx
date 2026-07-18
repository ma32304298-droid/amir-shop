import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Zap, ShieldCheck, HeadphonesIcon, Gamepad2 } from 'lucide-react';
import { Database } from '@/lib/database.types';

type Game = Database['public']['Tables']['games']['Row'];

function Particles() {
  return (
    <div className="neon-particles">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 5 + 5}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGames() {
      const { data } = await supabase.from('games').select('*').eq('active', true);
      if (data) setGames(data);
      setLoading(false);
    }
    fetchGames();
  }, []);

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 overflow-hidden flex flex-col items-center justify-center text-center px-4">
        <Particles />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.15),transparent_70%)]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="z-10 max-w-3xl flex flex-col items-center"
        >
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium backdrop-blur-sm">
            🚀 The #1 Gaming Top-Up Destination
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight drop-shadow-2xl">
            {t('home.hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl">
            {t('home.hero.subtitle')}
          </p>
          <a href="#games" className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg glow-primary transition-all hover:-translate-y-1">
            {t('home.hero.cta')}
          </a>
        </motion.div>
      </section>

      {/* Features Strip */}
      <section className="w-full border-y border-white/10 bg-white/[0.02] py-12 relative z-10 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-2xl bg-secondary/10 text-secondary border border-secondary/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Zap className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white mb-1">{t('home.features.instant.title')}</h3>
                <p className="text-muted-foreground text-sm">{t('home.features.instant.desc')}</p>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white mb-1">{t('home.features.secure.title')}</h3>
                <p className="text-muted-foreground text-sm">{t('home.features.secure.desc')}</p>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-2xl bg-accent text-accent-foreground border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <HeadphonesIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white mb-1">{t('home.features.support.title')}</h3>
                <p className="text-muted-foreground text-sm">{t('home.features.support.desc')}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section id="games" className="w-full py-24 container mx-auto px-4 z-10 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('home.games.title')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto opacity-50" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-card border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>No games available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {games.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative flex flex-col bg-card rounded-2xl border border-white/5 overflow-hidden hover:border-primary/50 transition-colors duration-300 shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
                <div className="aspect-[3/4] w-full bg-muted relative overflow-hidden">
                  {game.image ? (
                    <img
                      src={game.image}
                      alt={game.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                      <Gamepad2 className="w-16 h-16 opacity-20" />
                    </div>
                  )}
                </div>
                
                <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex flex-col items-center text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-bold text-xl text-white mb-4 drop-shadow-md">
                    {game.name}
                  </h3>
                  
                  <Link
                    href={`/games/${game.id}`}
                    className="w-full py-3 rounded-lg bg-primary/90 text-white font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary glow-primary flex items-center justify-center"
                  >
                    {t('home.games.topUp')}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
