import { useGetCallerUserProfile, useUnlockNextKiller } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lock, Unlock } from 'lucide-react';

export function KillersPage() {
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const unlockNextKiller = useUnlockNextKiller();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const killers = profile?.killers || [];
  const unlockedCount = killers.filter((k) => k.unlocked).length;
  const canUnlockNext = unlockedCount < 13;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="space-y-4">
        <img
          src="/assets/generated/killer-silhouettes.dim_1200x400.png"
          alt="Killers"
          className="w-full h-auto rounded-lg border border-primary/20"
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Legendary Killers</h1>
            <p className="text-muted-foreground">
              Unlock powerful killers in order: Jason → Coolkidd → 1x1x1x1 → Noli → Spydersammy → Doodle → Arkey → Caylus → Steak → Cruz → King Arkey 👑 → 67 Kid → Zeus
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {unlockedCount} / 13 Unlocked
          </Badge>
        </div>
      </div>

      {canUnlockNext && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <p className="text-sm">Ready to unlock the next killer?</p>
            <Button onClick={() => unlockNextKiller.mutate()} disabled={unlockNextKiller.isPending}>
              {unlockNextKiller.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unlocking...
                </>
              ) : (
                <>
                  <Unlock className="mr-2 h-4 w-4" />
                  Unlock Next
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {killers.map((killer) => (
          <Card key={killer.id.toString()} className={killer.unlocked ? 'border-primary/20' : 'border-muted opacity-60'}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {killer.unlocked ? (
                      <Unlock className="w-5 h-5 text-primary" />
                    ) : (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                    {killer.name}
                  </CardTitle>
                  <CardDescription>{killer.description}</CardDescription>
                </div>
                <Badge variant={killer.unlocked ? 'default' : 'outline'}>
                  {killer.unlocked ? 'Unlocked' : 'Locked'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {killer.storyline && <p className="text-sm text-muted-foreground italic">{killer.storyline}</p>}
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-xs text-muted-foreground">Health</p>
                  <p className="font-bold">{Number(killer.stats.health)}</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-xs text-muted-foreground">Attack</p>
                  <p className="font-bold">{Number(killer.stats.attack)}</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-xs text-muted-foreground">Defense</p>
                  <p className="font-bold">{Number(killer.stats.defense)}</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-xs text-muted-foreground">Speed</p>
                  <p className="font-bold">{Number(killer.stats.speed)}</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-xs text-muted-foreground">Magic</p>
                  <p className="font-bold">{Number(killer.stats.magic)}</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-xs text-muted-foreground">Level</p>
                  <p className="font-bold">{Number(killer.stats.level)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
