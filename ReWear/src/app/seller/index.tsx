import { Redirect } from 'expo-router';

import { useAuth } from '@/controllers/AuthController';
import { useSellerController } from '@/controllers/useSellerController';
import { LoadingState } from '@/views/components/LoadingState';
import { SellerView } from '@/views/screens/SellerView';

export default function SellerRoute() {
  const { seller, isReady } = useAuth();
  if (!isReady) return <LoadingState />;
  if (!seller) return <Redirect href="/login" />;
  return <SellerScreen />;
}

function SellerScreen() {
  return <SellerView {...useSellerController()} />;
}
