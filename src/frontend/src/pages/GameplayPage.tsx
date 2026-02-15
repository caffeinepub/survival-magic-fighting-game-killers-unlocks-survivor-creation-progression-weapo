import { useState } from 'react';
import { useGetCallerUserProfile, useStartCombat, usePerformAttack } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle, Swords, Heart, Shield, Zap, Sparkles, Crown } from 'lucide-react';
import { ProgressionPanel } from '../components/ProgressionPanel';
import type { Enemy, CombatDetails } from '../backend';

const ENEMY_PRESETS: Enemy[] = [
  {
    name: 'Shadow Minion',
    health: 50n,
    attack: 10n,
    defense: 5n,
    speed: 8n,
    magic: 3n,
    goldReward: 25n,
    expReward: 15n,
  },
  {
    name: 'Dark Warrior',
    health: 100n,
    attack: 20n,
    defense: 12n,
    speed: 10n,
    magic: 8n,
    goldReward: 75n,
    expReward: 40n,
  },
  {
    name: 'Void Beast',
    health: 150n,
    attack: 30n,
    defense: 18n,
    speed: 15n,
    magic: 15n,
    goldReward: 150n,
    expReward: 80n,
  },
];

const BOSS_PRESETS: Enemy[] = [
  {
    name: 'Shadow Lord',
    health: 300n,
    attack: 50n,
    defense: 30n,
    speed: 25n,
    magic: 40n,
    goldReward: 5000n,
    expReward: 500n,
  },
  {
    name: 'Void Tyrant',
    health: 500n,
    attack: 75n,
    defense: 45n,
    speed: 35n,
    magic: 60n,
    goldReward: 25000n,
    expReward: 1500n,
  },
  {
    name: 'Arcane Overlord',
    health: 800n,
    attack: 100n,
    defense: 60n,
    speed: 50n,
    magic: 90n,
    goldReward: 100000n,
    expReward: 5000n,
  },
  {
    name: 'Eternal Nightmare',
    health: 1200n,
    attack: 150n,
    defense: 80n,
    speed: 70n,
    magic: 120n,
    goldReward: 250000n,
    expReward: 10000n,
  },
  {
    name: 'Primordial Chaos',
    health: 2000n,
    attack: 200n,
    defense: 100n,
    speed: 100n,
    magic: 180n,
    goldReward: 500000n,
    expReward: 25000n,
  },
  {
    name: 'Crimson Reaper',
    health: 1500n,
    attack: 175n,
    defense: 90n,
    speed: 85n,
    magic: 140n,
    goldReward: 350000n,
    expReward: 15000n,
  },
  {
    name: 'Frost Titan',
    health: 1800n,
    attack: 160n,
    defense: 120n,
    speed: 60n,
    magic: 150n,
    goldReward: 400000n,
    expReward: 18000n,
  },
  {
    name: 'Storm Warden',
    health: 1100n,
    attack: 140n,
    defense: 75n,
    speed: 95n,
    magic: 160n,
    goldReward: 280000n,
    expReward: 12000n,
  },
  {
    name: 'Inferno Drake',
    health: 2200n,
    attack: 220n,
    defense: 110n,
    speed: 90n,
    magic: 200n,
    goldReward: 480000n,
    expReward: 22000n,
  },
  {
    name: 'Abyssal Leviathan',
    health: 2500n,
    attack: 240n,
    defense: 130n,
    speed: 80n,
    magic: 220n,
    goldReward: 495000n,
    expReward: 28000n,
  },
  {
    name: 'Celestial Guardian',
    health: 1600n,
    attack: 190n,
    defense: 105n,
    speed: 110n,
    magic: 175n,
    goldReward: 420000n,
    expReward: 20000n,
  },
  {
    name: 'Dread Sovereign',
    health: 3000n,
    attack: 250n,
    defense: 140n,
    speed: 75n,
    magic: 240n,
    goldReward: 500000n,
    expReward: 30000n,
  },
];

