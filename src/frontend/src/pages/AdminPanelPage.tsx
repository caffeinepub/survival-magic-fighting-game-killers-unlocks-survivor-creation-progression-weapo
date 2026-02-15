import { useState } from 'react';
import {
  useGetCallerUserProfile,
  useAdminGrantCurrency,
  useAdminUnlockKiller,
  useAdminSetLevel,
  useAddWeapon,
  useAddPet,
  useGetAdminPanelEvents,
  useCreateAdminPanelEvent,
} from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Shield, Coins, Skull, TrendingUp, Sword, Heart, Calendar } from 'lucide-react';

const PET_QUICK_PICKS = ['Floof', 'Buddy', 'Void breaker', 'Neo', 'Beluga'];

export function AdminPanelPage() {
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const grantCurrency = useAdminGrantCurrency();
  const unlockKiller = useAdminUnlockKiller();
  const setLevel = useAdminSetLevel();
  const addWeapon = useAddWeapon();
  const addPet = useAddPet();
  const { data: events, isLoading: eventsLoading } = useGetAdminPanelEvents();
  const createEvent = useCreateAdminPanelEvent();

  const [currencyAmount, setCurrencyAmount] = useState('1000');
  const [selectedKiller, setSelectedKiller] = useState('');
  const [selectedSurvivor, setSelectedSurvivor] = useState('');
  const [newLevel, setNewLevel] = useState('10');
  const [weaponName, setWeaponName] = useState('');
  const [weaponDesc, setWeaponDesc] = useState('');
  const [petName, setPetName] = useState('');
  const [petDesc, setPetDesc] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile?.hasAdminPanel) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Card className="border-destructive/50">
          <CardContent className="py-12 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              You need to purchase the Admin Panel from the Shop to access these features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const survivors = profile?.survivors || [];
  const killers = profile?.killers || [];

  const handleCreateEvent = () => {
    if (!eventName.trim() || !eventDescription.trim()) return;
    
    createEvent.mutate(
      {
        eventName: eventName.trim(),
        description: eventDescription.trim(),
        timestamp: BigInt(Date.now()),
      },
      {
        onSuccess: () => {
          setEventName('');
          setEventDescription('');
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Shield className="w-10 h-10 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Full control over your game state</p>
        </div>
      </div>

      <Tabs defaultValue="currency" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="killers">Killers</TabsTrigger>
          <TabsTrigger value="level">Level</TabsTrigger>
          <TabsTrigger value="weapons">Weapons</TabsTrigger>
          <TabsTrigger value="pets">Pets</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="currency">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Grant Currency
              </CardTitle>
              <CardDescription>Add currency to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currency">Amount</Label>
                <Input
                  id="currency"
                  type="number"
                  value={currencyAmount}
                  onChange={(e) => setCurrencyAmount(e.target.value)}
                  min="1"
                />
              </div>
              <Button
                onClick={() => grantCurrency.mutate(BigInt(currencyAmount))}
                disabled={grantCurrency.isPending || !currencyAmount}
                className="w-full"
              >
                {grantCurrency.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Granting...
                  </>
                ) : (
                  'Grant Currency'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="killers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Skull className="w-5 h-5" />
                Unlock Killer
              </CardTitle>
              <CardDescription>Instantly unlock any killer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="killer">Select Killer</Label>
                <Select value={selectedKiller} onValueChange={setSelectedKiller}>
                  <SelectTrigger id="killer">
                    <SelectValue placeholder="Choose a killer" />
                  </SelectTrigger>
                  <SelectContent>
                    {killers.map((killer) => (
                      <SelectItem key={killer.id.toString()} value={killer.id.toString()}>
                        {killer.name} {killer.unlocked ? '(Unlocked)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => unlockKiller.mutate(BigInt(selectedKiller))}
                disabled={unlockKiller.isPending || !selectedKiller}
                className="w-full"
              >
                {unlockKiller.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  'Unlock Killer'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="level">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Set Level
              </CardTitle>
              <CardDescription>Change survivor level (1-2400)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="survivor">Select Survivor</Label>
                <Select value={selectedSurvivor} onValueChange={setSelectedSurvivor}>
                  <SelectTrigger id="survivor">
                    <SelectValue placeholder="Choose a survivor" />
                  </SelectTrigger>
                  <SelectContent>
                    {survivors.map((survivor) => (
                      <SelectItem key={survivor.name} value={survivor.name}>
                        {survivor.name} (Level {Number(survivor.level)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level">New Level (1-2400)</Label>
                <Input
                  id="level"
                  type="number"
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value)}
                  min="1"
                  max="2400"
                />
              </div>
              <Button
                onClick={() =>
                  setLevel.mutate({
                    survivorName: selectedSurvivor,
                    level: BigInt(newLevel),
                  })
                }
                disabled={setLevel.isPending || !selectedSurvivor || !newLevel}
                className="w-full"
              >
                {setLevel.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting Level...
                  </>
                ) : (
                  'Set Level'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weapons">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sword className="w-5 h-5" />
                Add Weapon
              </CardTitle>
              <CardDescription>Create a new weapon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="weaponName">Weapon Name</Label>
                <Input
                  id="weaponName"
                  value={weaponName}
                  onChange={(e) => setWeaponName(e.target.value)}
                  placeholder="e.g., Arcane Blade"
                />
              </div>
              <div>
                <Label htmlFor="weaponDesc">Description</Label>
                <Input
                  id="weaponDesc"
                  value={weaponDesc}
                  onChange={(e) => setWeaponDesc(e.target.value)}
                  placeholder="e.g., A blade infused with magic"
                />
              </div>
              <Button
                onClick={() => {
                  addWeapon.mutate(
                    {
                      name: weaponName,
                      description: weaponDesc,
                      attackBonus: BigInt(20),
                      defenseBonus: BigInt(5),
                      speedBonus: BigInt(10),
                      magicBonus: BigInt(15),
                    },
                    {
                      onSuccess: () => {
                        setWeaponName('');
                        setWeaponDesc('');
                      },
                    }
                  );
                }}
                disabled={addWeapon.isPending || !weaponName}
                className="w-full"
              >
                {addWeapon.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Weapon'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pets">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Add Pet
              </CardTitle>
              <CardDescription>Create a new pet companion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="petQuickPick">Quick Pick Pet Name</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    setPetName(value);
                  }}
                >
                  <SelectTrigger id="petQuickPick">
                    <SelectValue placeholder="Choose a pet name..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PET_QUICK_PICKS.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="petName">Pet Name</Label>
                <Input
                  id="petName"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="e.g., Shadow Wolf"
                />
              </div>
              <div>
                <Label htmlFor="petDesc">Description</Label>
                <Input
                  id="petDesc"
                  value={petDesc}
                  onChange={(e) => setPetDesc(e.target.value)}
                  placeholder="e.g., A loyal companion from the shadows"
                />
              </div>
              <Button
                onClick={() => {
                  addPet.mutate(
                    {
                      name: petName,
                      description: petDesc,
                      experienceBonus: BigInt(25),
                      levelBonus: BigInt(0),
                      dropRateBonus: BigInt(15),
                    },
                    {
                      onSuccess: () => {
                        setPetName('');
                        setPetDesc('');
                      },
                    }
                  );
                }}
                disabled={addPet.isPending || !petName}
                className="w-full"
              >
                {addPet.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Pet'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Create Event
              </CardTitle>
              <CardDescription>Create and manage your events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="eventName">Event Title</Label>
                  <Input
                    id="eventName"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g., Weekly Tournament"
                  />
                </div>
                <div>
                  <Label htmlFor="eventDescription">Event Description</Label>
                  <Textarea
                    id="eventDescription"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Describe your event..."
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleCreateEvent}
                  disabled={createEvent.isPending || !eventName.trim() || !eventDescription.trim()}
                  className="w-full"
                >
                  {createEvent.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Event...
                    </>
                  ) : (
                    'Create Event'
                  )}
                </Button>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Your Events</h3>
                {eventsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : events && events.length > 0 ? (
                  <div className="space-y-3">
                    {events.map((event) => (
                      <Card key={event.id.toString()} className="border-muted">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{event.eventName}</CardTitle>
                          <CardDescription className="text-xs">
                            {new Date(Number(event.timestamp)).toLocaleString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No events created yet. Create your first event above!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
