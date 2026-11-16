import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { Database, RefreshCw } from 'lucide-react';

const AppContent: React.FC = () => {
  const { session, loading, isDemoMode } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] bg-brand-twilight flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-[#1E293B] border border-[#21B6EA]/35 text-[#21B6EA] flex items-center justify-center shadow-lg mb-4">
          <Database className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-white text-sm font-semibold tracking-tight">
          <RefreshCw className="w-4 h-4 animate-spin text-[#21B6EA]" />
          <span>Iniciando sesión segura...</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Cargando datos de la empresa</p>
      </div>
    );
  }

  if (!session && !isDemoMode) {
    return <LoginView />;
  }

  return <DashboardView />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
