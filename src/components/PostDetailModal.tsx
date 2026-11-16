import React, { useState, useEffect } from 'react';
import { MetaPost, MetaComment, MetaPageInfo } from '../types';
import {
  fetchPostComments,
  addTestComment,
  analyze_single_post_comments_ai,
  resolveCommentAuthorName,
  isGenericPlaceholderName,
} from '../services/metaSyncService';
import {
  X,
  MessageSquare,
  CornerDownRight,
  ExternalLink,
  Calendar,
  Clock,
  Send,
  User,
  RefreshCw,
  Facebook,
  Info,
  UserCheck,
  ThumbsUp,
  Copy,
  Check,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Database,
  BadgeCheck,
} from 'lucide-react';

interface PostDetailModalProps {
  post: MetaPost | null;
  clientId: number;
  onClose: () => void;
  onSyncPostComments?: (post: MetaPost) => Promise<void>;
  onAnalyzePostAi?: (post: MetaPost) => Promise<void>;
  onPostUpdated?: () => Promise<void>;
  onRefreshPostDb?: (post: MetaPost) => Promise<void> | void;
  isRefreshingDb?: boolean;
  pageInfo?: MetaPageInfo | null;
  companyName?: string;
}

// Funciones helper para renderizar los 3 niveles obligatorios de IA en MAYÚSCULAS
const renderSentimentBadge = (level?: string | null) => {
  const l = String(level || '').trim().toLowerCase();
  if (!level || l === 'pending' || l === 'pendiente') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200 uppercase">
        SENTIMIENTO: PENDIENTE
      </span>
    );
  }
  if (l.includes('muy pos')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
        MUY POSITIVO
      </span>
    );
  }
  if (l.includes('pos')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
        POSITIVO
      </span>
    );
  }
  if (l.includes('muy neg')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300 uppercase">
        MUY NEGATIVO
      </span>
    );
  }
  if (l.includes('neg')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
        NEGATIVO
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-[#1E293B] border border-slate-200 uppercase">
      NEUTRO
    </span>
  );
};

const renderInterestBadge = (level?: string | null) => {
  const l = String(level || '').trim().toLowerCase();
  if (!level || l === 'pending' || l === 'pendiente') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200 uppercase">
        INTERÉS: PENDIENTE
      </span>
    );
  }
  if (l.includes('muy alt')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0B0F19] text-[#21B6EA] border border-[#0B0F19] uppercase">
        <Sparkles className="w-2.5 h-2.5 text-[#21B6EA]" /> INTERÉS: MUY ALTO
      </span>
    );
  }
  if (l.includes('alt')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E8F8FE] text-[#0369A1] border border-[#21B6EA]/40 uppercase">
        <Sparkles className="w-2.5 h-2.5 text-[#0369A1]" /> INTERÉS: ALTO
      </span>
    );
  }
  if (l.includes('med')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200 uppercase">
        INTERÉS: MEDIO
      </span>
    );
  }
  if (l.includes('muy baj') || l.includes('ningun') || l.includes('none')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-normal bg-slate-100 text-slate-600 border border-slate-200 uppercase">
        INTERÉS: MUY BAJO
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 uppercase">
      INTERÉS: BAJO
    </span>
  );
};

