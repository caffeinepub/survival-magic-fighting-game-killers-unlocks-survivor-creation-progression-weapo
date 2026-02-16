import { useGetCallerUserProfile, useClickAura, useRebirth } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, Sparkles, TrendingUp, RotateCcw, Info } from 'lucide-react';
import { useState } from 'react';

export function AuraClickerPage() {
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const clickAura = useClickAura();
  const rebirth = useRebirth();
  const [isRebirthDialogOpen, setIsRebirthDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const auraPower = profile?.auraPower || 0n;
  const auraLevel = profile?.auraLevel || 1n;
  const rebirthCount = profile?.rebirthCount || 0n;
  const rebirthMultiplier = profile?.rebirthMultiplier || 1n;

  // Calculate level requirement based on current level and rebirth count
  const calculateLevelRequirement = (level: bigint, rebirth: bigint): bigint => {
    const baseRequirement = level * 100n;
    const rebirthMult = rebirth === 0n ? 1n : rebirth * rebirth;
    return baseRequirement * rebirthMult;
  };

  const levelRequirement = calculateLevelRequirement(auraLevel, rebirthCount);
  const progressPercent = Number((auraPower * 100n) / levelRequirement);

  const isMaxRebirth = rebirthCount >= 1_000_000n;

  const handleClick = () => {
    clickAura.mutate();
  };

  const handleRebirth = () => {
    rebirth.mutate();
    setIsRebirthDialogOpen(false);
  };

  const formatNumber = (num: bigint): string => {
    const numStr = num.toString();
    if (numStr.length <= 6) {
      return Number(num).toLocaleString();
    }
    // For very large numbers, use scientific notation
    const magnitude = numStr.length - 1;
    const base = numStr[0] + '.' + numStr.slice(1, 3);
    return `${base}e${magnitude}`;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <img src="/assets/generated/icon-aura.dim_128x128.png" alt="Aura" className="w-16 h-16" />
          <h1 className="text-4xl font-bold">Aura Clicker</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Click to gain Aura Power, level up automatically, and rebirth for permanent multipliers!
        </p>
      </div>

      <Alert className="border-primary/50 bg-primary/10">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>How it works:</strong> Click the button to gain Aura Power. When you reach the level requirement, you'll
          automatically level up. Rebirth resets your Aura Power to 0 and Aura Level to 1, but increases your multiplier and
          makes future progress harder. Maximum rebirths: 1,000,000.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              <div>
                <CardTitle>Aura Power</CardTitle>
                <CardDescription>Current power accumulated</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-primary">{formatNumber(auraPower)}</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to Level {formatNumber(auraLevel + 1n)}</span>
                <span className="font-medium">{progressPercent.toFixed(1)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="text-xs text-muted-foreground text-right">
                {formatNumber(auraPower)} / {formatNumber(levelRequirement)}
              </div>
            </div>
            <Button
              onClick={handleClick}
              disabled={clickAura.isPending}
              className="w-full h-16 text-lg"
              size="lg"
            >
              {clickAura.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Gaining Power...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Click for Aura Power (+{formatNumber(rebirthMultiplier)})
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              <div>
                <CardTitle>Progression Stats</CardTitle>
                <CardDescription>Your current status</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Aura Level</span>
                <span className="text-xl font-bold text-primary">{formatNumber(auraLevel)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Rebirth Count</span>
                <span className="text-xl font-bold text-primary">{formatNumber(rebirthCount)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Power Multiplier</span>
                <span className="text-xl font-bold text-primary">{formatNumber(rebirthMultiplier)}x</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <RotateCcw className="w-8 h-8 text-destructive" />
            <div>
              <CardTitle>Rebirth</CardTitle>
              <CardDescription>Reset progress for permanent power boost</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Rebirth will reset your Aura Power to 0 and Aura Level to 1, but will increase your power multiplier and rebirth
              count. Each rebirth makes future progress harder but more rewarding.
            </p>
            {isMaxRebirth && (
              <Alert className="border-destructive/50 bg-destructive/10">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Maximum rebirth count reached!</strong> You have achieved the ultimate rebirth milestone of 1,000,000.
                  No further rebirths are possible.
                </AlertDescription>
              </Alert>
            )}
            {!isMaxRebirth && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Next Multiplier</span>
                  <span className="text-lg font-bold text-primary">{formatNumber((rebirthCount + 1n) * 2n)}x</span>
                </div>
              </div>
            )}
          </div>

          <AlertDialog open={isRebirthDialogOpen} onOpenChange={setIsRebirthDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full"
                size="lg"
                disabled={isMaxRebirth || rebirth.isPending}
              >
                {rebirth.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Rebirthing...
                  </>
                ) : (
                  <>
                    <RotateCcw className="mr-2 h-5 w-5" />
                    {isMaxRebirth ? 'Maximum Rebirths Reached' : 'Rebirth Now'}
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Rebirth</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>Are you sure you want to rebirth? This action will:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Reset your Aura Power to 0</li>
                    <li>Reset your Aura Level to 1</li>
                    <li>Increase your Rebirth Count to {formatNumber(rebirthCount + 1n)}</li>
                    <li>Increase your Power Multiplier to {formatNumber((rebirthCount + 1n) * 2n)}x</li>
                    <li>Make future level requirements harder</li>
                  </ul>
                  <p className="font-semibold mt-2">This action cannot be undone!</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRebirth} className="bg-destructive hover:bg-destructive/90">
                  Confirm Rebirth
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
