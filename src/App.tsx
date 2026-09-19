import { RoleProvider } from './context/RoleContext';
import AppRouter from './router/AppRouter';

export default function App() {
  return (
    <RoleProvider>
      <AppRouter />
    </RoleProvider>
  );
}
