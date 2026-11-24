import { useLocalSearchParams } from 'expo-router';

import { useReservationController } from '@/controllers/useReservationController';
import { ReservationView } from '@/views/screens/ReservationView';

export default function ReserveRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ReservationView {...useReservationController(id)} />;
}
