import { useState } from 'react';
import { useGetCallerUserProfile, useCreateSurvivor, useSetActiveSurvivor } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Star } from 'lucide-react';
import { ProgressionPanel } from '../components/ProgressionPanel';

export function SurvivorsPage() {
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const createSurvivor = useCreateSurvivor();
  const setActiveSurvivor = useSetActiveSurvivor();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [health, setHealth] = useState('100');
  const [attack, setAttack] = useState('10');
  const [defense, setDefense] = useState('10');
  const [speed, setSpeed] = useState('10');
  const [magic, setMagic] = useState('10');

  const handleCreateSurvivor = () => {
    createSurvivor.mutate(
      {
        name,
        stats: {
          health: BigInt(health),
          attack: BigInt(attack),
          defense: BigInt(defense),
          speed: BigInt(speed),
          magic: BigInt(magic),
        },
      },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setName('');
          setHealth('100');
          setAttack('10');
          setDefense('10');
          setSpeed('10');
          setMagic('10');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const survivors = profile?.survivors || [];
  const activeSurvivorName = profile?.activeSurvivor?.name;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Survivors</h1>
          <p className="text-muted-foreground">Create and manage your characters</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Create Survivor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Survivor</DialogTitle>
              <DialogDescription>Design your character with custom stats</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="health">Health</Label>
                  <Input
                    id="health"
                    type="number"
                    value={health}
                    onChange={(e) => setHealth(e.target.value)}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="attack">Attack</Label>
                  <Input
                    id="attack"
                    type="number"
                    value={attack}
                    onChange={(e) => setAttack(e.target.value)}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="defense">Defense</Label>
                  <Input
                    id="defense"
                    type="number"
                    value={defense}
                    onChange={(e) => setDefense(e.target.value)}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="speed">Speed</Label>
                  <Input
                    id="speed"
                    type="number"
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                    min="1"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="magic">Magic</Label>
                  <Input
                    id="magic"
                    type="number"
                    value={magic}
                    onChange={(e) => setMagic(e.target.value)}
                    min="1"
                  />
                </div>
              </div>
              <Button onClick={handleCreateSurvivor} disabled={!name || createSurvivor.isPending} className="w-full">
                {createSurvivor.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Survivor'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {survivors.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No survivors yet. Create your first character!</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Survivor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {survivors.map((survivor) => (
            <div key={survivor.name} className="relative">
              {survivor.name === activeSurvivorName && (
                <Badge className="absolute -top-2 -right-2 z-10" variant="default">
                  <Star className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
              <ProgressionPanel survivor={survivor} />
              {survivor.name !== activeSurvivorName && (
                <Button
                  onClick={() => setActiveSurvivor.mutate(survivor.name)}
                  disabled={setActiveSurvivor.isPending}
                  className="w-full mt-2"
                  variant="outline"
                >
                  Set as Active
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
