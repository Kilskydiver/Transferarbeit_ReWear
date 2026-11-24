import { useHomeController } from '@/controllers/useHomeController';
import { HomeView } from '@/views/screens/HomeView';

export default function HomeRoute() {
  return <HomeView {...useHomeController()} />;
}
