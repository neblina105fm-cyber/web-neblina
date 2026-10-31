import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.hash = '';
    window.location.search = '';
    if (window.location.pathname.endsWith('/admin') || window.location.pathname.endsWith('/clientes')) {
      window.location.pathname = window.location.pathname.replace(/\/(admin|clientes|aliados|locutores|periodistas|redaccion)$/, '') || '/';
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const { fallbackTitle = 'Ha ocurrido un inconveniente al cargar esta sección' } = this.props;
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 text-white font-sans selection:bg-[#00DD9E] selection:text-[#001E4D]">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-[#0c141f] border border-white/10 shadow-2xl text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/30">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-display font-black text-lg sm:text-xl text-white">
                {fallbackTitle}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                El sistema detectó un error al inicializar el componente. Puedes recargar la página o volver a la portada de Neblina Stereo.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-left font-mono text-[11px] text-rose-300 max-h-32 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#00DD9E] text-[#001E4D] font-black text-xs transition cursor-pointer hover:brightness-105 active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reintentar Carga</span>
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer active:scale-95"
              >
                <Home className="w-4 h-4" />
                <span>Volver a la Web</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
