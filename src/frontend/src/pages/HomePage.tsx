import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, Sword, Shield, Skull, Info } from 'lucide-react';

type Page = 'home' | 'survivors' | 'gameplay' | 'inventory' | 'killers' | 'shop' | 'admin' | 'clans' | 'dungeons' | 'updates' | 'social' | 'announcements' | 'aura';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { data: profile, isLoading } = useGetCallerUserProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasActiveSurvivor = !!profile?.activeSurvivor;
  const survivorCount = profile?.survivors?.length || 0;
  const unlockedKillers = profile?.killers?.filter((k) => k.unlocked).length || 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to Arcane Survival</h1>
        <p className="text-lg text-muted-foreground">
          Master magic and aura, face legendary killers, and survive the ultimate challenge.
        </p>
      </div>

      {!hasActiveSurvivor && (
        <Alert className="border-primary/50 bg-primary/10">
          <Info className="h-4 w-4" />
          <AlertDescription>
            You need to create a survivor before you can start combat. Visit the Survivors page to get started!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <CardTitle>Survivors</CardTitle>
                <CardDescription>Create and manage your characters</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You have {survivorCount} survivor{survivorCount !== 1 ? 's' : ''}
            </p>
            <Button onClick={() => onNavigate('survivors')} className="w-full">
              Manage Survivors
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sword className="w-8 h-8 text-primary" />
              <div>
                <CardTitle>Combat</CardTitle>
                <CardDescription>Fight and earn rewards</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {hasActiveSurvivor ? 'Ready for battle!' : 'Create a survivor first'}
            </p>
            <Button onClick={() => onNavigate('gameplay')} className="w-full" disabled={!hasActiveSurvivor}>
              Enter Combat
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <CardTitle>Inventory</CardTitle>
                <CardDescription>Weapons and pets</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {profile?.weapons?.length || 0} weapons, {profile?.pets?.length || 0} pets
            </p>
            <Button onClick={() => onNavigate('inventory')} className="w-full" variant="outline">
              View Inventory
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skull className="w-8 h-8 text-primary" />
              <div>
                <CardTitle>Killers</CardTitle>
                <CardDescription>Unlock legendary foes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {unlockedKillers} / 4 killers unlocked
            </p>
            <Button onClick={() => onNavigate('killers')} className="w-full" variant="outline">
              View Killers
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
