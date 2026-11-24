import { useLocalSearchParams } from 'expo-router';

import { useArticleFormController } from '@/controllers/useArticleFormController';
import { ArticleFormView } from '@/views/screens/ArticleFormView';

export default function EditArticleRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ArticleFormView {...useArticleFormController(id)} />;
}
