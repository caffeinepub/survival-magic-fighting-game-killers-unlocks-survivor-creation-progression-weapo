import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, User, Sword, Users, Skull, ShoppingCart, Shield, LogOut, UsersRound, Map } from 'lucide-react';

type Page = 'home' | 'survivors' | 'gameplay' | 'inventory' | 'killers' | 'shop' | 'admin' | 'clans' | 'dungeons';

interface GameLayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function GameLayout({ children, currentPage, onNavigate }: GameLayoutProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: profile } = useGetCallerUserProfile();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const navItems = [
    { id: 'home' as Page, label: 'Home', icon: User },
    { id: 'survivors' as Page, label: 'Survivors', icon: Users },
    { id: 'gameplay' as Page, label: 'Combat', icon: Sword },
    { id: 'inventory' as Page, label: 'Inventory', icon: Shield },
    { id: 'killers' as Page, label: 'Killers', icon: Skull },
    { id: 'dungeons' as Page, label: 'Dungeons', icon: Map },
    { id: 'clans' as Page, label: 'Clans', icon: UsersRound },
    { id: 'shop' as Page, label: 'Shop', icon: ShoppingCart },
  ];

  if (profile?.hasAdminPanel) {
    navItems.push({ id: 'admin' as Page, label: 'Admin', icon: Shield });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/assets/generated/game-logo.dim_512x512.png" alt="Logo" className="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Arcane Survival</h1>
                <p className="text-sm text-muted-foreground">Master the arcane arts</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2 text-base font-semibold border-primary/30">
                <Coins className="w-4 h-4 mr-2 text-primary" />
                {profile?.currency?.toString() || '0'}
              </Badge>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? 'default' : 'ghost'}
                  onClick={() => onNavigate(item.id)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      <footer className="border-t border-border bg-card/30 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Built with love using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
