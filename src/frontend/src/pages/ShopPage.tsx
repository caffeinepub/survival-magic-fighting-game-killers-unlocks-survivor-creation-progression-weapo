import { useGetCallerUserProfile, usePurchaseAdminPanel } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShoppingCart, Shield, Check, AlertCircle } from 'lucide-react';

const ADMIN_PANEL_COST = 10000;

export function ShopPage() {
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const purchaseAdminPanel = usePurchaseAdminPanel();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currency = Number(profile?.currency || 0);
  const hasAdminPanel = profile?.hasAdminPanel || false;
  const canAfford = currency >= ADMIN_PANEL_COST;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <ShoppingCart className="w-10 h-10 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Shop</h1>
          <p className="text-muted-foreground">Purchase powerful upgrades with your earned currency</p>
        </div>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Admin Panel</CardTitle>
                <CardDescription>Unlock full control over your game state</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {ADMIN_PANEL_COST.toLocaleString()} Currency
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="font-semibold">Features:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Grant yourself currency
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Add weapons to your inventory
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Add pets to your collection
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Unlock any killer instantly
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Set survivor level (1-2400)
              </li>
            </ul>
          </div>

          {hasAdminPanel ? (
            <Alert className="border-primary/50 bg-primary/10">
              <Check className="h-4 w-4" />
              <AlertDescription>You already own the Admin Panel! Access it from the navigation menu.</AlertDescription>
            </Alert>
          ) : !canAfford ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need {(ADMIN_PANEL_COST - currency).toLocaleString()} more currency to purchase the Admin Panel.
                Earn currency through combat!
              </AlertDescription>
            </Alert>
          ) : (
            <Button
              onClick={() => purchaseAdminPanel.mutate()}
              disabled={purchaseAdminPanel.isPending}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {purchaseAdminPanel.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Purchasing...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Purchase Admin Panel
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
