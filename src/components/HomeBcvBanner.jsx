import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Calculator, 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Building2, 
  DollarSign, 
  Euro, 
  Sparkles 
} from 'lucide-react';
import { getCachedBcvRates, fetchLiveBcvRates } from '../services/bcvService';

export default function HomeBcvBanner() {
  const [rates, setRates] = useState(() => getCachedBcvRates());
  const [loading, setLoading] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  // Estado de la Calculadora Rápida BCV
  const [amount, setAmount] = useState('10');
  const [currency, setCurrency] = useState('USD'); // 'USD' | 'EUR'
  const [direction, setDirection] = useState('to_bs'); // 'to_bs' (Divisa -> Bs) | 'from_bs' (Bs -> Divisa)
  const [copied, setCopied] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const fresh = await fetchLiveBcvRates();
      if (fresh) setRates(fresh);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    handleRefresh();
    const onUpdated = (e) => {
      if (e.detail) setRates(e.detail);
      else setRates(getCachedBcvRates());
    };
    window.addEventListener('neblina_bcv_rates_updated', onUpdated);
    return () => window.removeEventListener('neblina_bcv_rates_updated', onUpdated);
  }, []);

  const numericAmount = parseFloat(String(amount).replace(',', '.')) || 0;
  const activeRate = currency === 'EUR' ? (rates.eur || 1) : (rates.usd || 1);

  const convertedValue = direction === 'to_bs'
    ? numericAmount * activeRate
    : activeRate > 0 ? (numericAmount / activeRate) : 0;

  const formattedResult = direction === 'to_bs'
    ? `${convertedValue.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.`
    : `${convertedValue.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;

  const handleCopyResult = () => {
    const text = direction === 'to_bs'
      ? `${numericAmount.toFixed(2)} ${currency} = ${formattedResult} (Tasa BCV ${currency}: ${activeRate.toFixed(2)} Bs.)`
      : `${numericAmount.toFixed(2)} Bs. = ${formattedResult} (Tasa BCV ${currency}: ${activeRate.toFixed(2)} Bs.)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section aria-label="Indicadores Oficiales BCV y Calculadora" className="w-full">
      <div className="aeroglass-card rounded-2xl px-4 py-4 sm:px-6 sm:py-5 shadow-sm relative overflow-hidden">
        {/* Glow sutil */}
        <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-[#00DD9E]/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-44 h-44 rounded-full bg-[#001E4D]/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center gap-3">
          {/* 1. Fila Superior Centrada: Tasa Oficial BCV y Fecha */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-[#001E4D]/85 dark:bg-[#00DD9E]/20 text-white dark:text-[#00DD9E] backdrop-blur-md border border-[#001E4D]/25 dark:border-[#00DD9E]/40">
              <Building2 className="w-3.5 h-3.5" />
              <span>Tasa Oficial BCV</span>
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {rates.fechaValor || 'Vigente Hoy'}
            </span>
          </div>

          {/* 2. Fila Central Centrada: Tasa del Dólar, Tasa del Euro, Botón de Calculadora e Icono de Actualizar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {/* Dólar BCV */}
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white/65 dark:bg-white/[0.08] backdrop-blur-md border border-slate-200/80 dark:border-white/15 shadow-xs text-left">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E] flex items-center justify-center font-black text-xs border border-emerald-500/25">
                $
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300 block leading-none">
                  Dólar USD
                </span>
                <span className="font-mono tabular-nums font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                  {Number(rates.usd || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.
                </span>
              </div>
            </div>

            {/* Euro BCV */}
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white/65 dark:bg-white/[0.08] backdrop-blur-md border border-slate-200/80 dark:border-white/15 shadow-xs text-left">
              <span className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-700 dark:text-sky-400 flex items-center justify-center font-black text-xs border border-blue-500/25">
                €
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300 block leading-none">
                  Euro EUR
                </span>
                <span className="font-mono tabular-nums font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                  {Number(rates.eur || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.
                </span>
              </div>
            </div>

            {/* Botón Calculadora Rápida (Aero Glass) */}
            <button
              type="button"
              onClick={() => setCalcOpen(!calcOpen)}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-black backdrop-blur-md transition cursor-pointer border ${
                calcOpen
                  ? 'bg-[#001E4D]/90 text-white dark:bg-[#00DD9E]/85 dark:text-[#001E4D] border-[#001E4D]/40 dark:border-[#00DD9E] shadow-xs'
                  : 'bg-white/65 hover:bg-white/85 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white border-slate-300/80 dark:border-white/15'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{calcOpen ? 'Ocultar Calculadora' : 'Calculadora BCV'}</span>
            </button>

            {/* Botón Refrescar Tasa en Vivo al lado de la calculadora */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 rounded-xl bg-white/65 hover:bg-white/85 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md text-slate-700 dark:text-slate-200 border border-slate-300/80 dark:border-white/15 transition cursor-pointer disabled:opacity-50"
              title="Actualizar tasa BCV en vivo"
              aria-label="Actualizar tasa BCV"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* 3. Fila Inferior Centrada: Referencia del Banco Central de Venezuela en tiempo real */}
          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
            Referencia cambiaria del Banco Central de Venezuela en tiempo real
          </p>
        </div>

        {/* Panel Desplegable: Calculadora Rápida de Conversión BCV */}
        {calcOpen && (
          <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-white/10 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center bg-slate-50/90 dark:bg-[#0c141f]/70 p-3 rounded-lg border border-slate-200/80 dark:border-white/10">
              
              {/* Selector de Divisa (USD / EUR) */}
              <div className="md:col-span-3 flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-black transition cursor-pointer border ${
                    currency === 'USD'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-2xs'
                      : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
                  }`}
                >
                  $ Dólar (USD)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('EUR')}
                  className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-black transition cursor-pointer border ${
                    currency === 'EUR'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-2xs'
                      : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
                  }`}
                >
                  € Euro (EUR)
                </button>
              </div>

              {/* Input de Monto */}
              <div className="md:col-span-3 relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Monto..."
                  aria-label="Monto a convertir"
                  className="w-full px-3 py-2 pr-14 rounded-lg bg-white dark:bg-[#141d28] border border-slate-300 dark:border-white/15 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00DD9E]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400">
                  {direction === 'to_bs' ? currency : 'Bs.'}
                </span>
              </div>

              {/* Botón Invertir Conversión */}
              <div className="md:col-span-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setDirection(prev => prev === 'to_bs' ? 'from_bs' : 'to_bs')}
                  className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-200/80 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                  title="Invertir sentido de conversión"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{direction === 'to_bs' ? `${currency} → Bs.` : `Bs. → ${currency}`}</span>
                </button>
              </div>

              {/* Resultado + Botón Copiar */}
              <div className="md:col-span-4 flex items-center justify-between px-3.5 py-2 rounded-lg bg-[#001E4D]/10 dark:bg-[#00DD9E]/15 border border-[#001E4D]/20 dark:border-[#00DD9E]/30">
                <div className="min-w-0 pr-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300 block leading-none">
                    Equivalente Oficial BCV
                  </span>
                  <span className="font-mono font-black text-sm sm:text-base text-[#001E4D] dark:text-[#00DD9E] truncate block">
                    {formattedResult}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyResult}
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-white dark:bg-[#0c141f] text-slate-800 dark:text-white text-[11px] font-bold border border-slate-200 dark:border-white/15 hover:border-[#00DD9E] transition cursor-pointer shrink-0"
                  title="Copiar cálculo al portapapeles"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </section>
  );
}
