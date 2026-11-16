import React from 'react';
import { useAuth } from '../AuthContext';
import { isSupabaseConfigured } from '../supabase';
import { ShieldCheck, AlertCircle, Lock, AlertTriangle } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { handleLogin, isLoggingIn, loginError } = useAuth();

  return (
    <div
      id="login-container"
      className="min-h-screen bg-[#0B0F19] bg-brand-twilight flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-white"
    >
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Columna izquierda: Identidad Brand Book Promptia.lat */}
        <div className="lg:col-span-6 text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1E293B]/90 border border-[#21B6EA]/35 p-2.5 flex items-center justify-center shadow-lg">
              <img
                src="/promptia_logo.png"
                alt="Promptia.lat Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#21B6EA] block">
                Promptia.lat
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Social Suite
              </h1>
            </div>
          </div>

          <div className="space-y-3 max-w-lg mx-auto lg:mx-0">
            <blockquote className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug text-balance">
              &ldquo;Tu lógica opera sola,{' '}
              <span className="text-[#21B6EA]">el valor se multiplica.</span>&rdquo;
            </blockquote>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Plataforma de analítica social y sincronización inteligente con IA. Supervisa conversaciones, detecta oportunidades comerciales y mide el sentimiento de tu audiencia en tiempo real.
            </p>
          </div>

          {/* Pilares del Brand Book (sin badges tipo píldora saturados) */}
          <div className="pt-2 border-t border-white/10 max-w-md mx-auto lg:mx-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Principios operativos
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1 text-xs sm:text-sm font-semibold text-slate-200">
              <span>Innovación</span>
              <span className="text-[#21B6EA]" aria-hidden="true">·</span>
              <span>Productividad</span>
              <span className="text-[#21B6EA]" aria-hidden="true">·</span>
              <span>Seguridad</span>
              <span className="text-[#21B6EA]" aria-hidden="true">·</span>
              <span>Eficiencia</span>
            </div>
          </div>
        </div>

        {/* Columna derecha: Tarjeta Pure White de Acceso */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-white text-[#0B0F19] py-8 px-6 sm:px-9 shadow-2xl border border-slate-200/80 rounded-2xl">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#0B0F19] tracking-tight">Iniciar Sesión</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Accede al panel de tu empresa</p>
                </div>
                <span className="text-xs text-[#0369A1] flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#21B6EA]" /> Acceso Seguro
                </span>
              </div>

              {!isSupabaseConfigured && (
                <div className="p-3 bg-amber-50 text-amber-900 text-xs rounded-xl border border-amber-200 flex items-start gap-2 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Conexión a Supabase no configurada en este entorno.</strong> Configura las variables{' '}
                    <code className="font-mono font-semibold">VITE_SUPABASE_URL</code> y{' '}
                    <code className="font-mono font-semibold">VITE_SUPABASE_ANON_KEY</code> para autenticar usuarios reales.
                  </div>
                </div>
              )}

              {loginError && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs sm:text-sm rounded-xl border border-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>{loginError}</div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1E293B] mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="tu@empresa.com"
                  className="w-full border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm text-[#0B0F19] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#21B6EA] focus:border-[#21B6EA] bg-[#F8FAFC] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1E293B] mb-1.5">
                  Contraseña
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm text-[#0B0F19] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#21B6EA] focus:border-[#21B6EA] bg-[#F8FAFC] transition-colors"
                />
              </div>

              <button
                id="btn-login-submit"
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 px-4 bg-[#21B6EA] hover:bg-[#14A3D6] text-[#0B0F19] rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#21B6EA] disabled:opacity-50 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{isLoggingIn ? 'Iniciando sesión...' : 'Ingresar'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
