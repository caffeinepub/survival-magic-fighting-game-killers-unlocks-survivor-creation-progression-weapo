import { useState } from 'react';
import { useGetCallerUserProfile, useStartCombat, usePerformAttack, usePerformMagicAttack } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sword, Sparkles, Heart, Shield, Zap, Skull, Trophy, Info } from 'lucide-react';

// Type definitions for combat
type Enemy = any;
type CombatDetails = any;

const regularEnemies = [
  { name: 'Goblin Scout', health: 50n, attack: 10n, defense: 5n, speed: 8n, magic: 2n, goldReward: 25n, expReward: 15n },
  { name: 'Dark Wolf', health: 75n, attack: 15n, defense: 8n, speed: 12n, magic: 0n, goldReward: 40n, expReward: 25n },
  { name: 'Skeleton Warrior', health: 100n, attack: 20n, defense: 15n, speed: 6n, magic: 5n, goldReward: 60n, expReward: 35n },
  { name: 'Shadow Assassin', health: 80n, attack: 25n, defense: 10n, speed: 18n, magic: 8n, goldReward: 75n, expReward: 45n },
  { name: 'Fire Elemental', health: 120n, attack: 30n, defense: 12n, speed: 10n, magic: 25n, goldReward: 100n, expReward: 60n },
];

const bossEnemies = [
  { name: 'Corrupted Knight', health: 500n, attack: 50n, defense: 40n, speed: 15n, magic: 20n, goldReward: 5000n, expReward: 500n },
  { name: 'Ancient Dragon', health: 1000n, attack: 80n, defense: 60n, speed: 20n, magic: 50n, goldReward: 15000n, expReward: 1000n },
  { name: 'Lich King', health: 1500n, attack: 100n, defense: 70n, speed: 25n, magic: 80n, goldReward: 30000n, expReward: 1500n },
  { name: 'Demon Lord', health: 2000n, attack: 120n, defense: 80n, speed: 30n, magic: 100n, goldReward: 50000n, expReward: 2000n },
  { name: 'Void Titan', health: 2500n, attack: 150n, defense: 100n, speed: 35n, magic: 120n, goldReward: 75000n, expReward: 2500n },
  { name: 'Celestial Guardian', health: 3000n, attack: 180n, defense: 120n, speed: 40n, magic: 150n, goldReward: 100000n, expReward: 3000n },
  { name: 'Primordial Beast', health: 3500n, attack: 200n, defense: 140n, speed: 45n, magic: 180n, goldReward: 150000n, expReward: 3500n },
  { name: 'Chaos Incarnate', health: 4000n, attack: 250n, defense: 160n, speed: 50n, magic: 200n, goldReward: 200000n, expReward: 4000n },
  { name: 'Eternal Nightmare', health: 4500n, attack: 300n, defense: 180n, speed: 55n, magic: 250n, goldReward: 300000n, expReward: 4500n },
  { name: 'Reality Breaker', health: 5000n, attack: 350n, defense: 200n, speed: 60n, magic: 300n, goldReward: 400000n, expReward: 5000n },
  { name: 'Cosmic Horror', health: 6000n, attack: 400n, defense: 250n, speed: 65n, magic: 350n, goldReward: 450000n, expReward: 6000n },
  { name: 'The Absolute', health: 10000n, attack: 500n, defense: 300n, speed: 70n, magic: 500n, goldReward: 500000n, expReward: 10000n },
];

