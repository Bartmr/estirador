import { Layout } from 'src/components/routing/layout/layout';
import { LOGIN_ROUTE } from './login-routes';

function Content() {
  return null;
}

export function LoginTemplate() {
  return <Layout title={LOGIN_ROUTE.label}>{() => <Content />}</Layout>;
}
