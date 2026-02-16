import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Coins, Home, Users, Sword, Package, Skull, ShoppingCart, Settings, UsersRound, Map, Megaphone, UserPlus, Bell, Sparkles, User } from 'lucide-react';
import { SiX, SiFacebook, SiLinkedin, SiInstagram, SiGithub } from 'react-icons/si';

type Page = 'home' | 'survivors' | 'gameplay' | 'inventory' | 'killers' | 'shop' | 'admin' | 'clans' | 'dungeons' | 'updates' | 'social' | 'announcements' | 'aura';

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

  const formatCurrency = (amount: bigint) => {
    return Number(amount).toLocaleString();
  };

  const navItems = [
    { id: 'home' as Page, label: 'Home', icon: Home },
    { id: 'survivors' as Page, label: 'Survivors', icon: Users },
    { id: 'gameplay' as Page, label: 'Combat', icon: Sword },
    { id: 'inventory' as Page, label: 'Inventory', icon: Package },
    { id: 'killers' as Page, label: 'Killers', icon: Skull },
    { id: 'dungeons' as Page, label: 'Dungeons', icon: Map },
    { id: 'clans' as Page, label: 'Clans', icon: UsersRound },
    { id: 'aura' as Page, label: 'Aura', icon: Sparkles },
    { id: 'shop' as Page, label: 'Shop', icon: ShoppingCart },
    { id: 'updates' as Page, label: 'Updates', icon: Megaphone },
    { id: 'social' as Page, label: 'Social', icon: UserPlus },
    { id: 'announcements' as Page, label: 'Announcements', icon: Bell },
  ];

  if (profile?.hasAdminPanel) {
    navItems.push({ id: 'admin' as Page, label: 'Admin', icon: Settings });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/assets/generated/game-logo.dim_512x512.png" alt="Arcane Survival" className="w-10 h-10" />
              <h1 className="text-2xl font-bold text-primary">Arcane Survival</h1>
            </div>
            <div className="flex items-center gap-4">
              {profile?.username && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full border border-border">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{profile.username}</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <Coins className="w-5 h-5 text-primary" />
                <span className="font-semibold">{formatCurrency(profile?.currency || 0n)}</span>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-[73px] z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  variant={currentPage === item.id ? 'default' : 'ghost'}
                  size="sm"
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

      <footer className="border-t border-border bg-card/30 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-3 text-primary">Arcane Survival</h3>
              <p className="text-sm text-muted-foreground">
                Master magic and aura, face legendary killers, and survive the ultimate challenge.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <div className="flex flex-col gap-2">
                <button onClick={() => onNavigate('home')} className="text-sm text-muted-foreground hover:text-primary text-left">
                  Home
                </button>
                <button onClick={() => onNavigate('gameplay')} className="text-sm text-muted-foreground hover:text-primary text-left">
                  Combat Arena
                </button>
                <button onClick={() => onNavigate('shop')} className="text-sm text-muted-foreground hover:text-primary text-left">
                  Shop
                </button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Connect</h3>
              <div className="flex gap-3">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiX className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiFacebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiLinkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiInstagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiGithub className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Arcane Survival. Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'arcane-survival'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
