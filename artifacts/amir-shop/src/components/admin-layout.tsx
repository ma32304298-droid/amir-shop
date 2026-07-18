import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { LayoutDashboard, Gamepad2, PackageSearch, ShoppingCart, LogOut } from 'lucide-react';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { logout } = useAdminAuth();

  const links = [
    { href: '/admin/dashboard', label: t('admin.nav.dashboard'), icon: LayoutDashboard },
    { href: '/admin/games', label: t('admin.nav.games'), icon: Gamepad2 },
    { href: '/admin/packages', label: t('admin.nav.packages'), icon: PackageSearch },
    { href: '/admin/orders', label: t('admin.nav.orders'), icon: ShoppingCart },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full bg-background min-h-screen">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-sidebar border-r border-sidebar-border shrink-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] flex flex-col">
        <div className="p-6 border-b border-sidebar-border hidden md:block">
          <h2 className="font-black text-xl text-white tracking-widest text-glow uppercase">Admin Panel</h2>
        </div>
        
        <nav className="flex-1 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            // Using window.location.pathname for simple matching, wouter hook also works but context issues can arise
            const isActive = window.location.pathname === link.href;
            
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-primary/20 text-primary border border-primary/30 glow-primary' 
                    : 'text-sidebar-foreground/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border mt-auto hidden md:block">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="font-medium">{t('admin.nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