export function GameplayPage() {
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const startCombat = useStartCombat();
  const performAttack = usePerformAttack();

  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);
  const [combatActive, setCombatActive] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [combatDetails, setCombatDetails] = useState<CombatDetails | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeSurvivor = profile?.activeSurvivor;

  if (!activeSurvivor) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Combat Arena</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to create and select an active survivor before entering combat. Visit the Survivors page to get
            started.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleStartFight = async (enemy: Enemy) => {
    try {
      await startCombat.mutateAsync(enemy);
      setSelectedEnemy(enemy);
      setCombatActive(true);
      setBattleLog([`Combat started against ${enemy.name}!`]);
      setCombatDetails({
        playerStats: activeSurvivor,
        enemyStats: enemy,
        playerHealth: activeSurvivor.stats.health,
        enemyHealth: enemy.health,
        rewardedCurrency: 0n,
        rewardedExp: 0n,
        status: {
          combatOngoing: true,
          enemyName: enemy.name,
          enemyHealth: enemy.health,
          playerHealth: activeSurvivor.stats.health,
          playerActiveSurvivor: activeSurvivor,
        },
        result: undefined,
      });
    } catch (error) {
      console.error('Failed to start combat:', error);
    }
  };

  const handleAttack = async () => {
    if (!selectedEnemy) return;

    try {
      const result = await performAttack.mutateAsync(selectedEnemy);
      
      const playerDamage = Number(result.playerStats.stats.attack);
      const enemyDamage = Number(result.enemyStats.attack);
      
      setBattleLog((prev) => [
        ...prev,
        `You dealt ${playerDamage} damage to ${result.enemyStats.name}!`,
        `${result.enemyStats.name} dealt ${enemyDamage} damage to you!`,
      ]);

      setCombatDetails(result);

      if (result.result) {
        setCombatActive(false);
        if (result.result.winner === 'player') {
          setBattleLog((prev) => [
            ...prev,
            `Victory! You earned ${Number(result.rewardedCurrency).toLocaleString()} gold and ${Number(result.rewardedExp).toLocaleString()} EXP!`,
          ]);
        } else {
          setBattleLog((prev) => [...prev, 'You were defeated!']);
        }
      }
    } catch (error) {
      console.error('Attack failed:', error);
    }
  };

  const handleNewFight = () => {
    setSelectedEnemy(null);
    setCombatActive(false);
    setBattleLog([]);
    setCombatDetails(null);
  };

  const isActionDisabled = startCombat.isPending || performAttack.isPending;

  const renderEnemyCard = (enemy: Enemy, isBoss: boolean = false) => (
    <Card key={enemy.name} className={isBoss ? 'border-primary/40 bg-primary/5' : 'border-muted'}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              {isBoss && <Crown className="w-5 h-5 text-primary" />}
              {enemy.name}
            </h3>
            <div className="flex gap-2 mt-1">
              <Badge variant={isBoss ? 'default' : 'outline'} className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                {Number(enemy.goldReward).toLocaleString()} Gold
              </Badge>
              <Badge variant={isBoss ? 'default' : 'outline'} className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                {Number(enemy.expReward).toLocaleString()} EXP
              </Badge>
            </div>
          </div>
          <Button
            onClick={() => handleStartFight(enemy)}
            disabled={isActionDisabled}
            size="sm"
            variant={isBoss ? 'default' : 'secondary'}
          >
            {startCombat.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Swords className="w-4 h-4 mr-1" />
                Fight
              </>
            )}
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {Number(enemy.health)} HP
          </div>
          <div className="flex items-center gap-1">
            <Swords className="w-3 h-3" />
            {Number(enemy.attack)} ATK
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {Number(enemy.defense)} DEF
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <img src="/assets/generated/icon-aura.dim_128x128.png" alt="Aura" className="w-16 h-16" />
        <div>
          <h1 className="text-3xl font-bold">Combat Arena</h1>
          <p className="text-muted-foreground">Master magic and aura to defeat your enemies</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Survivor</h2>
          <ProgressionPanel survivor={activeSurvivor} />

          {profile?.equippedWeapon && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <img src="/assets/generated/icon-weapon.dim_128x128.png" alt="Weapon" className="w-6 h-6" />
                  Equipped Weapon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{profile.equippedWeapon.name}</p>
                <p className="text-sm text-muted-foreground">{profile.equippedWeapon.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div>Attack: +{Number(profile.equippedWeapon.attackBonus)}</div>
                  <div>Defense: +{Number(profile.equippedWeapon.defenseBonus)}</div>
                  <div>Speed: +{Number(profile.equippedWeapon.speedBonus)}</div>
                  <div>Magic: +{Number(profile.equippedWeapon.magicBonus)}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {profile?.equippedPet && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <img src="/assets/generated/icon-pet.dim_128x128.png" alt="Pet" className="w-6 h-6" />
                  Equipped Pet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{profile.equippedPet.name}</p>
                <p className="text-sm text-muted-foreground">{profile.equippedPet.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div>EXP Bonus: +{Number(profile.equippedPet.experienceBonus)}%</div>
                  <div>Drop Rate: +{Number(profile.equippedPet.dropRateBonus)}%</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {!combatActive && !combatDetails?.result ? (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Select Your Enemy</CardTitle>
                <CardDescription>Choose an opponent to battle</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="enemies" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="enemies">Enemies</TabsTrigger>
                    <TabsTrigger value="bosses">
                      <Crown className="w-4 h-4 mr-1" />
                      Bosses
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="enemies" className="space-y-3 mt-4">
                    {ENEMY_PRESETS.map((enemy) => renderEnemyCard(enemy, false))}
                  </TabsContent>
                  <TabsContent value="bosses" className="space-y-3 mt-4">
                    {BOSS_PRESETS.map((enemy) => renderEnemyCard(enemy, true))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Battle in Progress</span>
                  {combatDetails?.result && (
                    <Badge variant={combatDetails.result.winner === 'player' ? 'default' : 'destructive'}>
                      {combatDetails.result.winner === 'player' ? 'Victory!' : 'Defeated'}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {selectedEnemy?.name} - {combatDetails?.result ? 'Battle Complete' : 'Fight!'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {combatDetails && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground">Your Health</p>
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-primary" />
                          <span className="text-lg font-bold">
                            {Number(combatDetails.status.playerHealth)} / {Number(combatDetails.playerStats.stats.health)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground">Enemy Health</p>
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-destructive" />
                          <span className="text-lg font-bold">
                            {Number(combatDetails.status.enemyHealth)} / {Number(combatDetails.enemyStats.health)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      <p className="text-sm font-semibold">Battle Log</p>
                      {battleLog.map((log, index) => (
                        <p key={index} className="text-sm text-muted-foreground">
                          {log}
                        </p>
                      ))}
                    </div>

                    {combatDetails.result && (
                      <div className="space-y-2 p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold">Rewards</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span>{Number(combatDetails.rewardedCurrency).toLocaleString()} Gold</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-primary" />
                            <span>{Number(combatDetails.rewardedExp).toLocaleString()} EXP</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {combatActive && !combatDetails.result && (
                        <Button onClick={handleAttack} disabled={isActionDisabled} className="flex-1">
                          {performAttack.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Attacking...
                            </>
                          ) : (
                            <>
                              <Swords className="mr-2 h-4 w-4" />
                              Attack
                            </>
                          )}
                        </Button>
                      )}
                      {combatDetails.result && (
                        <Button onClick={handleNewFight} className="flex-1">
                          New Fight
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
