import { useArticleFormController } from '@/controllers/useArticleFormController';
import { ArticleFormView } from '@/views/screens/ArticleFormView';

export default function AddArticleRoute() {
  return <ArticleFormView {...useArticleFormController()} asTab />;
}
