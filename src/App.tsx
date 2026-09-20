import { RoleProvider } from './context/RoleContext';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './router/AppRouter';

export default function App() {
  return (
    <RoleProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </RoleProvider>
  );
}
