import React, { useState } from 'react';
import { MetaPost, MetaPageInfo } from '../types';
import { MessageSquare, ExternalLink, Calendar, Clock, Sparkles, BarChart2, Database, BadgeCheck } from 'lucide-react';
import { isGenericPlaceholderName } from '../services/metaSyncService';

interface PostCardProps {
  post: MetaPost;
  onSelect: (post: MetaPost) => void;
  onRefreshPostAi?: (post: MetaPost) => void;
  isRefreshing?: boolean;
  onRefreshPostDb?: (post: MetaPost) => void;
  isRefreshingDb?: boolean;
  pageInfo?: MetaPageInfo | null;
  companyName?: string;
  onAnalyzeAi?: (post: MetaPost) => void;
  isAnalyzingAi?: boolean;
  onSyncComments?: (post: MetaPost) => void;
  isSyncingComments?: boolean;
}

type DimensionKey = 'SENTIMIENTO' | 'INTERES' | 'PRIORIDAD';

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onSelect,
  onRefreshPostAi,
  isRefreshing = false,
  onRefreshPostDb,
  isRefreshingDb = false,
  pageInfo,
  companyName,
  onAnalyzeAi,
  isAnalyzingAi = false,
  onSyncComments,
  isSyncingComments = false,
}) => {
  const [activeDimension, setActiveDimension] = useState<DimensionKey>('SENTIMIENTO');

  const attachment = post.raw_data?.attachments?.data?.[0];
  const imageUrl = attachment?.media?.image?.src;

  const detailed = post.raw_data?.detailed_distribution;
  const sentimentFallback = post.raw_data?.sentiment_distribution;
  const interestFallback = post.raw_data?.interest_distribution;
  const priorityFallback = post.raw_data?.priority_distribution;

  // 1. DIMENSIÓN: SENTIMIENTO (5 categorías)
  const sentimientoBars = detailed?.sentimiento
    ? [
        {
          category: 'MUY NEGATIVO',
          short: 'M.Neg',
          count: Number(detailed.sentimiento['MUY NEGATIVO'] ?? 0),
          color: 'bg-rose-700',
          textColor: 'text-rose-700',
        },
        {
          category: 'NEGATIVO',
          short: 'Neg',
          count: Number(detailed.sentimiento['NEGATIVO'] ?? 0),
          color: 'bg-rose-500',
          textColor: 'text-rose-600',
        },
        {
          category: 'NEUTRO',
          short: 'Neutro',
          count: Number(detailed.sentimiento['NEUTRO'] ?? detailed.sentimiento['NEUTRAL'] ?? 0),
          color: 'bg-slate-400',
          textColor: 'text-slate-600',
        },
        {
          category: 'POSITIVO',
          short: 'Pos',
          count: Number(detailed.sentimiento['POSITIVO'] ?? 0),
          color: 'bg-emerald-500',
          textColor: 'text-emerald-600',
        },
        {
          category: 'MUY POSITIVO',
          short: 'M.Pos',
          count: Number(detailed.sentimiento['MUY POSITIVO'] ?? 0),
          color: 'bg-emerald-700',
          textColor: 'text-emerald-700',
        },
      ]
    : [
        {
          category: 'MUY NEGATIVO',
          short: 'M.Neg',
          count: 0,
          color: 'bg-rose-700',
          textColor: 'text-rose-700',
        },
        {
          category: 'NEGATIVO',
          short: 'Neg',
          count: Number(sentimentFallback?.negativo ?? 0),
          color: 'bg-rose-500',
          textColor: 'text-rose-600',
        },
        {
          category: 'NEUTRO',
          short: 'Neutro',
          count: Number(sentimentFallback?.neutral ?? 0),
          color: 'bg-slate-400',
          textColor: 'text-slate-600',
        },
        {
          category: 'POSITIVO',
          short: 'Pos',
          count: Number(sentimentFallback?.positivo ?? 0),
          color: 'bg-emerald-500',
          textColor: 'text-emerald-600',
        },
        {
          category: 'MUY POSITIVO',
          short: 'M.Pos',
          count: 0,
          color: 'bg-emerald-700',
          textColor: 'text-emerald-700',
        },
      ];

  // 2. DIMENSIÓN: INTERÉS (Escala Brand Book: Slate -> Capri Blue -> Navy Ink -> Obsidian Black)
  const interesBars = detailed?.interes
    ? [
        {
          category: 'MUY BAJO',
          short: 'M.Bajo',
          count: Number(detailed.interes['MUY BAJO'] ?? detailed.interes['NINGUNO'] ?? 0),
          color: 'bg-slate-400',
          textColor: 'text-slate-600',
        },
        {
          category: 'BAJO',
          short: 'Bajo',
          count: Number(detailed.interes['BAJO'] ?? 0),
          color: 'bg-sky-300',
          textColor: 'text-slate-600',
        },
        {
          category: 'MEDIO',
          short: 'Medio',
          count: Number(detailed.interes['MEDIO'] ?? 0),
          color: 'bg-[#21B6EA]',
          textColor: 'text-[#0369A1]',
        },
        {
          category: 'ALTO',
          short: 'Alto',
          count: Number(detailed.interes['ALTO'] ?? 0),
          color: 'bg-[#1E293B]',
          textColor: 'text-[#1E293B]',
        },
        {
          category: 'MUY ALTO',
          short: 'M.Alto',
          count: Number(detailed.interes['MUY ALTO'] ?? 0),
          color: 'bg-[#0B0F19]',
          textColor: 'text-[#0B0F19]',
        },
      ]
    : [
        {
          category: 'MUY BAJO',
          short: 'M.Bajo',
          count: Number(interestFallback?.muy_bajo ?? 0),
          color: 'bg-slate-400',
          textColor: 'text-slate-600',
        },
        {
          category: 'BAJO',
          short: 'Bajo',
          count: Number(interestFallback?.bajo ?? 0),
          color: 'bg-sky-300',
          textColor: 'text-slate-600',
        },
        {
          category: 'MEDIO',
          short: 'Medio',
          count: Number(interestFallback?.medio ?? 0),
          color: 'bg-[#21B6EA]',
          textColor: 'text-[#0369A1]',
        },
        {
          category: 'ALTO',
          short: 'Alto',
          count: Number(interestFallback?.alto ?? 0),
          color: 'bg-[#1E293B]',
          textColor: 'text-[#1E293B]',
        },
        {
          category: 'MUY ALTO',
          short: 'M.Alto',
          count: Number(interestFallback?.muy_alto ?? 0),
          color: 'bg-[#0B0F19]',
          textColor: 'text-[#0B0F19]',
        },
      ];

  // 3. DIMENSIÓN: PRIORIDAD
  const prioridadBars = detailed?.prioridad
    ? [
        {
          category: 'MUY BAJA',
          short: 'M.Baja',
          count: Number(detailed.prioridad['MUY BAJA'] ?? 0),
          color: 'bg-slate-400',
          textColor: 'text-slate-600',
        },
        {
          category: 'BAJA',
          short: 'Baja',
          count: Number(detailed.prioridad['BAJA'] ?? 0),
          color: 'bg-emerald-500',
          textColor: 'text-emerald-600',
        },
        {
          category: 'MEDIA',
          short: 'Media',
          count: Number(detailed.prioridad['MEDIA'] ?? 0),
          color: 'bg-amber-500',
          textColor: 'text-amber-600',
        },
        {
          category: 'ALTA',
          short: 'Alta',
          count: Number(detailed.prioridad['ALTA'] ?? 0),
          color: 'bg-orange-500',
          textColor: 'text-orange-600',
        },
        {
          category: 'MUY ALTA',
          short: 'M.Alta',
          count: Number(detailed.prioridad['MUY ALTA'] ?? 0),
          color: 'bg-rose-600',
          textColor: 'text-rose-700',
        },
      ]
    : [
        {
          category: 'MUY BAJA',
          short: 'M.Baja',
          count: Number(priorityFallback?.muy_baja ?? 0),
          color: 'bg-slate-400',
          textColor: 'text-slate-600',
        },
        {
          category: 'BAJA',
          short: 'Baja',
          count: Number(priorityFallback?.baja ?? 0),
          color: 'bg-emerald-500',
          textColor: 'text-emerald-600',
        },
        {
          category: 'MEDIA',
          short: 'Media',
          count: Number(priorityFallback?.media ?? 0),
          color: 'bg-amber-500',
          textColor: 'text-amber-600',
        },
        {
          category: 'ALTA',
          short: 'Alta',
          count: Number(priorityFallback?.alta ?? 0),
          color: 'bg-orange-500',
          textColor: 'text-orange-600',
        },
        {
          category: 'MUY ALTA',
          short: 'M.Alta',
          count: Number(priorityFallback?.muy_alta ?? 0),
          color: 'bg-rose-600',
          textColor: 'text-rose-700',
        },
      ];

  const totalSentimiento = sentimientoBars.reduce((acc, b) => acc + b.count, 0);
  const totalInteres = interesBars.reduce((acc, b) => acc + b.count, 0);
  const totalPrioridad = prioridadBars.reduce((acc, b) => acc + b.count, 0);

  const hasAnyAiData = totalSentimiento > 0 || totalInteres > 0 || totalPrioridad > 0;

  const currentBars =
    activeDimension === 'SENTIMIENTO'
      ? sentimientoBars
      : activeDimension === 'INTERES'
      ? interesBars
      : prioridadBars;

  const currentTotal =
    activeDimension === 'SENTIMIENTO'
      ? totalSentimiento
      : activeDimension === 'INTERES'
      ? totalInteres
      : totalPrioridad;

  const effectiveCommentsCount = Math.max(post.comments_count || 0, currentTotal);
  const maxVal = Math.max(...currentBars.map((b) => b.count), 1);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('es-ES', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const isRecentlyUpdated = () => {
    if (!post.updated_time || !post.created_time) return false;
    return new Date(post.updated_time).getTime() - new Date(post.created_time).getTime() > 60000;
  };

  const handleRefreshClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRefreshPostAi) {
      onRefreshPostAi(post);
    } else if (onAnalyzeAi) {
      onAnalyzeAi(post);
    } else if (onSyncComments) {
      onSyncComments(post);
    }
  };

  const handleRefreshDbClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRefreshPostDb) {
      onRefreshPostDb(post);
    }
  };

  const activeLoading = isRefreshing || isAnalyzingAi || isSyncingComments;

  return (
    <div
      id={`post-card-${post.meta_post_id}`}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:border-[#21B6EA] hover:shadow-md transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Attachment preview if image exists */}
        {imageUrl && (
          <div className="relative h-44 w-full bg-[#0B0F19] overflow-hidden border-b border-slate-200">
            <img
              src={imageUrl}
              alt="Adjunto de publicación"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {attachment?.type && (
              <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0B0F19]/80 text-white backdrop-blur-xs uppercase tracking-wider">
                {attachment.type}
              </span>
            )}
          </div>
        )}

        <div className="p-4 sm:p-5">
          {/* Cabecera del Autor / Fan Page en la tarjeta */}
          {(() => {
            const rawAuthor = post.raw_data?.from?.name;
            const authorDisplayName =
              (rawAuthor && !isGenericPlaceholderName(rawAuthor) && rawAuthor) ||
              (pageInfo?.name && !isGenericPlaceholderName(pageInfo.name) && pageInfo.name) ||
              (companyName && !isGenericPlaceholderName(companyName) && companyName) ||
              'ELITEC';
            const avatarSrc =
              post.raw_data?.from?.picture?.data?.url ||
              pageInfo?.picture ||
              (companyName?.toLowerCase().includes('elitec') ? '/elitec_logo.png' : undefined);

            return (
              <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={authorDisplayName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#0B0F19] text-[#21B6EA] font-bold text-xs flex items-center justify-center shrink-0">
                      {authorDisplayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[#0B0F19] text-xs truncate max-w-[170px]" title={authorDisplayName}>
                        {authorDisplayName}
                      </span>
                      {(pageInfo?.verification_status === 'blue_verified' || pageInfo?.verification_status === 'verified') && (
                        <BadgeCheck className="w-3.5 h-3.5 text-[#21B6EA] shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block font-mono tabular-nums">
                      {formatDate(post.created_time)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                    ID: {post.meta_post_id.slice(-8)}
                  </span>
                  {post.permalink_url && (
                    <a
                      href={post.permalink_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-[#21B6EA] transition-colors p-1"
                      title="Abrir publicación en Facebook"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Metadatos limpios de estado IA (sin exceso de píldoras) */}
          {(hasAnyAiData || isRecentlyUpdated()) && (
            <div className="flex items-center gap-2 text-[11px] font-semibold mb-2">
              {hasAnyAiData && (
                <span className="inline-flex items-center gap-1 text-[#0369A1]">
                  <Sparkles className="w-3 h-3 text-[#21B6EA]" />
                  <span>Analizado con IA</span>
                </span>
              )}
              {hasAnyAiData && isRecentlyUpdated() && (
                <span className="text-slate-300" aria-hidden="true">·</span>
              )}
              {isRecentlyUpdated() && (
                <span className="text-amber-700">Modificado</span>
              )}
            </div>
          )}

          {/* Post message */}
          <p className="text-[#1E293B] text-sm line-clamp-3 leading-relaxed mb-3.5">
            {post.message || <span className="italic text-slate-400">Publicación sin texto</span>}
          </p>

          {/* Gráfico de barras por dimensión */}
          <div className="mb-3 p-3 bg-[#F4F8FB] rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between gap-1 mb-2.5 pb-2 border-b border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <BarChart2 className="w-3 h-3 text-[#21B6EA]" />
                <span>Dimensión</span>
              </span>

              <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveDimension('SENTIMIENTO')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    activeDimension === 'SENTIMIENTO'
                      ? 'bg-white text-[#0B0F19] shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-[#0B0F19]'
                  }`}
                  title="Ver gráfico de Sentimiento (5 categorías)"
                >
                  Sentimiento
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDimension('INTERES')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    activeDimension === 'INTERES'
                      ? 'bg-white text-[#0B0F19] shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-[#0B0F19]'
                  }`}
                  title="Ver gráfico de Interés (5 categorías)"
                >
                  Interés
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDimension('PRIORIDAD')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    activeDimension === 'PRIORIDAD'
                      ? 'bg-white text-[#0B0F19] shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-[#0B0F19]'
                  }`}
                  title="Ver gráfico de Prioridad (5 categorías)"
                >
                  Prioridad
                </button>
              </div>
            </div>

            <div className="pt-1">
              <div className="flex items-end justify-between gap-1.5 h-20 px-1">
                {currentBars.map((bar) => {
                  const pct = currentTotal > 0 ? (bar.count / currentTotal) * 100 : 0;
                  const barHeightPct =
                    maxVal > 0 ? Math.max((bar.count / maxVal) * 100, bar.count > 0 ? 15 : 4) : 4;

                  return (
                    <div
                      key={bar.category}
                      className="flex-1 flex flex-col items-center justify-end h-full group"
                    >
                      <span
                        className={`text-[10px] font-bold font-mono tabular-nums mb-1 transition-transform group-hover:scale-110 ${
                          bar.count > 0 ? bar.textColor : 'text-slate-300'
                        }`}
                        title={`${bar.category}: ${bar.count} (${pct.toFixed(1)}%)`}
                      >
                        {bar.count}
                      </span>

                      <div className="w-full max-w-[28px] h-12 bg-slate-200/60 rounded-t-md overflow-hidden flex flex-col justify-end p-0.5">
                        <div
                          style={{ height: `${barHeightPct}%` }}
                          className={`w-full rounded-t-xs transition-all duration-300 ${
                            bar.count > 0 ? bar.color : 'bg-slate-300/40'
                          }`}
                        />
                      </div>

                      <span
                        className="text-[9px] font-semibold text-slate-600 tracking-tight mt-1 text-center truncate max-w-full block leading-none"
                        title={`${bar.category}: ${bar.count} comentarios`}
                      >
                        {bar.short}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-500">
                <span>
                  Total evaluados:{' '}
                  <strong className="text-[#0B0F19] font-mono tabular-nums">{currentTotal}</strong>
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                  {activeDimension}
                </span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 font-mono tabular-nums">
              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
              <span>Creado: {formatDate(post.created_time)}</span>
            </div>
            {post.updated_time && post.updated_time !== post.created_time && (
              <div className="flex items-center gap-1.5 text-slate-600 font-mono tabular-nums">
                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Modificado: {formatDate(post.updated_time)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer de Tarjeta */}
      <div className="px-3.5 py-2.5 bg-[#F4F8FB] border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <div
            className="flex items-center gap-1 text-xs font-bold text-[#0B0F19] bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono tabular-nums"
            title={`${effectiveCommentsCount} comentarios`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#21B6EA] shrink-0" />
            <span>{effectiveCommentsCount}</span>
          </div>

          {onRefreshPostDb && (
            <button
              type="button"
              onClick={handleRefreshDbClick}
              disabled={activeLoading || isRefreshingDb}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 text-[#1E293B] bg-white hover:bg-slate-100 hover:text-[#0B0F19] disabled:opacity-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Recargar datos y comentarios de este post directamente desde la Base de Datos (sin llamar a la IA)"
            >
              <Database className={`w-3.5 h-3.5 text-[#0369A1] ${isRefreshingDb ? 'animate-spin text-[#21B6EA]' : ''}`} />
              <span>{isRefreshingDb ? 'Leyendo BD...' : 'Refrescar BD'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRefreshClick}
            disabled={activeLoading || isRefreshingDb}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#0B0F19] hover:bg-[#1E293B] text-white disabled:opacity-50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Refrescar comentarios y análisis de esta publicación con IA mediante el webhook oficial"
          >
            <Sparkles className={`w-3.5 h-3.5 text-[#21B6EA] ${activeLoading ? 'animate-spin' : ''}`} />
            <span>{activeLoading ? 'Refrescando...' : 'Refrescar Post con IA'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => onSelect(post)}
          className="text-xs font-bold text-[#0369A1] hover:text-[#0B0F19] hover:underline px-1.5 py-1 cursor-pointer shrink-0"
        >
          Ver detalle &rarr;
        </button>
      </div>
    </div>
  );
};
