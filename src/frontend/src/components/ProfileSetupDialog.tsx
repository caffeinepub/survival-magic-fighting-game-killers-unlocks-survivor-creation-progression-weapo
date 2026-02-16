import { useCreatePlayerProfile, useSetUsername } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function ProfileSetupDialog() {
  const createProfile = useCreatePlayerProfile();
  const setUsername = useSetUsername();
  const { identity } = useInternetIdentity();
  const [copied, setCopied] = useState(false);
  const [username, setUsernameInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const principalId = identity?.getPrincipal().toString() || 'Principal ID unavailable';
  const isPrincipalAvailable = !!identity;

  const handleCreateProfile = async () => {
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    try {
      // First create the profile
      await createProfile.mutateAsync();
      
      // Then set the username
      await setUsername.mutateAsync(username.trim());
    } catch (error) {
      // Errors are already handled by the mutation's onError callbacks
      console.error('Profile creation error:', error);
    }
  };

  const handleCopyPrincipal = async () => {
    if (!isPrincipalAvailable) {
      toast.error('Principal ID is not available to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(principalId);
      setCopied(true);
      toast.success('Principal ID copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy Principal ID to clipboard');
    }
  };

  const isCreating = createProfile.isPending || setUsername.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-2 border-primary/20">
        <CardHeader className="text-center space-y-4">
          <img src="/assets/generated/game-logo.dim_512x512.png" alt="Game Logo" className="w-32 h-32 mx-auto" />
          <CardTitle className="text-3xl font-bold">Welcome, Survivor</CardTitle>
          <CardDescription className="text-base">
            Your journey begins here. Choose your username to enter the realm of arcane survival.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsernameInput(e.target.value)}
              disabled={isCreating}
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground">
              3-20 characters. Letters, numbers, and underscores only.
            </p>
          </div>

          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="text-xs text-muted-foreground">Advanced</span>
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              <label className="text-xs font-medium text-muted-foreground">Your Principal ID</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-muted rounded-md border border-border overflow-hidden">
                  <p className="text-xs font-mono truncate" title={principalId}>
                    {principalId}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyPrincipal}
                  disabled={!isPrincipalAvailable}
                  className="shrink-0"
                  title="Copy Principal ID"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your Principal ID is your unique blockchain identifier.
              </p>
            </CollapsibleContent>
          </Collapsible>

          <Button
            onClick={handleCreateProfile}
            disabled={isCreating || !isPrincipalAvailable || !username.trim()}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            {isCreating ? (
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