const renderPriorityBadge = (level?: string | null) => {
  const l = String(level || '').trim().toLowerCase();
  if (!level || l === 'pending' || l === 'pendiente') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200 uppercase">
        PRIORIDAD: PENDIENTE
      </span>
    );
  }
  if (l.includes('muy alt') || l.includes('urgent')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-200 text-rose-950 border border-rose-400 uppercase">
        PRIORIDAD: MUY ALTA
      </span>
    );
  }
  if (l.includes('alt')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 uppercase">
        PRIORIDAD: ALTA
      </span>
    );
  }
  if (l.includes('med')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
        PRIORIDAD: MEDIA
      </span>
    );
  }
  if (l.includes('muy baj')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-normal bg-slate-100 text-slate-600 border border-slate-200 uppercase">
        PRIORIDAD: MUY BAJA
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-normal bg-slate-100 text-slate-600 border border-slate-200 uppercase">
      PRIORIDAD: BAJA
    </span>
  );
};

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  clientId,
  onClose,
  onSyncPostComments,
  onAnalyzePostAi,
  onPostUpdated,
  onRefreshPostDb,
  isRefreshingDb = false,
  pageInfo,
  companyName,
}) => {
  const [comments, setComments] = useState<MetaComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<MetaComment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncingPost, setIsSyncingPost] = useState(false);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{ message: string; type: 'success' | 'warn' | 'error' } | null>(null);

  // Expanded person details map
  const [expandedAuthorCommentId, setExpandedAuthorCommentId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!post) return;
    loadComments();
  }, [post]);

  const loadComments = async () => {
    if (!post?.id) return;
    setIsLoading(true);
    try {
      const data = await fetchPostComments(clientId, post.id);
      setComments(data);
    } catch (err) {
      console.error('Error cargando comentarios:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !post?.id) return;

    setIsSubmitting(true);
    try {
      await addTestComment(
        clientId,
        post.id,
        newCommentText.trim(),
        'Respuesta de Administrador',
        replyingTo ? replyingTo.meta_comment_id : null
      );
      setNewCommentText('');
      setReplyingTo(null);
      await loadComments();
    } catch (err) {
      console.error('Error agregando comentario:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualPostSync = async () => {
    if (!post || !onSyncPostComments) return;
    setIsSyncingPost(true);
    try {
      await onSyncPostComments(post);
      await loadComments();
    } finally {
      setIsSyncingPost(false);
    }
  };

  const handleAnalyzeThisPostAi = async () => {
    if (!post) return;
    setIsAnalyzingAi(true);
    setAiFeedback(null);
    try {
      if (onAnalyzePostAi) {
        await onAnalyzePostAi(post);
      } else {
        const targetId = post.id || post.meta_post_id;
        const res = await analyze_single_post_comments_ai(clientId, targetId, undefined, false);
        if (res.reason) {
          setAiFeedback({ message: res.reason, type: 'warn' });
        } else if (res.analyzed === 0) {
          setAiFeedback({
            message: `Todos los comentarios (${res.skipped}) ya están analizados y sin cambios recientes. No se requirió nuevo consumo de IA.`,
            type: 'info' as any,
          });
        } else {
          setAiFeedback({
            message: `¡Análisis completado! Se procesaron ${res.analyzed} comentarios nuevos/modificados con IA (${res.skipped} sin cambios omitidos).`,
            type: 'success',
          });
        }
      }
      await loadComments();
      if (onPostUpdated) {
        await onPostUpdated();
      }
    } catch (err: any) {
      setAiFeedback({
        message: `Error al analizar: ${err.message || err}`,
        type: 'error',
      });
    } finally {
      setIsAnalyzingAi(false);
      setTimeout(() => setAiFeedback(null), 6000);
    }
  };

  if (!post) return null;

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const formatFullDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('es-ES', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getRelativeTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'hace un momento';
      if (mins < 60) return `hace ${mins} min`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `hace ${hours} h`;
      const days = Math.floor(hours / 24);
      return `hace ${days} d`;
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        id="post-detail-modal"
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in-50 zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-[#F4F8FB]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#21B6EA]"></span>
            <h3 className="font-bold text-[#0B0F19] text-base tracking-tight">Detalle de Publicación Meta</h3>
            <span className="text-xs text-slate-500 font-mono tabular-nums">ID: {post.meta_post_id}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAnalyzeThisPostAi}
              disabled={isAnalyzingAi}
              className="px-2.5 py-1.5 text-xs font-bold text-[#0B0F19] bg-[#21B6EA] hover:bg-[#14A3D6] rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Analizar comentarios de este post con IA"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingAi ? 'animate-spin' : ''}`} />
              <span>{isAnalyzingAi ? 'Analizando con IA...' : 'Analizar Post con IA'}</span>
            </button>

            {onRefreshPostDb && (
              <button
                onClick={async () => {
                  if (post && onRefreshPostDb) {
                    await onRefreshPostDb(post);
                    await loadComments();
                  }
                }}
                disabled={isRefreshingDb}
                className="px-2.5 py-1.5 text-xs font-semibold text-[#1E293B] bg-white hover:bg-[#E8F8FE] rounded-lg border border-slate-200 hover:border-[#21B6EA] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Recargar este post y sus comentarios directamente de la Base de Datos (PostgreSQL/Supabase)"
              >
                <Database className={`w-3.5 h-3.5 text-[#0369A1] ${isRefreshingDb ? 'animate-spin' : ''}`} />
                <span>{isRefreshingDb ? 'Leyendo BD...' : 'Refrescar BD'}</span>
              </button>
            )}

            {onSyncPostComments && (
              <button
                onClick={handleManualPostSync}
                disabled={isSyncingPost}
                className="px-2.5 py-1.5 text-xs font-semibold text-[#1E293B] bg-white hover:bg-[#E8F8FE] rounded-lg border border-slate-200 hover:border-[#21B6EA] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Sincronizar comentarios delta de este post"
              >
                <RefreshCw className={`w-3 h-3 text-[#0369A1] ${isSyncingPost ? 'animate-spin' : ''}`} />
                <span>Actualizar Comentarios</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-[#0B0F19] hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {aiFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center justify-between gap-2 border ${
                aiFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : aiFeedback.type === 'warn'
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-[#0369A1]" />
                <span>{aiFeedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setAiFeedback(null)}
                className="text-slate-400 hover:text-[#0B0F19] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {/* Post Message & Details */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#F4F8FB] border border-slate-200 space-y-3.5">
            {/* Cabecera del Autor de la Publicación (Página de Facebook / Empresa) */}
            {(() => {
              const rawAuthor = post.raw_data?.from?.name;
              const postAuthorName =
                (rawAuthor && !isGenericPlaceholderName(rawAuthor) && rawAuthor) ||
                (pageInfo?.name && !isGenericPlaceholderName(pageInfo.name) && pageInfo.name) ||
                (companyName && !isGenericPlaceholderName(companyName) && companyName) ||
                'ELITEC';

              const postAuthorAvatar =
                post.raw_data?.from?.picture?.data?.url ||
                pageInfo?.picture ||
                (companyName?.toLowerCase().includes('elitec') ? '/elitec_logo.png' : undefined);

              return (
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 gap-3">
                  <div className="flex items-center gap-3">
                    {postAuthorAvatar ? (
                      <img
                        src={postAuthorAvatar}
                        alt={postAuthorName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-300 shadow-2xs shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#0B0F19] text-[#21B6EA] font-bold text-sm flex items-center justify-center shadow-2xs shrink-0">
                        {postAuthorName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-[#0B0F19] text-sm">
                          {postAuthorName}
                        </span>
                        {(pageInfo?.verification_status === 'blue_verified' || pageInfo?.verification_status === 'verified') && (
                          <span title="Página Verificada">
                            <BadgeCheck className="w-4 h-4 text-[#0369A1] shrink-0" />
                          </span>
                        )}
                        {pageInfo?.username && (
                          <span className="text-xs text-slate-500 font-normal">@{pageInfo.username}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="inline-flex items-center gap-1 text-[#0369A1] bg-[#E8F8FE] px-1.5 py-0.5 rounded font-semibold border border-[#21B6EA]/30">
                          <Facebook className="w-2.5 h-2.5 text-[#0369A1]" /> Publicación oficial
                        </span>
                        <span>·</span>
                        <span className="font-mono tabular-nums">{formatDate(post.created_time)}</span>
                      </div>
                    </div>
                  </div>

                  {post.permalink_url && (
                    <a
                      href={post.permalink_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 text-xs font-bold text-[#0369A1] bg-white hover:bg-[#E8F8FE] rounded-lg border border-slate-200 hover:border-[#21B6EA] flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
                      title="Abrir publicación en Facebook"
                    >
                      <span className="hidden sm:inline">Ver en Facebook</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#0369A1]" />
                    </a>
                  )}
                </div>
              );
            })()}

            <p className="text-[#0B0F19] text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
              {post.message || <span className="italic text-slate-400">Sin texto descriptivo</span>}
            </p>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 pt-3 border-t border-slate-200 font-mono tabular-nums">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Creado: {formatDate(post.created_time)}
              </span>
              {post.updated_time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Actualizado: {formatDate(post.updated_time)}
                </span>
              )}
              {post.last_comment_sync_at && (
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <RefreshCw className="w-3 h-3" />
                  Última sinc.: {formatDate(post.last_comment_sync_at)}
                </span>
              )}
            </div>
          </div>

          {/* AI Metrics Card for Post (if sentiment_distribution exists) */}
          {post.raw_data?.sentiment_distribution && (
            <div className="p-4 bg-[#E8F8FE]/60 rounded-xl border border-[#21B6EA]/35 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#21B6EA]/25 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-[#0B0F19]">
                  <Sparkles className="w-4 h-4 text-[#0369A1]" />
                  <span>Análisis Inteligente de Comentarios con IA</span>
                </div>
                {post.analysis_updated_at && (
                  <span className="text-[10px] text-[#0369A1] font-semibold font-mono tabular-nums">
                    Actualizado: {formatDate(post.analysis_updated_at)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Sentimiento */}
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">
                    Sentimiento
                  </span>
                  {post.raw_data?.detailed_distribution?.sentimiento ? (
                    <div className="flex flex-wrap gap-1 font-semibold text-[11px] uppercase font-mono tabular-nums">
                      {Number(post.raw_data.detailed_distribution.sentimiento['MUY POSITIVO']) > 0 && (
                        <span className="text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                          +{post.raw_data.detailed_distribution.sentimiento['MUY POSITIVO']} MUY POSITIVO
                        </span>
                      )}
                      {Number(post.raw_data.detailed_distribution.sentimiento['POSITIVO']) > 0 && (
                        <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          +{post.raw_data.detailed_distribution.sentimiento['POSITIVO']} POSITIVO
                        </span>
                      )}
                      {(Number(post.raw_data.detailed_distribution.sentimiento['NEUTRAL']) > 0 || Number(post.raw_data.detailed_distribution.sentimiento['NEUTRO']) > 0) && (
                        <span className="text-[#1E293B] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          ~{(post.raw_data.detailed_distribution.sentimiento['NEUTRAL'] || 0) + (post.raw_data.detailed_distribution.sentimiento['NEUTRO'] || 0)} NEUTRO
                        </span>
                      )}
                      {Number(post.raw_data.detailed_distribution.sentimiento['NEGATIVO']) > 0 && (
                        <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          -{post.raw_data.detailed_distribution.sentimiento['NEGATIVO']} NEGATIVO
                        </span>
                      )}
                      {Number(post.raw_data.detailed_distribution.sentimiento['MUY NEGATIVO']) > 0 && (
                        <span className="text-rose-900 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-300 font-bold">
                          -{post.raw_data.detailed_distribution.sentimiento['MUY NEGATIVO']} MUY NEGATIVO
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 font-bold text-xs uppercase font-mono tabular-nums">
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        +{post.raw_data?.sentiment_distribution?.positivo || 0} POSITIVO
                      </span>
                      <span className="text-[#1E293B] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        ~{post.raw_data?.sentiment_distribution?.neutral || 0} NEUTRO
                      </span>
                      <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        -{post.raw_data?.sentiment_distribution?.negativo || 0} NEGATIVO
                      </span>
                    </div>
                  )}
                </div>

                {/* Interés de Compra */}
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">
                    Interés Comercial
                  </span>
                  {post.raw_data?.detailed_distribution?.interes ? (
                    <div className="flex flex-wrap gap-1 font-semibold text-[11px] uppercase font-mono tabular-nums">
                      {Number(post.raw_data.detailed_distribution.interes['MUY ALTO']) > 0 && (
                        <span className="text-[#21B6EA] bg-[#0B0F19] px-1.5 py-0.5 rounded border border-[#0B0F19] font-bold">
                          {post.raw_data.detailed_distribution.interes['MUY ALTO']} MUY ALTO
                        </span>
                      )}
                      {Number(post.raw_data.detailed_distribution.interes['ALTO']) > 0 && (
                        <span className="text-[#0369A1] bg-[#E8F8FE] px-1.5 py-0.5 rounded border border-[#21B6EA]/40 font-bold">
                          {post.raw_data.detailed_distribution.interes['ALTO']} ALTO
                        </span>
                      )}
                      {Number(post.raw_data.detailed_distribution.interes['MEDIO']) > 0 && (
                        <span className="text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                          {post.raw_data.detailed_distribution.interes['MEDIO']} MEDIO
                        </span>
                      )}
                      {Number(post.raw_data.detailed_distribution.interes['BAJO']) > 0 && (
                        <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {post.raw_data.detailed_distribution.interes['BAJO']} BAJO
                        </span>
                      )}
                      {(Number(post.raw_data.detailed_distribution.interes['MUY BAJO']) > 0 || Number(post.raw_data.detailed_distribution.interes['NINGUNO']) > 0) && (
                        <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {(post.raw_data.detailed_distribution.interes['MUY BAJO'] || 0) + (post.raw_data.detailed_distribution.interes['NINGUNO'] || 0)} MUY BAJO
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 font-bold text-xs flex-wrap uppercase font-mono tabular-nums">
                      {post.raw_data?.interest_distribution?.alto ? (
                        <span className="text-[#0369A1] bg-[#E8F8FE] px-2 py-0.5 rounded border border-[#21B6EA]/40">
                          {post.raw_data.interest_distribution.alto} ALTO
                        </span>
                      ) : null}
                      {post.raw_data?.interest_distribution?.medio ? (
                        <span className="text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                          {post.raw_data.interest_distribution.medio} MEDIO
                        </span>
                      ) : null}
                      {post.raw_data?.interest_distribution?.bajo ? (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {post.raw_data.interest_distribution.bajo} BAJO
                        </span>
                      ) : null}
                      {(!post.raw_data?.interest_distribution?.alto && !post.raw_data?.interest_distribution?.medio && !post.raw_data?.interest_distribution?.bajo) && (
                        <span className="text-slate-500 font-normal">MUY BAJO</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Prioridad de Atención */}
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">
                    Prioridad de Atención
                  </span>
                  {post.raw_data?.detailed_distribution?.prioridad ? (
                    <div className="flex flex-wrap gap-1 font-semibold text-[11px] uppercase font-mono tabular-nums">
                      {(Number(post.raw_data.detailed_distribution.prioridad['MUY ALTA']) > 0 || Number(post.raw_data.detailed_distribution.prioridad['MUY ALTO']) > 0) && (
                        <span className="text-rose-900 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-300 font-bold">
                          {(post.raw_data.detailed_distribution.prioridad['MUY ALTA'] || 0) + (post.raw_data.detailed_distribution.prioridad['MUY ALTO'] || 0)} MUY ALTA
                        </span>
                      )}
                      {(Number(post.raw_data.detailed_distribution.prioridad['ALTA']) > 0 || Number(post.raw_data.detailed_distribution.prioridad['ALTO']) > 0) && (
                        <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          {(post.raw_data.detailed_distribution.prioridad['ALTA'] || 0) + (post.raw_data.detailed_distribution.prioridad['ALTO'] || 0)} ALTA
                        </span>
                      )}
                      {(Number(post.raw_data.detailed_distribution.prioridad['MEDIA']) > 0 || Number(post.raw_data.detailed_distribution.prioridad['MEDIO']) > 0) && (
                        <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {(post.raw_data.detailed_distribution.prioridad['MEDIA'] || 0) + (post.raw_data.detailed_distribution.prioridad['MEDIO'] || 0)} MEDIA
                        </span>
                      )}
                      {(Number(post.raw_data.detailed_distribution.prioridad['BAJA']) > 0 || Number(post.raw_data.detailed_distribution.prioridad['BAJO']) > 0) && (
                        <span className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {(post.raw_data.detailed_distribution.prioridad['BAJA'] || 0) + (post.raw_data.detailed_distribution.prioridad['BAJO'] || 0)} BAJA
                        </span>
                      )}
                      {(Number(post.raw_data.detailed_distribution.prioridad['MUY BAJA']) > 0 || Number(post.raw_data.detailed_distribution.prioridad['MUY BAJO']) > 0) && (
                        <span className="text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                          {(post.raw_data.detailed_distribution.prioridad['MUY BAJA'] || 0) + (post.raw_data.detailed_distribution.prioridad['MUY BAJO'] || 0)} MUY BAJA
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 font-bold text-xs uppercase font-mono tabular-nums">
                      {post.raw_data?.priority_distribution?.alta ? (
                        <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                          {post.raw_data.priority_distribution.alta} ALTA
                        </span>
                      ) : null}
                      {post.raw_data?.priority_distribution?.media ? (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {post.raw_data.priority_distribution.media} MEDIA
                        </span>
                      ) : null}
                      {(!post.raw_data?.priority_distribution?.alta && !post.raw_data?.priority_distribution?.media) && (
                        <span className="text-slate-500 font-normal">AL DÍA</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-sm font-bold text-[#0B0F19] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#0369A1]" />
                  Comentarios (<span className="font-mono tabular-nums">{comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)}</span>)
                </h4>
                <span className="text-[11px] text-slate-500">Haz clic en &ldquo;Ver detalle&rdquo; para consultar la ficha de cada persona</span>
              </div>

              <button
                type="button"
                onClick={handleAnalyzeThisPostAi}
                disabled={isAnalyzingAi || comments.length === 0}
                className="px-2.5 py-1.5 text-xs font-bold text-[#0B0F19] bg-[#E8F8FE] hover:bg-[#21B6EA]/25 disabled:opacity-50 rounded-lg border border-[#21B6EA]/40 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                title="Analizar estos comentarios con IA"
              >
                <Sparkles className={`w-3.5 h-3.5 text-[#0369A1] ${isAnalyzingAi ? 'animate-spin' : ''}`} />
                <span>{isAnalyzingAi ? 'Analizando comentarios...' : 'Analizar Comentarios con IA'}</span>
              </button>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#21B6EA]" />
                Cargando comentarios...
              </div>
            ) : comments.length === 0 ? (
              <div className="py-8 text-center bg-[#F4F8FB] rounded-xl border border-dashed border-slate-300">
                <p className="text-xs text-slate-600 font-medium">Aún no hay comentarios sincronizados para esta publicación.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Usa el formulario inferior para agregar un comentario o haz clic en &ldquo;Actualizar Comentarios&rdquo;.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => {
                  const isExpanded = expandedAuthorCommentId === comment.meta_comment_id;
                  const authorName = resolveCommentAuthorName(comment);
                  const profileUrl = comment.raw_data?.from?.link || (comment.author_id ? `https://www.facebook.com/${comment.author_id}` : null);
                  const avatarUrl = comment.raw_data?.from?.picture?.data?.url;
                  const likeCount = comment.raw_data?.like_count || 0;

                  return (
                    <div
                      key={comment.meta_comment_id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#21B6EA]/60 transition-colors"
                    >
                      {/* Cabecera del Autor con Avatar y Botones de Detalle */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={authorName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#0B0F19] text-[#21B6EA] font-bold text-xs flex items-center justify-center shadow-2xs shrink-0 mt-0.5">
                              {authorName.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-bold text-[#0B0F19]">
                                {authorName}
                              </span>

                              {/* Botón interactivo para ver detalles completos de la persona */}
                              <button
                                type="button"
                                onClick={() => setExpandedAuthorCommentId(isExpanded ? null : comment.meta_comment_id)}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-md border transition-colors flex items-center gap-1 cursor-pointer ${
                                  isExpanded
                                    ? 'bg-[#0B0F19] text-[#21B6EA] border-[#0B0F19]'
                                    : 'bg-[#F4F8FB] hover:bg-[#E8F8FE] text-[#1E293B] border-slate-200 hover:border-[#21B6EA]'
                                }`}
                                title="Ver detalles de la persona que comentó"
                              >
                                <Info className="w-3 h-3" />
                                <span>{isExpanded ? 'Ocultar detalle' : 'Ver detalle'}</span>
                              </button>

                              {/* Enlace directo a perfil de Facebook */}
                              {profileUrl && (
                                <a
                                  href={profileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-[#0369A1] hover:text-[#0B0F19] hover:underline flex items-center gap-0.5 ml-0.5 font-semibold"
                                  title="Abrir perfil de Facebook en una nueva pestaña"
                                >
                                  <Facebook className="w-2.5 h-2.5" />
                                  <span>Perfil</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>

                            <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5 font-mono tabular-nums">
                              <span>{formatDate(comment.created_time)}</span>
                              {getRelativeTime(comment.created_time) && (
                                <>
                                  <span className="text-slate-300">·</span>
                                  <span className="text-slate-400 font-sans">{getRelativeTime(comment.created_time)}</span>
                                </>
                              )}
                              {comment.updated_time && comment.updated_time !== comment.created_time && (
                                <span className="text-amber-600 font-semibold font-sans">(editado)</span>
                              )}
                              {likeCount > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-[#0369A1] bg-[#E8F8FE] px-1.5 py-0.2 rounded font-semibold">
                                  <ThumbsUp className="w-2.5 h-2.5" /> {likeCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setReplyingTo(comment)}
                          className="text-[11px] text-[#0369A1] hover:text-[#0B0F19] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <CornerDownRight className="w-3 h-3" /> Responder
                        </button>
                      </div>

                      {/* Ficha Desplegable con Todos los Detalles de la Persona */}
                      {isExpanded && (
                        <div className="mt-3 p-3.5 bg-[#F4F8FB] rounded-xl border border-slate-200 text-xs space-y-2.5 animate-in fade-in-50 duration-150">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <div className="flex items-center gap-1.5 font-bold text-[#0B0F19]">
                              <UserCheck className="w-4 h-4 text-[#0369A1]" />
                              <span>Ficha de la Persona que Comentó</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                              Meta Profile Data
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                            <div className="bg-white p-2 rounded-lg border border-slate-200">
                              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                                Nombre Completo
                              </span>
                              <span className="font-bold text-[#0B0F19] text-xs">
                                {authorName}
                              </span>
                            </div>

                            <div className="bg-white p-2 rounded-lg border border-slate-200">
                              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                                ID de Usuario en Meta
                              </span>
                              <div className="flex items-center justify-between gap-1 mt-0.5">
                                <code className="font-mono tabular-nums text-[#0B0F19] font-semibold truncate text-[11px]">
                                  {comment.author_id || 'ID no público'}
                                </code>
                                {comment.author_id && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleCopy(comment.author_id!, e)}
                                    className="text-[10px] text-[#0369A1] hover:text-[#0B0F19] font-bold flex items-center gap-0.5 cursor-pointer shrink-0"
                                    title="Copiar ID de usuario"
                                  >
                                    {copiedId === comment.author_id ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        <span className="text-emerald-600 font-bold">Copiado</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span>Copiar</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="bg-white p-2 rounded-lg border border-slate-200">
                              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                                Fecha y Hora del Comentario
                              </span>
                              <span className="font-medium text-[#1E293B] font-mono tabular-nums">
                                {formatFullDate(comment.created_time)}
                              </span>
                            </div>

                            <div className="bg-white p-2 rounded-lg border border-slate-200">
                              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                                ID de Comentario Meta
                              </span>
                              <div className="flex items-center justify-between gap-1 mt-0.5">
                                <code className="font-mono tabular-nums text-slate-600 truncate text-[10px]">
                                  {comment.meta_comment_id}
                                </code>
                                <button
                                  type="button"
                                  onClick={(e) => handleCopy(comment.meta_comment_id, e)}
                                  className="text-[10px] text-[#0369A1] hover:text-[#0B0F19] font-bold flex items-center gap-0.5 cursor-pointer shrink-0"
                                  title="Copiar ID del comentario"
                                >
                                  {copiedId === comment.meta_comment_id ? (
                                    <span className="text-emerald-600 font-bold">Copiado</span>
                                  ) : (
                                    <Copy className="w-2.5 h-2.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {profileUrl && (
                            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                              <span className="text-[11px] text-slate-500">
                                ¿Deseas visitar el perfil de Facebook de esta persona?
                              </span>
                              <a
                                href={profileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B0F19] hover:bg-[#1E293B] text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                              >
                                <Facebook className="w-3.5 h-3.5 text-[#21B6EA]" />
                                <span>Ver Perfil de Facebook</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Texto del comentario */}
                      <p className="mt-2 text-xs sm:text-sm text-[#1E293B] leading-relaxed pl-10.5">
                        {comment.message}
                      </p>

                      {/* Insignias de Clasificación por IA: OBLIGATORIAMENTE LOS 3 NIVELES */}
                      <div className="mt-2 pl-10.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                        {renderSentimentBadge(comment.sentiment_level)}
                        {renderInterestBadge(comment.interest_level)}
                        {renderPriorityBadge(comment.priority_level)}

                        {Boolean(comment.reason || comment.raw_data?.ai_analysis?.reason) && (
                          <span
                            className="text-slate-500 italic max-w-sm truncate"
                            title={String(comment.reason || comment.raw_data?.ai_analysis?.reason)}
                          >
                            · {comment.reason || comment.raw_data?.ai_analysis?.reason}
                          </span>
                        )}
                      </div>

                      {/* Respuestas anidadas (Replies) */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 pl-8 sm:pl-10 space-y-2 border-l-2 border-[#21B6EA]/40">
                          {comment.replies.map((reply) => {
                            const replyProfileUrl = reply.raw_data?.from?.link || (reply.author_id ? `https://www.facebook.com/${reply.author_id}` : null);

                            return (
                              <div
                                key={reply.meta_comment_id}
                                className="p-2.5 rounded-lg bg-[#F4F8FB] border border-slate-200 text-xs"
                              >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-[#0B0F19]">
                                      {resolveCommentAuthorName(reply)}
                                    </span>
                                    {reply.author_id && (
                                      <code className="text-[10px] text-slate-500 bg-white px-1 py-0.2 rounded border border-slate-200 font-mono tabular-nums">
                                        ID: {reply.author_id}
                                      </code>
                                    )}
                                    {replyProfileUrl && (
                                      <a
                                        href={replyProfileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-[#0369A1] hover:underline flex items-center gap-0.5"
                                      >
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </a>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                                    {formatDate(reply.created_time)}
                                  </span>
                                </div>
                                <p className="text-[#1E293B]">{reply.message}</p>

                                {/* 3 Niveles Obligatorios en respuestas */}
                                <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[9px]">
                                  {renderSentimentBadge(reply.sentiment_level)}
                                  {renderInterestBadge(reply.interest_level)}
                                  {renderPriorityBadge(reply.priority_level)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Comment input form */}
        <div className="p-4 bg-[#F4F8FB] border-t border-slate-200">
          {replyingTo && (
            <div className="mb-2 px-3 py-1.5 rounded-lg bg-[#E8F8FE] border border-[#21B6EA]/40 text-xs text-[#0B0F19] flex items-center justify-between">
              <span>
                Respondiendo a: <strong>{resolveCommentAuthorName(replyingTo)}</strong>
              </span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-[#0369A1] hover:text-[#0B0F19] font-bold cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          )}

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder={replyingTo ? 'Escribe tu respuesta...' : 'Escribe un comentario...'}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#0B0F19] focus:outline-none focus:ring-2 focus:ring-[#21B6EA] focus:border-[#21B6EA]"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newCommentText.trim()}
              className="px-4 py-2 bg-[#21B6EA] hover:bg-[#14A3D6] disabled:opacity-50 text-[#0B0F19] rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Enviando...' : 'Publicar'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
