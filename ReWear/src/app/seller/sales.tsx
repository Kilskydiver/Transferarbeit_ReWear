import { Redirect } from 'expo-router';

import { useAuth } from '@/controllers/AuthController';
import { useSalesController } from '@/controllers/useSalesController';
import { LoadingState } from '@/views/components/LoadingState';
import { SalesView } from '@/views/screens/SalesView';

export default function SalesRoute() {
  const { seller, isReady } = useAuth();
  if (!isReady) return <LoadingState />;
  if (!seller) return <Redirect href="/login" />;
  return <SalesScreen />;
}

function SalesScreen() {
  return <SalesView {...useSalesController()} />;
}
