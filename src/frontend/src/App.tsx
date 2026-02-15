import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { AuthGate } from './components/AuthGate';
import { GameLayout } from './components/GameLayout';
import { ProfileSetupDialog } from './components/ProfileSetupDialog';
import { HomePage } from './pages/HomePage';
import { SurvivorsPage } from './pages/SurvivorsPage';
import { GameplayPage } from './pages/GameplayPage';
import { InventoryPage } from './pages/InventoryPage';
import { KillersPage } from './pages/KillersPage';
import { ShopPage } from './pages/ShopPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { ClansPage } from './pages/ClansPage';
import { DungeonPage } from './pages/DungeonPage';
import { UpdatesPage } from './pages/UpdatesPage';
import { SocialPage } from './pages/SocialPage';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';

type Page = 'home' | 'survivors' | 'gameplay' | 'inventory' | 'killers' | 'shop' | 'admin' | 'clans' | 'dungeons' | 'updates' | 'social';

export default function App() {
  const { identity } = useInternetIdentity();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const isAuthenticated = !!identity;

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthGate>
        {showProfileSetup ? (
          <ProfileSetupDialog />
        ) : (
          <GameLayout currentPage={currentPage} onNavigate={setCurrentPage}>
            {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
            {currentPage === 'survivors' && <SurvivorsPage />}
            {currentPage === 'gameplay' && <GameplayPage />}
            {currentPage === 'inventory' && <InventoryPage />}
            {currentPage === 'killers' && <KillersPage />}
            {currentPage === 'dungeons' && <DungeonPage />}
            {currentPage === 'updates' && <UpdatesPage />}
            {currentPage === 'social' && <SocialPage />}
            {currentPage === 'shop' && <ShopPage />}
            {currentPage === 'admin' && <AdminPanelPage />}
            {currentPage === 'clans' && <ClansPage />}
          </GameLayout>
        )}
      </AuthGate>
      <Toaster />
    </ThemeProvider>
  );
}
