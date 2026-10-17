import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import {
  RefreshCw,
  LogOut,
  Settings,
  FileText,
  Radio,
  LayoutGrid,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Facebook,
  Sparkles,
  BarChart3,
  Database,
  Users,
  BadgeCheck,
} from 'lucide-react';
import { fetchMetaPageInfo, MetaPageInfo } from '../services/metaSyncService';

interface HeaderProps {
  onSync: () => void;
  isSyncing: boolean;
  onRefreshDb?: () => void;
  isRefreshingDb?: boolean;
  onAnalyzeAi?: () => void;
  isAnalyzingAi?: boolean;
  onOpenConfig: () => void;
  onOpenLogs: () => void;
  onOpenSql?: () => void;
  activeTab?: 'feed' | 'reports' | 'config';
  onTabChange?: (tab: 'feed' | 'reports' | 'config') => void;
  syncStats?: { posts: number; comments: number; lastSync?: string };
}

export const Header: React.FC<HeaderProps> = ({
  onSync,
  isSyncing,
  onRefreshDb,
  isRefreshingDb = false,
  onAnalyzeAi,
  isAnalyzingAi = false,
  onOpenConfig,
  onOpenLogs,
  activeTab = 'feed',
  onTabChange,
  syncStats,
}) => {
  const { userName, company, companiesList, selectCompany, handleLogout, isDemoMode } = useAuth();
  const [pageInfo, setPageInfo] = useState<MetaPageInfo | null>(null);

  const isConfigured = Boolean(company?.meta_page_id && company?.meta_token);

  useEffect(() => {
    if (company?.meta_page_id) {
      fetchMetaPageInfo(company.meta_page_id, company.meta_token).then((info) => {
        if (info) setPageInfo(info);
      });
    } else {
      setPageInfo(null);
    }
  }, [company?.meta_page_id, company?.meta_token]);

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      {/* Nivel Superior: Branding Promptia + Datos Empresa Cliente + Botones de Acción */}
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between py-3 gap-y-2 gap-x-4 border-b border-stone-100">
          {/* Lado Izquierdo: Social Suite por Promptia.lat + Ficha de Empresa Cliente */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 min-w-0">
            {/* Branding Social Suite - Creado por Promptia.lat */}
            <a
              href="https://promptia.lat"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 shrink-0"
              title="Promptia.lat - Creador de Social Suite"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center p-1.5 shadow-xs border border-stone-800 transition-transform group-hover:scale-105 shrink-0">
                <img
                  src="/promptia_logo.png"
                  alt="Promptia.lat Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-stone-900 text-sm tracking-tight leading-none">
                    Social Suite
                  </span>
                </div>
                <span className="text-[10px] text-indigo-600 font-bold block leading-tight mt-0.5">
                  por Promptia.lat
                </span>
              </div>
            </a>

            {/* Separador vertical elegante */}
            <div className="h-8 w-px bg-stone-200 hidden sm:block shrink-0" />

            {/* Ficha Destacada: Datos de la Empresa Cliente */}
            <div className="flex items-center gap-2.5 sm:gap-3 bg-stone-50 hover:bg-stone-100/80 border border-stone-200 rounded-xl px-3 py-1.5 transition-colors shadow-2xs">
              {company?.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-9 h-9 rounded-lg object-cover border border-stone-200 shadow-2xs shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                  {company?.name ? company.name.charAt(0).toUpperCase() : 'C'}
                </div>
              )}

              <div className="flex flex-col justify-center min-w-0">
                {/* Fila 1: Selector o Nombre de la Empresa Cliente */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider shrink-0">
                    Cliente:
                  </span>
                  {companiesList && companiesList.length > 1 ? (
                    <select
                      value={company?.client_id || 1}
                      onChange={(e) => selectCompany?.(Number(e.target.value))}
                      className="font-bold text-stone-900 text-xs sm:text-sm bg-white border border-stone-300 rounded-md px-2 py-0.5 shadow-2xs focus:ring-2 focus:ring-indigo-500 cursor-pointer max-w-[150px] sm:max-w-[210px] truncate"
                      title="Cambiar empresa cliente activa"
                    >
                      {companiesList.map((c) => (
                        <option key={c.id} value={c.client_id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-bold text-stone-900 text-xs sm:text-sm tracking-tight truncate max-w-[150px] sm:max-w-[220px]">
                      {company?.name || 'Mi Empresa'}
                    </span>
                  )}
                  {isDemoMode && (
                    <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 shrink-0">
                      <Radio className="w-2.5 h-2.5 text-amber-600 animate-pulse" /> Demo
                    </span>
                  )}
                </div>

                {/* Fila 2: Usuario activo y Fan Page de Facebook conectada */}
                <div className="text-[11px] text-stone-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                  <span className="whitespace-nowrap">
                    Usuario: <strong className="text-stone-700 font-semibold">{userName || 'Comercial'}</strong>
                  </span>

                  <span className="text-stone-300 hidden sm:inline">•</span>

                  <div className="flex items-center gap-1.5 min-w-0">
                    {pageInfo?.name ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold text-[11px] border border-blue-200 max-w-[160px] sm:max-w-[240px] truncate"
                          title={`Página de Facebook: ${pageInfo.name} (ID: ${pageInfo.id})`}
                        >
                          <Facebook className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className="truncate">{pageInfo.name}</span>
                          {(pageInfo.verification_status === 'blue_verified' || pageInfo.verification_status === 'verified') && (
                            <span title="Página Verificada">
                              <BadgeCheck className="w-3 h-3 text-blue-600 shrink-0" />
                            </span>
                          )}
                        </span>

                        {pageInfo.followers_count !== undefined && (
                          <span
                            className="hidden xl:inline-flex items-center gap-1 text-[10px] font-medium text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200"
                            title={`${pageInfo.followers_count.toLocaleString()} seguidores en Facebook`}
                          >
                            <Users className="w-2.5 h-2.5 text-stone-400" />
                            <span>{pageInfo.followers_count.toLocaleString()}</span>
                          </span>
                        )}
                      </div>
                    ) : company?.meta_page_id ? (
                      <span className="inline-flex items-center gap-1 text-stone-700 bg-stone-100 px-2 py-0.5 rounded font-mono text-[10px] border border-stone-200">
                        <Facebook className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>ID: {company.meta_page_id}</span>
                      </span>
                    ) : (
                      <span className="text-amber-600 text-[10px] font-medium">Sin página Meta</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Acciones principales (Sincronizar, Refrescar, Ajustes, Cerrar sesión) */}
          <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
            {/* Botón Principal: Sincronizar Meta con IA */}
            <button
              id="btn-sync-meta-header"
              onClick={onSync}
              disabled={isSyncing}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
                isConfigured
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white cursor-pointer'
                  : 'bg-stone-200 text-stone-500 cursor-not-allowed'
              }`}
              title={
                isConfigured
                  ? 'Sincronizar publicaciones y comentarios desde Meta con IA'
                  : 'Debes configurar tu Meta Page ID y Token primero'
              }
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isSyncing ? 'Sincronizando con IA...' : 'Sincronizar Meta con IA'}
              </span>
              <span className="sm:hidden">
                {isSyncing ? 'Sincronizando...' : 'Sincronizar con IA'}
              </span>
            </button>

            {/* Botón Secundario: Refrescar BD */}
            {onRefreshDb && (
              <button
                id="btn-refresh-db-header"
                onClick={onRefreshDb}
                disabled={isRefreshingDb || isSyncing}
                className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 shadow-2xs cursor-pointer disabled:opacity-50"
                title="Recargar datos de la BD directamente (sin llamar a IA ni a Meta API)"
              >
                <Database className={`w-3.5 h-3.5 text-stone-600 ${isRefreshingDb ? 'animate-spin text-indigo-600' : ''}`} />
                <span className="hidden md:inline">
                  {isRefreshingDb ? 'Recargando BD...' : 'Refrescar BD'}
                </span>
              </button>
            )}

            {/* Configuración rápida */}
            <button
              onClick={onOpenConfig}
              className={`p-2 rounded-lg transition-colors border ${
                isConfigured
                  ? 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 border-stone-200'
                  : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-300'
              }`}
              title="Configuración rápida de credenciales"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Registros de sincronización */}
            <button
              onClick={onOpenLogs}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200"
              title="Ver registros de sincronización"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Cerrar sesión */}
            <button
              id="btn-logout"
              onClick={handleLogout}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200 cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nivel Inferior: Barra de Navegación de Pestañas + Estado del Sistema */}
        {onTabChange && (
          <div className="flex items-center justify-between py-2 gap-2 overflow-x-auto">
            <nav className="flex items-center gap-1 bg-stone-100/90 p-1 rounded-xl border border-stone-200/80 shrink-0">
              <button
                type="button"
                id="nav-tab-feed"
                onClick={() => onTabChange('feed')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'feed'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Publicaciones</span>
                {syncStats?.posts !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      activeTab === 'feed'
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {syncStats.posts}
                  </span>
                )}
              </button>

              <button
                type="button"
                id="nav-tab-reports"
                onClick={() => onTabChange('reports')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'reports'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
                <span>Reporte IA</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                  Dashboard
                </span>
              </button>

              <button
                type="button"
                id="nav-tab-config"
                onClick={() => onTabChange('config')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'config'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Configuración de Meta</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConfigured ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                  }`}
                  title={isConfigured ? 'Credenciales configuradas' : 'Requiere configuración'}
                />
              </button>
            </nav>

            {/* Indicador de estado a la derecha de la barra de navegación */}
            <div className="hidden md:flex items-center gap-3 text-xs text-stone-500 pr-1 shrink-0">
              {isConfigured ? (
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/70 text-[11px] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Meta Conectado</span>
                  {company?.meta_page_id && (
                    <code className="text-[10px] font-mono text-emerald-800 bg-white/80 px-1 py-0.2 rounded border border-emerald-200">
                      ID: {company.meta_page_id}
                    </code>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/70 text-[11px] font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Configuración pendiente</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
