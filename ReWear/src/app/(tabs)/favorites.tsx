import { useFavoritesController } from '@/controllers/useFavoritesController';
import { FavoritesView } from '@/views/screens/FavoritesView';

export default function FavoritesRoute() {
  return <FavoritesView {...useFavoritesController()} />;
}
