import { useSearchController } from '@/controllers/useSearchController';
import { SearchView } from '@/views/screens/SearchView';

export default function SearchRoute() {
  return <SearchView {...useSearchController()} />;
}
