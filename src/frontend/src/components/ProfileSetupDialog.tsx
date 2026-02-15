import { useCreatePlayerProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function ProfileSetupDialog() {
  const createProfile = useCreatePlayerProfile();

  const handleCreateProfile = () => {
    createProfile.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-2 border-primary/20">
        <CardHeader className="text-center space-y-4">
          <img src="/assets/generated/game-logo.dim_512x512.png" alt="Game Logo" className="w-32 h-32 mx-auto" />
          <CardTitle className="text-3xl font-bold">Welcome, Survivor</CardTitle>
          <CardDescription className="text-base">
            Your journey begins here. Create your profile to enter the realm of arcane survival.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleCreateProfile}
            disabled={createProfile.isPending}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            {createProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Create Profile'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
