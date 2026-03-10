import { useState } from 'react';
import { ExpenseProvider } from './context/ExpenseContext';
import Dashboard from './pages/Dashboard';
import CategoryPage from './pages/CategoryPage';
import type { Category } from './types';
import './App.css';

type View = { page: 'dashboard' } | { page: 'detail'; category: Category };

function AppContent() {
  const [view, setView] = useState<View>({ page: 'dashboard' });

  if (view.page === 'detail') {
    return (
      <CategoryPage
        category={view.category}
        onBack={() => setView({ page: 'dashboard' })}
      />
    );
  }

  return (
    <Dashboard onNavigate={category => setView({ page: 'detail', category })} />
  );
}

export default function App() {
  return (
    <ExpenseProvider>
      <AppContent />
    </ExpenseProvider>
  );
}