export function GameplayPage() {
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const startCombat = useStartCombat();
  const performAttack = usePerformAttack();
  const performMagicAttack = usePerformMagicAttack();

  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [combatDetails, setCombatDetails] = useState<CombatDetails | null>(null);
  const [isFighting, setIsFighting] = useState(false);

  const activeSurvivor = profile?.activeSurvivor;

  const handleStartCombat = async (enemy: Enemy) => {
    try {
      await startCombat.mutateAsync(enemy);
      setCurrentEnemy(enemy);
      setIsFighting(true);
      setCombatDetails(null);
    } catch (error) {
      console.error('Failed to start combat:', error);
    }
  };

  const handleAttack = async () => {
    if (!currentEnemy) return;
    try {
      const result = await performAttack.mutateAsync(currentEnemy);
      setCombatDetails(result);
      if (result.result) {
        setIsFighting(false);
        setCurrentEnemy(null);
      }
    } catch (error) {
      console.error('Attack failed:', error);
    }
  };

  const handleMagicAttack = async () => {
    if (!currentEnemy) return;
    try {
      const result = await performMagicAttack.mutateAsync(currentEnemy);
      setCombatDetails(result);
      if (result.result) {
        setIsFighting(false);
        setCurrentEnemy(null);
      }
    } catch (error) {
      console.error('Magic attack failed:', error);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!activeSurvivor) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert className="border-primary/50 bg-primary/10">
          <Info className="h-4 w-4" />
          <AlertDescription>
            You need to create and select an active survivor before entering combat. Visit the Survivors page to get started!
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const formatNumber = (num: bigint | number) => {
    return Number(num).toLocaleString();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Sword className="w-12 h-12 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Combat Arena</h1>
          <p className="text-muted-foreground">Battle enemies and earn rewards</p>
        </div>
      </div>

      {isFighting && currentEnemy && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skull className="w-6 h-6 text-destructive" />
              Fighting: {currentEnemy.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {combatDetails && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Your Health</span>
                  <span className="text-sm">{Number(combatDetails.playerHealth)}</span>
                </div>
                <Progress value={(Number(combatDetails.playerHealth) / Number(activeSurvivor.stats.health)) * 100} />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Enemy Health</span>
                  <span className="text-sm">{Number(combatDetails.enemyHealth)}</span>
                </div>
                <Progress value={(Number(combatDetails.enemyHealth) / Number(currentEnemy.health)) * 100} className="bg-destructive/20" />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleAttack} disabled={performAttack.isPending || performMagicAttack.isPending} className="flex-1">
                {performAttack.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sword className="w-4 h-4 mr-2" />
                )}
                Physical Attack
              </Button>
              <Button onClick={handleMagicAttack} disabled={performAttack.isPending || performMagicAttack.isPending} variant="secondary" className="flex-1">
                {performMagicAttack.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Magic Attack
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="regular" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="regular">Regular Enemies</TabsTrigger>
          <TabsTrigger value="bosses">Boss Fights</TabsTrigger>
        </TabsList>

        <TabsContent value="regular" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularEnemies.map((enemy, index) => (
              <Card key={index} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">{enemy.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    {formatNumber(enemy.goldReward)} gold • {formatNumber(enemy.expReward)} EXP
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-500" />
                      <span>{Number(enemy.health)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sword className="w-3 h-3 text-orange-500" />
                      <span>{Number(enemy.attack)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-blue-500" />
                      <span>{Number(enemy.defense)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      <span>{Number(enemy.speed)}</span>
                    </div>
                  </div>
                  <Button onClick={() => handleStartCombat(enemy)} disabled={isFighting || startCombat.isPending} className="w-full">
                    {startCombat.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fight'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bosses" className="space-y-4">
          <Alert className="border-destructive/50 bg-destructive/10">
            <Skull className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Boss enemies are extremely powerful. Make sure your survivor is well-equipped and leveled up!
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-4">
            {bossEnemies.map((enemy, index) => (
              <Card key={index} className="border-destructive/30 hover:border-destructive/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Skull className="w-5 h-5 text-destructive" />
                      {enemy.name}
                    </CardTitle>
                    <Badge variant="destructive">Boss</Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    {formatNumber(enemy.goldReward)} gold • {formatNumber(enemy.expReward)} EXP
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-500" />
                      <span>{formatNumber(enemy.health)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sword className="w-3 h-3 text-orange-500" />
                      <span>{Number(enemy.attack)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-blue-500" />
                      <span>{Number(enemy.defense)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-500" />
                      <span>{Number(enemy.magic)}</span>
                    </div>
                  </div>
                  <Button onClick={() => handleStartCombat(enemy)} disabled={isFighting || startCombat.isPending} variant="destructive" className="w-full">
                    {startCombat.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Challenge Boss'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
