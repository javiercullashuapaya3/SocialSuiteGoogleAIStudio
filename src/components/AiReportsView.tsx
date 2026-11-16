import React, { useState, useEffect, useMemo } from 'react';
import { MetaPost, MetaComment } from '../types';
import { fetchAllCompanyComments, resolveCommentAuthorName } from '../services/metaSyncService';
import {
  Sparkles,
  BarChart3,
  ThumbsUp,
  MinusCircle,
  ThumbsDown,
  MessageSquare,
  Filter,
  Search,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Flame,
  Clock,
  User,
  ChevronRight,
  SlidersHorizontal,
  X,
  Layers,
  Database,
} from 'lucide-react';

interface AiReportsViewProps {
  posts: MetaPost[];
  clientId: number;
  onSelectPost: (post: MetaPost) => void;
  onAnalyzePostAi: (post: MetaPost) => Promise<void>;
  onAnalyzeAllAi?: () => Promise<void>;
  isAnalyzingAi: boolean;
  onRefresh: () => Promise<void>;
  onSyncPostComments?: (post: MetaPost) => Promise<void>;
  syncingPostId?: string | number | null;
}

export const AiReportsView: React.FC<AiReportsViewProps> = ({
  posts,
  clientId,
  onSelectPost,
  onAnalyzePostAi,
  onAnalyzeAllAi,
  isAnalyzingAi,
  onRefresh,
  onSyncPostComments,
  syncingPostId,
}) => {
  const [comments, setComments] = useState<MetaComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  // Filters for Comments Explorer
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [interestFilter, setInterestFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedPostIdFilter, setSelectedPostIdFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'1year' | '6months' | '30days' | 'all'>('1year');
  const [commentSearch, setCommentSearch] = useState('');

  // Filters for Post Breakdown
  const [postSearch, setPostSearch] = useState('');
  const [postSort, setPostSort] = useState<'most_comments' | 'most_positive' | 'most_negative' | 'recent'>('most_comments');

  // Load comments
  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      const data = await fetchAllCompanyComments(clientId);
      setComments(data);
    } catch (err) {
      console.error('Error cargando comentarios para reporte:', err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [clientId]);

  // Helper map: post_id -> MetaPost
  const postsMap = useMemo(() => {
    const map = new Map<string, MetaPost>();
    posts.forEach((p) => {
      if (p.id) map.set(String(p.id), p);
      if (p.meta_post_id) map.set(String(p.meta_post_id), p);
    });
    return map;
  }, [posts]);

  // Global Aggregate Metrics
  const metrics = useMemo(() => {
    const totalComments = comments.length;
    let analyzedCount = 0;
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;

    const interest = { alto: 0, medio: 0, bajo: 0, ninguno: 0 };
    const priority = { alta: 0, media: 0, baja: 0 };

    comments.forEach((c) => {
      if (c.sentiment_level) {
        analyzedCount++;
        const s = String(c.sentiment_level).toLowerCase();
        if (s.includes('pos')) positiveCount++;
        else if (s.includes('neg')) negativeCount++;
        else neutralCount++;
      }

      if (c.interest_level) {
        const i = String(c.interest_level).toLowerCase();
        if (i.includes('alt')) interest.alto++;
        else if (i.includes('med')) interest.medio++;
        else if (i.includes('baj')) interest.bajo++;
        else interest.ninguno++;
      }

      if (c.priority_level) {
        const p = String(c.priority_level).toLowerCase();
        if (p.includes('alt')) priority.alta++;
        else if (p.includes('med')) priority.media++;
        else priority.baja++;
      }
    });

    const pendingCount = totalComments - analyzedCount;
    const positivePct = analyzedCount > 0 ? Math.round((positiveCount / analyzedCount) * 100) : 0;
    const neutralPct = analyzedCount > 0 ? Math.round((neutralCount / analyzedCount) * 100) : 0;
    const negativePct = analyzedCount > 0 ? Math.round((negativeCount / analyzedCount) * 100) : 0;
    const coveragePct = totalComments > 0 ? Math.round((analyzedCount / totalComments) * 100) : 0;

    return {
      totalComments,
      analyzedCount,
      pendingCount,
      positiveCount,
      neutralCount,
      negativeCount,
      positivePct,
      neutralPct,
      negativePct,
      coveragePct,
      interest,
      priority,
    };
  }, [comments]);

  // Per-Post aggregated data
  const postsWithStats = useMemo(() => {
    return posts.map((post) => {
      const pId = String(post.id || '');
      const metaPId = String(post.meta_post_id || '');

      const postComments = comments.filter(
        (c) => String(c.post_id) === pId || String(c.post_id) === metaPId
      );

      let positive = 0;
      let neutral = 0;
      let negative = 0;
      let analyzed = 0;

      postComments.forEach((c) => {
        if (c.sentiment_level) {
          analyzed++;
          const s = String(c.sentiment_level).toLowerCase();
          if (s.includes('pos')) positive++;
          else if (s.includes('neg')) negative++;
          else neutral++;
        }
      });

      // Fallback to raw_data if comments table has less
      const rawDist = post.raw_data?.sentiment_distribution;
      if (analyzed === 0 && rawDist && rawDist.total > 0) {
        positive = rawDist.positivo || 0;
        neutral = rawDist.neutral || 0;
        negative = rawDist.negativo || 0;
        analyzed = rawDist.total || 0;
      }

      const total = postComments.length || post.comments_count || 0;
      const positivePct = analyzed > 0 ? Math.round((positive / analyzed) * 100) : 0;
      const neutralPct = analyzed > 0 ? Math.round((neutral / analyzed) * 100) : 0;
      const negativePct = analyzed > 0 ? Math.round((negative / analyzed) * 100) : 0;

      return {
        post,
        commentsCount: total,
        analyzedCount: analyzed,
        pendingCount: Math.max(0, total - analyzed),
        positive,
        neutral,
        negative,
        positivePct,
        neutralPct,
        negativePct,
      };
    });
  }, [posts, comments]);

  // Filtered & Sorted Posts
  const filteredPosts = useMemo(() => {
    let result = [...postsWithStats];

    if (postSearch.trim()) {
      const q = postSearch.toLowerCase();
      result = result.filter(
        (item) =>
          (item.post.message && item.post.message.toLowerCase().includes(q)) ||
          item.post.meta_post_id.includes(q)
      );
    }

    result.sort((a, b) => {
      if (postSort === 'most_comments') return b.commentsCount - a.commentsCount;
      if (postSort === 'most_positive') return b.positivePct - a.positivePct;
      if (postSort === 'most_negative') return b.negativePct - a.negativePct;
      // recent
      const dateA = new Date(a.post.created_time || 0).getTime();
      const dateB = new Date(b.post.created_time || 0).getTime();
      return dateB - dateA;
    });

    return result;
  }, [postsWithStats, postSearch, postSort]);

  // Filtered Comments for the drill-down comments section
  const filteredComments = useMemo(() => {
    return comments.filter((c) => {
      // 1. Sentiment filter (5 niveles exactos + pending)
      if (sentimentFilter !== 'all') {
        if (sentimentFilter === 'pending') {
          if (c.sentiment_level) return false;
        } else {
          if (!c.sentiment_level) return false;
          const s = String(c.sentiment_level).toUpperCase().trim();
          const target = sentimentFilter.toUpperCase().trim();
          if (target === 'MUY POSITIVO' && !(s.includes('MUY POS') || s.includes('MUY_POS'))) return false;
          if (target === 'POSITIVO' && (!s.includes('POS') || s.includes('MUY'))) return false;
          if ((target === 'NEUTRAL' || target === 'NEUTRO') && !(s.includes('NEU') || s.includes('NEUTRO') || s.includes('NEUTRAL'))) return false;
          if (target === 'NEGATIVO' && (!s.includes('NEG') || s.includes('MUY'))) return false;
          if (target === 'MUY NEGATIVO' && !(s.includes('MUY NEG') || s.includes('MUY_NEG'))) return false;
        }
      }

      // 2. Interest filter (5 niveles: MUY ALTO, ALTO, MEDIO, BAJO, MUY BAJO)
      if (interestFilter !== 'all') {
        if (!c.interest_level) return false;
        const i = String(c.interest_level).toUpperCase().trim();
        const target = interestFilter.toUpperCase().trim();
        if (target === 'MUY ALTO' && !(i.includes('MUY ALT') || i.includes('MUY_ALT'))) return false;
        if (target === 'ALTO' && (!i.includes('ALT') || i.includes('MUY'))) return false;
        if (target === 'MEDIO' && !i.includes('MED')) return false;
        if (target === 'BAJO' && (!i.includes('BAJ') || i.includes('MUY'))) return false;
        if (target === 'MUY BAJO' && !(i.includes('MUY BAJ') || i.includes('MUY_BAJ') || i.includes('NINGUN') || i.includes('NONE') || i.includes('SIN'))) return false;
      }

      // 3. Priority filter (5 niveles: ALTA, MEDIA, BAJA, MUY ALTA, MUY BAJA)
      if (priorityFilter !== 'all') {
        if (!c.priority_level) return false;
        const p = String(c.priority_level).toUpperCase().trim();
        const target = priorityFilter.toUpperCase().trim();
        if ((target === 'MUY ALTA' || target === 'MUY ALTO') && !(p.includes('MUY ALT') || p.includes('MUY_ALT') || p.includes('URGENT'))) return false;
        if ((target === 'ALTA' || target === 'ALTO') && (!p.includes('ALT') || p.includes('MUY'))) return false;
        if ((target === 'MEDIA' || target === 'MEDIO') && !p.includes('MED')) return false;
        if ((target === 'BAJA' || target === 'BAJO') && (!p.includes('BAJ') || p.includes('MUY'))) return false;
        if ((target === 'MUY BAJA' || target === 'MUY BAJO') && !(p.includes('MUY BAJ') || p.includes('MUY_BAJ'))) return false;
      }

      // 4. Post Filter
      if (selectedPostIdFilter !== 'all') {
        const targetPost = posts.find(
          (p) => String(p.id) === String(selectedPostIdFilter) || String(p.meta_post_id) === String(selectedPostIdFilter)
        );
        const validIds = new Set<string>();
        validIds.add(String(selectedPostIdFilter));
        if (targetPost?.id) validIds.add(String(targetPost.id));
        if (targetPost?.meta_post_id) validIds.add(String(targetPost.meta_post_id));

        const commentPostId = String(c.post_id || '');
        if (!validIds.has(commentPostId)) {
          return false;
        }
      }

      // 5. Date / Time Filter (por defecto: comentarios del último año)
      if (dateFilter !== 'all') {
        const timeStr = c.created_time || c.created_at;
        if (timeStr) {
          const t = new Date(timeStr).getTime();
          const now = Date.now();
          if (dateFilter === '1year' && now - t > 365 * 24 * 3600 * 1000) return false;
          if (dateFilter === '6months' && now - t > 180 * 24 * 3600 * 1000) return false;
          if (dateFilter === '30days' && now - t > 30 * 24 * 3600 * 1000) return false;
        }
      }

      // 6. Search text
      if (commentSearch.trim()) {
        const q = commentSearch.toLowerCase();
        const msg = (c.message || '').toLowerCase();
        const author = resolveCommentAuthorName(c).toLowerCase();
        const reason = (c.reason || '').toLowerCase();
        const intent = (c.intent || '').toLowerCase();
        if (!msg.includes(q) && !author.includes(q) && !reason.includes(q) && !intent.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [comments, sentimentFilter, interestFilter, priorityFilter, selectedPostIdFilter, dateFilter, commentSearch, posts]);

  // Handler to smoothly scroll to comments section
  const scrollToComments = (sentiment?: 'Positivo' | 'Neutral' | 'Negativo' | 'all') => {
    if (sentiment) setSentimentFilter(sentiment);
    const el = document.getElementById('section-comments-explorer');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleFilterByPost = (postId: string | number) => {
    setSelectedPostIdFilter(String(postId));
    scrollToComments();
  };

  return (
    <div id="ai-reports-view" className="space-y-8 animate-fadeIn">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#0B0F19] text-[#21B6EA] flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0B0F19] tracking-tight">
              Reporte de Análisis con Inteligencia Artificial
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tablero integral de sentimiento, nivel de interés comercial y prioridades detectadas en los comentarios de Meta.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* ÚNICO BOTÓN: Actualizar directamente desde la Base de Datos (sin llamar a Meta ni a la IA) */}
          <button
            type="button"
            onClick={async () => {
              await onRefresh();
              await loadComments();
            }}
            disabled={isLoadingComments}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#0B0F19] bg-white hover:bg-[#E8F8FE] border border-slate-200 hover:border-[#21B6EA] flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
            title="Actualizar métricas y comentarios directamente desde la Base de Datos (PostgreSQL/Supabase) sin llamar a Meta"
          >
            <Database className={`w-3.5 h-3.5 text-[#0369A1] ${isLoadingComments ? 'animate-spin' : ''}`} />
            <span>{isLoadingComments ? 'Actualizando BD...' : 'Actualizar'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 1: DASHBOARD TOTAL DE SENTIMIENTO PARA TODOS LOS POSTS            */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#0369A1]" />
            <h3 className="text-sm sm:text-base font-extrabold text-[#0B0F19] tracking-tight">
              1. Resultado Global de Sentimiento (Todos los Posts)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {metrics.analyzedCount} de {metrics.totalComments} comentarios calificados ({metrics.coveragePct}% de cobertura)
          </span>
        </div>

        {/* Big Sentiment KPI Cards - Interactive click to filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card Total Analizados */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Total Comentarios
              </span>
              <span className="w-8 h-8 rounded-xl bg-[#E8F8FE] text-[#0369A1] flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0B0F19] font-mono tabular-nums">
                {metrics.totalComments}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-mono tabular-nums">
                <span className="font-bold text-[#0369A1]">{metrics.analyzedCount} analizados</span>
                <span>·</span>
                <span className="text-amber-700 font-semibold">{metrics.pendingCount} pendientes</span>
              </div>
            </div>
          </div>

          {/* Card Positivos */}
          <div
            onClick={() => scrollToComments('Positivo')}
            className="bg-white hover:bg-emerald-50/40 p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-xs cursor-pointer transition-all hover:border-emerald-400 group flex flex-col justify-between"
            title="Haz clic para ver todos los comentarios positivos"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                Positivos
              </span>
              <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 font-mono tabular-nums">
                {metrics.positivePct}%
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono tabular-nums">
                {metrics.positiveCount}
              </div>
              <div className="flex items-center justify-between text-xs text-emerald-700 mt-1">
                <span>Comentarios favorables</span>
                <span className="text-[11px] font-bold text-emerald-800 group-hover:underline flex items-center gap-0.5">
                  Ver lista &rarr;
                </span>
              </div>
            </div>
          </div>

          {/* Card Neutros */}
          <div
            onClick={() => scrollToComments('Neutral')}
            className="bg-white hover:bg-[#F4F8FB] p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs cursor-pointer transition-all hover:border-[#21B6EA] group flex flex-col justify-between"
            title="Haz clic para ver todos los comentarios neutros"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                <MinusCircle className="w-3.5 h-3.5 text-slate-500" />
                Neutros
              </span>
              <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-[#1E293B] font-mono tabular-nums">
                {metrics.neutralPct}%
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] font-mono tabular-nums">
                {metrics.neutralCount}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 mt-1">
                <span>Consultas o informativos</span>
                <span className="text-[11px] font-bold text-[#0369A1] group-hover:underline flex items-center gap-0.5">
                  Ver lista &rarr;
                </span>
              </div>
            </div>
          </div>

          {/* Card Negativos */}
          <div
            onClick={() => scrollToComments('Negativo')}
            className="bg-white hover:bg-rose-50/40 p-4 sm:p-5 rounded-2xl border border-rose-200 shadow-xs cursor-pointer transition-all hover:border-rose-400 group flex flex-col justify-between"
            title="Haz clic para ver todos los comentarios negativos"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-rose-800 tracking-wider flex items-center gap-1.5">
                <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
                Negativos
              </span>
              <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-rose-100 text-rose-800 font-mono tabular-nums">
                {metrics.negativePct}%
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-700 font-mono tabular-nums">
                {metrics.negativeCount}
              </div>
              <div className="flex items-center justify-between text-xs text-rose-700 mt-1">
                <span>Reclamos o críticas</span>
                <span className="text-[11px] font-bold text-rose-800 group-hover:underline flex items-center gap-0.5">
                  Ver lista &rarr;
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Progress Multi-Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#0B0F19]">
              Distribución Proporcional de Sentimiento Global
            </span>
            <span className="text-slate-500 font-mono tabular-nums">
              Base: {metrics.analyzedCount} comentarios clasificados
            </span>
          </div>

          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${metrics.positivePct}%` }}
              className="bg-emerald-500 h-full transition-all duration-500 hover:opacity-90"
              title={`Positivos: ${metrics.positiveCount} (${metrics.positivePct}%)`}
            />
            <div
              style={{ width: `${metrics.neutralPct}%` }}
              className="bg-slate-400 h-full transition-all duration-500 hover:opacity-90"
              title={`Neutros: ${metrics.neutralCount} (${metrics.neutralPct}%)`}
            />
            <div
              style={{ width: `${metrics.negativePct}%` }}
              className="bg-rose-500 h-full transition-all duration-500 hover:opacity-90"
              title={`Negativos: ${metrics.negativeCount} (${metrics.negativePct}%)`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
            <div className="flex items-center gap-4 font-mono tabular-nums">
              <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Positivos ({metrics.positivePct}%)
              </span>
              <span className="flex items-center gap-1.5 text-[#1E293B] font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                Neutros ({metrics.neutralPct}%)
              </span>
              <span className="flex items-center gap-1.5 text-rose-800 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Negativos ({metrics.negativePct}%)
              </span>
            </div>

            {metrics.pendingCount > 0 && (
              <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 font-mono tabular-nums">
                Hay {metrics.pendingCount} comentarios pendientes de clasificar con IA
              </span>
            )}
          </div>
        </div>

        {/* Secondary Dimensions: Interés Comercial & Prioridad de Respuesta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nivel de Interés Comercial */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#0369A1]" />
                <h4 className="text-xs sm:text-sm font-bold text-[#0B0F19]">
                  Interés Comercial (Leads y Oportunidades)
                </h4>
              </div>
              <span className="text-[11px] text-[#0369A1] bg-[#E8F8FE] px-2 py-0.5 rounded-md font-bold font-mono tabular-nums">
                {metrics.interest.alto + metrics.interest.medio} prospectos
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span className="font-semibold text-[#0B0F19]">Alto (Intención de compra)</span>
                  <span className="font-mono tabular-nums font-bold text-[#0B0F19]">{metrics.interest.alto}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0B0F19] rounded-full"
                    style={{
                      width: `${metrics.analyzedCount > 0 ? (metrics.interest.alto / metrics.analyzedCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span className="font-semibold text-[#0369A1]">Medio (Pregunta por precio/servicio)</span>
                  <span className="font-mono tabular-nums font-bold text-[#0369A1]">{metrics.interest.medio}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#21B6EA] rounded-full"
                    style={{
                      width: `${metrics.analyzedCount > 0 ? (metrics.interest.medio / metrics.analyzedCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span className="text-slate-600">Bajo / Ninguno</span>
                  <span className="font-mono tabular-nums text-slate-700">
                    {metrics.interest.bajo + metrics.interest.ninguno}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-400 rounded-full"
                    style={{
                      width: `${
                        metrics.analyzedCount > 0
                          ? ((metrics.interest.bajo + metrics.interest.ninguno) / metrics.analyzedCount) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Prioridad de Atención */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0369A1]" />
                <h4 className="text-xs sm:text-sm font-bold text-[#0B0F19]">
                  Prioridad de Respuesta Inmediata
                </h4>
              </div>
              <span className="text-[11px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 font-mono tabular-nums">
                {metrics.priority.alta} urgente
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span className="font-semibold text-rose-800">Alta (Requiere respuesta rápida)</span>
                  <span className="font-mono tabular-nums font-bold text-rose-700">{metrics.priority.alta}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: `${metrics.analyzedCount > 0 ? (metrics.priority.alta / metrics.analyzedCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span className="font-semibold text-amber-800">Media (Interacción normal)</span>
                  <span className="font-mono tabular-nums font-bold text-amber-700">{metrics.priority.media}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${metrics.analyzedCount > 0 ? (metrics.priority.media / metrics.analyzedCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span className="text-slate-600">Baja (Saludos o reacciones)</span>
                  <span className="font-mono tabular-nums text-slate-700">{metrics.priority.baja}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-400 rounded-full"
                    style={{
                      width: `${metrics.analyzedCount > 0 ? (metrics.priority.baja / metrics.analyzedCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECCIÓN 2: RESULTADO LUEGO POR CADA POST                                 */}
      {/* ========================================================================= */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0369A1]" />
            <h3 className="text-sm sm:text-base font-extrabold text-[#0B0F19] tracking-tight">
              2. Desglose de Sentimiento por Publicación ({filteredPosts.length} posts)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Posts */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={postSearch}
                onChange={(e) => setPostSearch(e.target.value)}
                placeholder="Buscar por texto de post..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-[#0B0F19] focus:outline-none focus:ring-2 focus:ring-[#21B6EA] focus:border-[#21B6EA] w-44 sm:w-56"
              />
            </div>

            {/* Sort Posts */}
            <select
              value={postSort}
              onChange={(e: any) => setPostSort(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl border border-slate-200 text-xs bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#21B6EA] font-semibold cursor-pointer"
            >
              <option value="most_comments">Más comentarios</option>
              <option value="most_positive">Mayor % Positivo</option>
              <option value="most_negative">Mayor % Negativo</option>
              <option value="recent">Más recientes</option>
            </select>
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No se encontraron publicaciones con los criterios de búsqueda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPosts.map((item) => {
              const { post } = item;
              const attachment = post.raw_data?.attachments?.data?.[0];
              const imageUrl = attachment?.media?.image?.src;
              const isSelected = selectedPostIdFilter === String(post.id || post.meta_post_id);

              return (
                <div
                  key={post.meta_post_id}
                  className={`bg-white rounded-2xl border transition-all p-4 flex flex-col justify-between shadow-xs ${
                    isSelected
                      ? 'border-[#21B6EA] ring-2 ring-[#21B6EA]/25'
                      : 'border-slate-200 hover:border-[#21B6EA]/70'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[#F4F8FB] flex items-center justify-center text-slate-400 shrink-0 border border-slate-200">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#0B0F19] line-clamp-2 leading-snug">
                            {post.message || 'Publicación sin texto (imagen o video)'}
                          </p>
                          <span className="text-[11px] text-slate-400 mt-0.5 block font-mono tabular-nums">
                            {post.created_time
                              ? new Date(post.created_time).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'Fecha no disponible'}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-1 rounded-lg text-xs font-mono tabular-nums font-bold bg-[#F4F8FB] text-[#0B0F19] border border-slate-200 shrink-0">
                        {item.commentsCount} com.
                      </span>
                    </div>

                    {/* Progress Bar Sentimiento del Post */}
                    <div className="space-y-1.5 bg-[#F4F8FB] p-2.5 rounded-xl border border-slate-200/80">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#1E293B]">Sentimiento en este post:</span>
                        <div className="flex items-center gap-2 font-mono tabular-nums text-[10px]">
                          <span className="text-emerald-700 font-bold">+{item.positive}</span>
                          <span className="text-slate-500">={item.neutral}</span>
                          <span className="text-rose-700 font-bold">-{item.negative}</span>
                        </div>
                      </div>

                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${item.positivePct}%` }}
                          className="bg-emerald-500 h-full"
                          title={`Positivos: ${item.positive} (${item.positivePct}%)`}
                        />
                        <div
                          style={{ width: `${item.neutralPct}%` }}
                          className="bg-slate-400 h-full"
                          title={`Neutros: ${item.neutral} (${item.neutralPct}%)`}
                        />
                        <div
                          style={{ width: `${item.negativePct}%` }}
                          className="bg-rose-500 h-full"
                          title={`Negativos: ${item.negative} (${item.negativePct}%)`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 font-mono tabular-nums">
                        <span className="text-emerald-700 font-semibold">{item.positivePct}% positivo</span>
                        <span className="text-slate-500">{item.neutralPct}% neutro</span>
                        <span className="text-rose-700 font-semibold">{item.negativePct}% negativo</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this post */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleFilterByPost(post.id || post.meta_post_id)}
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#21B6EA] text-[#0B0F19]'
                          : 'bg-[#E8F8FE] text-[#0369A1] hover:bg-[#21B6EA]/25 border border-[#21B6EA]/30'
                      }`}
                      title="Filtrar los comentarios de abajo para ver solo los de este post"
                    >
                      <Filter className="w-3 h-3" />
                      <span>{isSelected ? 'Filtro activo' : 'Ver comentarios de este post'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {onSyncPostComments && (
                        <button
                          type="button"
                          onClick={() => onSyncPostComments(post)}
                          disabled={syncingPostId === (post.id || post.meta_post_id) || isAnalyzingAi}
                          className="text-[11px] font-semibold text-[#0369A1] hover:text-[#0B0F19] bg-[#F4F8FB] hover:bg-[#E8F8FE] px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-[#21B6EA] flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
                          title="Actualizar y descargar comentarios de este post desde Meta"
                        >
                          <RefreshCw className={`w-3 h-3 text-[#0369A1] ${syncingPostId === (post.id || post.meta_post_id) ? 'animate-spin' : ''}`} />
                          <span>{syncingPostId === (post.id || post.meta_post_id) ? 'Actualizando...' : 'Actualizar'}</span>
                        </button>
                      )}

                      {item.pendingCount > 0 && (
                        <button
                          type="button"
                          onClick={() => onAnalyzePostAi(post)}
                          disabled={isAnalyzingAi || syncingPostId === (post.id || post.meta_post_id)}
                          className="text-[11px] font-bold text-[#0B0F19] bg-[#21B6EA] hover:bg-[#14A3D6] px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
                          title="Analizar comentarios pendientes de este post con IA (llm_local_apikey)"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span className="font-mono tabular-nums">Analizar ({item.pendingCount})</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onSelectPost(post)}
                        className="text-xs font-semibold text-[#1E293B] hover:text-[#0B0F19] px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Abrir modal con todos los detalles y árbol de comentarios"
                      >
                        <span>Detalles</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECCIÓN 3: EXPLORADOR DETALLADO DE COMENTARIOS CALIFICADOS               */}
      {/* ========================================================================= */}
      <section id="section-comments-explorer" className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#0369A1]" />
              <h3 className="text-sm sm:text-base font-extrabold text-[#0B0F19] tracking-tight">
                3. Explorador de Comentarios Calificados por la IA
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtra y revisa los comentarios calificados con determinado valor de sentimiento, interés o prioridad.
            </p>
          </div>

          <span className="text-xs font-bold text-[#0B0F19] bg-white px-3 py-1 rounded-lg border border-slate-200 self-start sm:self-auto font-mono tabular-nums shadow-2xs">
            {filteredComments.length} comentarios encontrados
          </span>
        </div>

        {/* Filter controls bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Filter: Período de Tiempo (Por defecto: Último año) */}
            <div>
              <label className="text-[11px] font-bold uppercase text-[#0369A1] block mb-1 tracking-wider">
                Antigüedad (IA):
              </label>
              <select
                value={dateFilter}
                onChange={(e: any) => setDateFilter(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-xl border border-[#21B6EA]/40 text-xs bg-[#E8F8FE]/60 text-[#0B0F19] font-bold focus:outline-none focus:ring-2 focus:ring-[#21B6EA] cursor-pointer"
              >
                <option value="1year">Último año (defecto)</option>
                <option value="6months">Últimos 6 meses</option>
                <option value="30days">Últimos 30 días</option>
                <option value="all">Todo el historial</option>
              </select>
            </div>

            {/* Filter: Sentimiento (Valores en MAYÚSCULAS) */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1 tracking-wider">
                Sentimiento:
              </label>
              <select
                value={sentimentFilter}
                onChange={(e: any) => setSentimentFilter(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 text-xs bg-[#F8FAFC] text-[#0B0F19] focus:outline-none focus:ring-2 focus:ring-[#21B6EA] font-semibold cursor-pointer"
              >
                <option value="all">TODOS LOS SENTIMIENTOS</option>
                <option value="MUY POSITIVO">MUY POSITIVO</option>
                <option value="POSITIVO">POSITIVO</option>
                <option value="NEUTRO">NEUTRO</option>
                <option value="NEGATIVO">NEGATIVO</option>
                <option value="MUY NEGATIVO">MUY NEGATIVO</option>
                <option value="pending">PENDIENTE / SIN ANALIZAR</option>
              </select>
            </div>

            {/* Filter: Interés (Valores en MAYÚSCULAS) */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1 tracking-wider">
                Interés Comercial:
              </label>
              <select
                value={interestFilter}
                onChange={(e: any) => setInterestFilter(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 text-xs bg-[#F8FAFC] text-[#0B0F19] focus:outline-none focus:ring-2 focus:ring-[#21B6EA] cursor-pointer font-semibold"
              >
                <option value="all">TODOS LOS NIVELES DE INTERÉS</option>
                <option value="MUY ALTO">MUY ALTO</option>
                <option value="ALTO">ALTO</option>
                <option value="MEDIO">MEDIO</option>
                <option value="BAJO">BAJO</option>
                <option value="MUY BAJO">MUY BAJO</option>
              </select>
            </div>

            {/* Filter: Prioridad (Valores en MAYÚSCULAS) */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1 tracking-wider">
                Prioridad de Respuesta:
              </label>
              <select
                value={priorityFilter}
                onChange={(e: any) => setPriorityFilter(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 text-xs bg-[#F8FAFC] text-[#0B0F19] focus:outline-none focus:ring-2 focus:ring-[#21B6EA] cursor-pointer font-semibold"
              >
                <option value="all">TODAS LAS PRIORIDADES</option>
                <option value="MUY ALTA">MUY ALTA</option>
                <option value="ALTA">ALTA</option>
                <option value="MEDIA">MEDIA</option>
                <option value="BAJA">BAJA</option>
                <option value="MUY BAJA">MUY BAJA</option>
              </select>
            </div>

            {/* Filter: Publicación específica con conteo de comentarios */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase text-slate-500 block tracking-wider">
                  Filtrar por Post:
                </label>
                {selectedPostIdFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedPostIdFilter('all')}
                    className="text-[10px] text-[#0369A1] hover:text-[#0B0F19] font-bold cursor-pointer underline"
                  >
                    Ver todos
                  </button>
                )}
              </div>
              <select
                value={selectedPostIdFilter}
                onChange={(e) => setSelectedPostIdFilter(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-xl border border-[#21B6EA]/40 text-xs bg-[#E8F8FE]/40 text-[#0B0F19] font-semibold focus:outline-none focus:ring-2 focus:ring-[#21B6EA] truncate cursor-pointer"
              >
                <option value="all">Todos los posts ({posts.length})</option>
                {posts.map((p) => {
                  const pId = String(p.id || '');
                  const metaPId = String(p.meta_post_id || '');
                  const pCommentsCount = comments.filter(
                    (c) => String(c.post_id) === pId || String(c.post_id) === metaPId
                  ).length || p.comments_count || 0;
                  const snippet = (p.message || 'Publicación sin texto').replace(/\n/g, ' ').slice(0, 36);
                  return (
                    <option key={p.meta_post_id} value={String(p.id || p.meta_post_id)}>
                      Post #{p.id || p.meta_post_id.slice(-6)} · ({pCommentsCount} com.) · {snippet}...
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Search bar inside comments & Reset filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={commentSearch}
                onChange={(e) => setCommentSearch(e.target.value)}
                placeholder="Buscar por texto, autor o motivo IA..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-[#F8FAFC] text-[#0B0F19] focus:outline-none focus:ring-2 focus:ring-[#21B6EA] focus:bg-white"
              />
            </div>

            {(sentimentFilter !== 'all' ||
              interestFilter !== 'all' ||
              priorityFilter !== 'all' ||
              selectedPostIdFilter !== 'all' ||
              dateFilter !== '1year' ||
              commentSearch.trim()) && (
              <button
                type="button"
                onClick={() => {
                  setSentimentFilter('all');
                  setInterestFilter('all');
                  setPriorityFilter('all');
                  setSelectedPostIdFilter('all');
                  setDateFilter('1year');
                  setCommentSearch('');
                }}
                className="text-xs text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1 cursor-pointer self-end sm:self-auto"
              >
                <X className="w-3.5 h-3.5" />
                <span>Limpiar todos los filtros</span>
              </button>
            )}
          </div>
        </div>

        {/* Banner visible cuando hay un Post filtrado */}
        {selectedPostIdFilter !== 'all' && (() => {
          const currentPost = posts.find(
            (p) => String(p.id) === String(selectedPostIdFilter) || String(p.meta_post_id) === String(selectedPostIdFilter)
          );
          return (
            <div className="bg-[#E8F8FE] border border-[#21B6EA]/45 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#0B0F19] shadow-xs animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#0B0F19] text-[#21B6EA] shrink-0">
                  <Filter className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="font-bold text-[#0B0F19]">
                    Filtrando comentarios exclusivamente del Post #{currentPost?.id || selectedPostIdFilter}:
                  </span>
                  <span className="ml-1 text-[#1E293B] italic">
                    &ldquo;{currentPost?.message ? currentPost.message.slice(0, 70) + '...' : 'Publicación de Meta'}&rdquo;
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPostIdFilter('all')}
                className="text-xs font-bold text-[#0B0F19] hover:bg-slate-50 bg-white px-2.5 py-1 rounded-lg border border-slate-300 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                <span>Quitar filtro de post</span>
              </button>
            </div>
          );
        })()}

        {/* Comments Cards List */}
        {isLoadingComments ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#21B6EA] mx-auto" />
            <p className="text-xs text-slate-500">Cargando comentarios y calificaciones de IA...</p>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
            <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-[#0B0F19]">
              No hay comentarios con los filtros seleccionados
            </p>
            <p className="text-xs text-slate-500">
              Prueba cambiando o limpiando los filtros de sentimiento o búsqueda de texto.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredComments.map((comment) => {
              const sentimentStr = String(comment.sentiment_level || '').toLowerCase();
              const isPos = sentimentStr.includes('pos');
              const isNeg = sentimentStr.includes('neg');
              const isNeu = sentimentStr.includes('neu');

              const parentPost = postsMap.get(String(comment.post_id));

              return (
                <div
                  key={comment.meta_comment_id || comment.id}
                  className={`bg-white rounded-xl border p-4 transition-all shadow-xs space-y-3 ${
                    isPos
                      ? 'border-emerald-200 hover:border-emerald-300'
                      : isNeg
                      ? 'border-rose-200 hover:border-rose-300 bg-rose-50/15'
                      : isNeu
                      ? 'border-slate-200 hover:border-[#21B6EA]/60'
                      : 'border-amber-200 bg-amber-50/15'
                  }`}
                >
                  {/* Top line: Author, Date, and Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#0B0F19] text-[#21B6EA] flex items-center justify-center text-xs font-bold border border-slate-700 shadow-2xs">
                        {resolveCommentAuthorName(comment).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#0B0F19]">
                          {resolveCommentAuthorName(comment)}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-2 font-mono tabular-nums">
                          {comment.created_time
                            ? new Date(comment.created_time).toLocaleString('es-ES', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : 'Fecha desconocida'}
                        </span>
                      </div>
                    </div>

                    {/* AI Qualification Badges: OBLIGATORIAMENTE LOS 3 NIVELES EN MAYÚSCULAS */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* 1. Sentiment Badge */}
                      {comment.sentiment_level && !['pending', 'pendiente'].includes(String(comment.sentiment_level).toLowerCase()) ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border uppercase ${
                            isPos
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : isNeg
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-slate-100 text-[#1E293B] border-slate-300'
                          }`}
                        >
                          {isPos && <ThumbsUp className="w-3 h-3" />}
                          {isNeg && <ThumbsDown className="w-3 h-3" />}
                          {isNeu && <MinusCircle className="w-3 h-3" />}
                          <span>{String(comment.sentiment_level).toUpperCase()}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                          SENTIMIENTO: PENDIENTE
                        </span>
                      )}

                      {/* 2. Interest Badge */}
                      {comment.interest_level && !['pending', 'pendiente'].includes(String(comment.interest_level).toLowerCase()) ? (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border uppercase ${
                            String(comment.interest_level).toLowerCase().includes('alt')
                              ? 'bg-[#0B0F19] text-[#21B6EA] border-[#0B0F19] font-bold'
                              : String(comment.interest_level).toLowerCase().includes('med')
                              ? 'bg-[#E8F8FE] text-[#0369A1] border-[#21B6EA]/40 font-bold'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          INTERÉS: {String(comment.interest_level).toUpperCase()}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                          INTERÉS: PENDIENTE
                        </span>
                      )}

                      {/* 3. Priority Badge */}
                      {comment.priority_level && !['pending', 'pendiente'].includes(String(comment.priority_level).toLowerCase()) ? (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border uppercase ${
                            String(comment.priority_level).toLowerCase().includes('alt')
                              ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
                              : String(comment.priority_level).toLowerCase().includes('med')
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          PRIORIDAD: {String(comment.priority_level).toUpperCase()}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                          PRIORIDAD: PENDIENTE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Comment message */}
                  <p className="text-xs sm:text-sm text-[#0B0F19] leading-relaxed font-normal bg-[#F4F8FB] p-3 rounded-xl border border-slate-200/70">
                    {comment.message || <span className="italic text-slate-400">Sin contenido de texto</span>}
                  </p>

                  {/* AI Explanation / Reasoning Box */}
                  {(comment.reason || comment.intent) && (
                    <div className="p-3 rounded-xl bg-[#E8F8FE]/70 border border-[#21B6EA]/30 text-xs text-[#0B0F19] space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[11px] text-[#0369A1] uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-[#0369A1]" />
                        <span>Justificación de la IA</span>
                      </div>
                      {comment.reason && (
                        <p className="text-[#1E293B] leading-relaxed">
                          <strong className="text-[#0B0F19]">Motivo:</strong> {comment.reason}
                        </p>
                      )}
                      {comment.intent && (
                        <p className="text-[#1E293B] text-[11px]">
                          <strong className="text-[#0B0F19]">Intención detectada:</strong> {comment.intent}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Associated Post context & link */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 truncate max-w-md">
                      <span className="font-bold text-[#1E293B] font-mono tabular-nums">En Post #{parentPost?.id || comment.post_id}:</span>
                      <span className="truncate italic text-slate-600">
                        {parentPost?.message
                          ? `"${parentPost.message.slice(0, 50)}..."`
                          : `ID: ${comment.post_id}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedPostIdFilter(String(parentPost?.id || comment.post_id))}
                        className="ml-1 text-[10px] font-bold text-[#0369A1] hover:text-[#0B0F19] bg-[#E8F8FE] hover:bg-[#21B6EA]/25 px-2 py-0.5 rounded border border-[#21B6EA]/30 transition-colors cursor-pointer shrink-0"
                        title="Filtrar comentarios solo de este post"
                      >
                        Filtrar este post
                      </button>
                    </div>

                    {parentPost && (
                      <button
                        type="button"
                        onClick={() => onSelectPost(parentPost)}
                        className="font-bold text-[#0369A1] hover:text-[#0B0F19] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Ver post completo</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
