import { useGetCallerUserProfile, useEquipWeapon, useEquipPet } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check } from 'lucide-react';

export function InventoryPage() {
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const equipWeapon = useEquipWeapon();
  const equipPet = useEquipPet();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const weapons = profile?.weapons || [];
  const pets = profile?.pets || [];
  const equippedWeaponName = profile?.equippedWeapon?.name;
  const equippedPetName = profile?.equippedPet?.name;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Inventory</h1>
        <p className="text-muted-foreground">Manage your weapons and pets. Rewards from dungeons appear here!</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <img src="/assets/generated/icon-weapon.dim_128x128.png" alt="Weapons" className="w-12 h-12" />
          <h2 className="text-2xl font-semibold">Weapons</h2>
        </div>

        {weapons.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No weapons yet. Earn them through combat, dungeons, or use the admin panel!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weapons.map((weapon) => {
              const isEquipped = weapon.name === equippedWeaponName;
              return (
                <Card key={weapon.name} className={isEquipped ? 'border-primary' : 'border-primary/20'}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{weapon.name}</CardTitle>
                      {isEquipped && (
                        <Badge variant="default">
                          <Check className="w-3 h-3 mr-1" />
                          Equipped
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{weapon.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Attack: +{Number(weapon.attackBonus)}</div>
                      <div>Defense: +{Number(weapon.defenseBonus)}</div>
                      <div>Speed: +{Number(weapon.speedBonus)}</div>
                      <div>Magic: +{Number(weapon.magicBonus)}</div>
                    </div>
                    {!isEquipped && (
                      <Button
                        onClick={() => equipWeapon.mutate(weapon.name)}
                        disabled={equipWeapon.isPending}
                        className="w-full"
                        variant="outline"
                      >
                        Equip
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <img src="/assets/generated/icon-pet.dim_128x128.png" alt="Pets" className="w-12 h-12" />
          <h2 className="text-2xl font-semibold">Pets</h2>
        </div>

        {pets.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No pets yet. Find them in your adventures, dungeons, or use the admin panel!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map((pet) => {
              const isEquipped = pet.name === equippedPetName;
              return (
                <Card key={pet.name} className={isEquipped ? 'border-primary' : 'border-primary/20'}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{pet.name}</CardTitle>
                      {isEquipped && (
                        <Badge variant="default">
                          <Check className="w-3 h-3 mr-1" />
                          Equipped
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{pet.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>EXP Bonus: +{Number(pet.experienceBonus)}%</div>
                      <div>Drop Rate: +{Number(pet.dropRateBonus)}%</div>
                    </div>
                    {!isEquipped && (
                      <Button
                        onClick={() => equipPet.mutate(pet.name)}
                        disabled={equipPet.isPending}
                        className="w-full"
                        variant="outline"
                      >
                        Equip
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
