import { useLocalSearchParams } from 'expo-router';

import { useArticleDetailController } from '@/controllers/useArticleDetailController';
import { ArticleDetailView } from '@/views/screens/ArticleDetailView';

export default function ArticleDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ArticleDetailView {...useArticleDetailController(id)} />;
}
