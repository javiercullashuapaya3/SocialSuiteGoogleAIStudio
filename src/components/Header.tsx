import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import {
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
  onOpenConfig,
  onOpenLogs,
  activeTab = 'feed',
  onTabChange,
  syncStats,
}) => {
  const { userName, company, handleLogout, isDemoMode } = useAuth();
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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      {/* Nivel Superior: Branding Promptia.lat + Datos Empresa Cliente + Botones de Acción */}
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between py-3 gap-y-2.5 gap-x-4 border-b border-slate-100">
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
              <div className="w-10 h-10 rounded-xl bg-[#0B0F19] flex items-center justify-center p-1.5 shadow-xs border border-[#1E293B] transition-transform group-hover:scale-105 shrink-0">
                <img
                  src="/promptia_logo.png"
                  alt="Promptia.lat Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-[#0B0F19] text-sm tracking-tight leading-none block">
                  Social Suite
                </span>
                <span className="text-[11px] text-[#0369A1] group-hover:text-[#21B6EA] font-bold block leading-tight mt-0.5 transition-colors">
                  por Promptia.lat
                </span>
              </div>
            </a>

            {/* Separador vertical */}
            <div className="h-8 w-px bg-slate-200 hidden sm:block shrink-0" />

            {/* Ficha Destacada: Datos de la Empresa Cliente (Solo lectura / fijo) */}
            <div className="flex items-center gap-2.5 sm:gap-3 bg-[#F4F8FB] border border-slate-200 rounded-xl px-3 py-1.5">
              {company?.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-[#1E293B] text-[#21B6EA] font-bold flex items-center justify-center text-xs shadow-2xs shrink-0">
                  {company?.name ? company.name.charAt(0).toUpperCase() : 'C'}
                </div>
              )}

              <div className="flex flex-col justify-center min-w-0">
                {/* Fila 1: Nombre de la Empresa Cliente */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
                    Cliente:
                  </span>
                  <span
                    className="font-bold text-[#0B0F19] text-xs sm:text-sm tracking-tight truncate max-w-[160px] sm:max-w-[240px]"
                    title={`Empresa cliente asignada: ${company?.name || 'Mi Empresa'}`}
                  >
                    {company?.name || 'Mi Empresa'}
                  </span>
                  {isDemoMode && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0369A1] bg-[#E8F8FE] px-1.5 py-0.5 rounded border border-[#21B6EA]/40 shrink-0">
                      <Radio className="w-2.5 h-2.5 text-[#21B6EA]" /> Demo
                    </span>
                  )}
                </div>

                {/* Fila 2: Usuario activo y Fan Page de Facebook conectada */}
                <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                  <span className="whitespace-nowrap">
                    Usuario: <strong className="text-[#1E293B] font-semibold">{userName || 'Comercial'}</strong>
                  </span>

                  <span className="text-slate-300 hidden sm:inline" aria-hidden="true">·</span>

                  <div className="flex items-center gap-1.5 min-w-0">
                    {pageInfo?.name ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className="inline-flex items-center gap-1 text-[#0369A1] font-semibold text-[11px] max-w-[160px] sm:max-w-[240px] truncate"
                          title={`Página de Facebook: ${pageInfo.name} (ID: ${pageInfo.id})`}
                        >
                          <Facebook className="w-3 h-3 text-[#21B6EA] shrink-0" />
                          <span className="truncate">{pageInfo.name}</span>
                          {(pageInfo.verification_status === 'blue_verified' || pageInfo.verification_status === 'verified') && (
                            <span title="Página Verificada">
                              <BadgeCheck className="w-3 h-3 text-[#21B6EA] shrink-0" />
                            </span>
                          )}
                        </span>

                        {pageInfo.followers_count !== undefined && (
                          <span
                            className="hidden xl:inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 tabular-nums"
                            title={`${pageInfo.followers_count.toLocaleString()} seguidores en Facebook`}
                          >
                            <span className="text-slate-300" aria-hidden="true">·</span>
                            <Users className="w-2.5 h-2.5 text-slate-400" />
                            <span>{pageInfo.followers_count.toLocaleString()}</span>
                          </span>
                        )}
                      </div>
                    ) : company?.meta_page_id ? (
                      <span className="inline-flex items-center gap-1 text-[#1E293B] font-mono text-[10px] tabular-nums">
                        <Facebook className="w-3 h-3 text-[#21B6EA] shrink-0" />
                        <span>ID: {company.meta_page_id}</span>
                      </span>
                    ) : (
                      <span className="text-amber-700 text-[10px] font-medium">Sin página Meta</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Acciones principales */}
          <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
            {/* Botón Principal: Sincronizar Meta con IA */}
            <button
              id="btn-sync-meta-header"
              onClick={onSync}
              disabled={isSyncing}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs whitespace-nowrap shrink-0 ${
                isConfigured
                  ? 'bg-[#21B6EA] hover:bg-[#14A3D6] text-[#0B0F19] cursor-pointer'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
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
                {isSyncing ? 'Sincronizando...' : 'Sincronizar IA'}
              </span>
            </button>

            {/* Botón Secundario: Refrescar BD */}
            {onRefreshDb && (
              <button
                id="btn-refresh-db-header"
                onClick={onRefreshDb}
                disabled={isRefreshingDb || isSyncing}
                className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 bg-white hover:bg-[#F4F8FB] text-[#1E293B] shadow-2xs cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
                title="Recargar datos de la BD directamente (sin llamar a IA ni a Meta API)"
              >
                <Database className={`w-3.5 h-3.5 text-[#0369A1] ${isRefreshingDb ? 'animate-spin text-[#21B6EA]' : ''}`} />
                <span className="hidden md:inline">
                  {isRefreshingDb ? 'Recargando BD...' : 'Refrescar BD'}
                </span>
              </button>
            )}

            {/* Configuración rápida */}
            <button
              onClick={onOpenConfig}
              className={`p-2 rounded-xl transition-colors border cursor-pointer ${
                isConfigured
                  ? 'text-[#1E293B] hover:text-[#0B0F19] hover:bg-[#F4F8FB] border-slate-200'
                  : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-300'
              }`}
              title="Configuración rápida de credenciales"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Registros de sincronización */}
            <button
              onClick={onOpenLogs}
              className="p-2 text-[#1E293B] hover:text-[#0B0F19] hover:bg-[#F4F8FB] rounded-xl transition-colors border border-slate-200 cursor-pointer"
              title="Ver registros de sincronización"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Cerrar sesión */}
            <button
              id="btn-logout"
              onClick={handleLogout}
              className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200 cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nivel Inferior: Barra de Navegación de Pestañas + Estado del Sistema */}
        {onTabChange && (
          <div className="flex items-center justify-between py-2 gap-2 overflow-x-auto">
            <nav className="flex items-center gap-1 bg-[#F4F8FB] p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                id="nav-tab-feed"
                onClick={() => onTabChange('feed')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'feed'
                    ? 'bg-white text-[#0B0F19] border border-[#21B6EA]/40 shadow-2xs'
                    : 'text-slate-600 hover:text-[#0B0F19] hover:bg-white/60 border border-transparent'
                }`}
              >
                <LayoutGrid className={`w-3.5 h-3.5 ${activeTab === 'feed' ? 'text-[#21B6EA]' : 'text-slate-500'}`} />
                <span>Publicaciones</span>
                {syncStats?.posts !== undefined && (
                  <span
                    className={`text-[11px] font-mono tabular-nums ${
                      activeTab === 'feed' ? 'text-[#0369A1] font-bold' : 'text-slate-500'
                    }`}
                  >
                    ({syncStats.posts})
                  </span>
                )}
              </button>

              <button
                type="button"
                id="nav-tab-reports"
                onClick={() => onTabChange('reports')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'reports'
                    ? 'bg-white text-[#0B0F19] border border-[#21B6EA]/40 shadow-2xs'
                    : 'text-slate-600 hover:text-[#0B0F19] hover:bg-white/60 border border-transparent'
                }`}
              >
                <BarChart3 className={`w-3.5 h-3.5 ${activeTab === 'reports' ? 'text-[#21B6EA]' : 'text-[#0369A1]'}`} />
                <span>Reporte IA</span>
              </button>

              <button
                type="button"
                id="nav-tab-config"
                onClick={() => onTabChange('config')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'config'
                    ? 'bg-white text-[#0B0F19] border border-[#21B6EA]/40 shadow-2xs'
                    : 'text-slate-600 hover:text-[#0B0F19] hover:bg-white/60 border border-transparent'
                }`}
              >
                <Sliders className={`w-3.5 h-3.5 ${activeTab === 'config' ? 'text-[#21B6EA]' : 'text-slate-500'}`} />
                <span>Configuración de Meta</span>
              </button>
            </nav>

            {/* Indicador de estado a la derecha de la barra de navegación */}
            <div className="hidden md:flex items-center gap-3 text-xs text-slate-500 pr-1 shrink-0">
              {isConfigured ? (
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Meta Conectado</span>
                  {company?.meta_page_id && (
                    <code className="text-[10px] font-mono text-emerald-800 bg-white/90 px-1.5 py-0.2 rounded border border-emerald-200 tabular-nums">
                      ID: {company.meta_page_id}
                    </code>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 text-[11px] font-semibold">
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
