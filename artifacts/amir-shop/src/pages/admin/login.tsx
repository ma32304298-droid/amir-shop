import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function AdminLogin() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const { login } = useAdminAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      setLocation('/admin/dashboard');
    } else {
      toast.error(t('admin.login.error'));
      setPassword('');
    }
  };

  return (
    <div className="flex-1 w-full flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-purple-500" />
        
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">RESTRICTED AREA</h1>
          <p className="text-sm text-muted-foreground mt-2">{t('admin.login.title')}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('admin.login.passwordPlaceholder')}
              className="w-full bg-background border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              autoFocus
            />
          </div>
          
          <button 
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-white font-bold transition-all hover:bg-primary/90 glow-primary"
          >
            {t('admin.login.login')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
