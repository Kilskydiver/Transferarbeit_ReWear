import { useLoginController } from '@/controllers/useLoginController';
import { LoginView } from '@/views/screens/LoginView';

export default function LoginRoute() {
  return <LoginView {...useLoginController()} />;
}
