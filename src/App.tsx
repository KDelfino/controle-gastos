import { useState } from 'react';
import { ExpenseProvider } from './context/ExpenseContext';
import { PreferencesProvider } from './context/PreferencesContext';
import Dashboard from './pages/Dashboard';
import CategoryPage from './pages/CategoryPage';
import SalaryPage from './pages/SalaryPage';
import SettingsPage from './pages/SettingsPage';
import type { Category } from './types';
import './App.css';

type View 
  = { page: 'dashboard' } 
  | { page: 'detail'; category: Category | string }
  | { page: 'salary' }
  | { page: 'settings' };

function AppContent() {
  const [view, setView] = useState<View>({ page: 'dashboard' });

  if (view.page === 'settings') {
    return (
      <SettingsPage
        onBack={() => setView({ page: 'dashboard' })}
      />
    );
  }

  if (view.page === 'salary') {
    return (
      <SalaryPage
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
      if (page === 'salary') {
        setView({ page: 'salary' });
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
