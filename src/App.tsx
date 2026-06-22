import { useState } from 'react';
import { ExpenseProvider, useExpenses } from './context/ExpenseContext';
import { PreferencesProvider } from './context/PreferencesContext';
import Dashboard from './pages/Dashboard';
import CategoryPage from './pages/CategoryPage';
import EarningsPage from './pages/EarningsPage';
import SettingsPage from './pages/SettingsPage';
import AuthScreen from './components/AuthScreen';
import type { Category } from './types';
import './App.css';
import { Loader } from 'lucide-react';

type View 
  = { page: 'dashboard' } 
  | { page: 'detail'; category: Category | string }
  | { page: 'earnings' }
  | { page: 'settings' };

function AppContent() {
  const { user, loading } = useExpenses();
  const [view, setView] = useState<View>({ page: 'dashboard' });

  // 1. Tela de carregamento enquanto o estado de autenticação ou banco de dados sincroniza
  if (loading) {
    return (
      <div className="auth-container">
        <Loader className="spinner" size={40} style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  // 2. Redireciona para login se o usuário não estiver autenticado
  if (!user) {
    return <AuthScreen />;
  }

  // 3. Páginas da aplicação (Apenas acessíveis se autenticado)
  if (view.page === 'settings') {
    return (
      <SettingsPage
        onBack={() => setView({ page: 'dashboard' })}
      />
    );
  }

  if (view.page === 'earnings') {
    return (
      <EarningsPage
        onBack={() => setView({ page: 'dashboard' })}
      />
    );
  }

  if (view.page === 'detail') {
    return (
      <CategoryPage
        category={view.category}
        onBack={() => setView({ page: 'dashboard' })}
      />
    );
  }

  return (
    <Dashboard onNavigate={(page, category) => {
      if (page === 'earnings') {
        setView({ page: 'earnings' });
      } else if (page === 'settings') {
        setView({ page: 'settings' });
      } else if (category) {
        setView({ page: 'detail', category });
      }
    }} />
  );
}

export default function App() {
  return (
    <PreferencesProvider>
      <ExpenseProvider>
        <AppContent />
      </ExpenseProvider>
    </PreferencesProvider>
  );
}
