import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: ""
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, errorMsg: "" });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center p-6 text-center">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/30 rounded-full blur-[100px] pointer-events-none" />
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amethyst-900/30 rounded-full blur-[100px] pointer-events-none" />
           
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="relative z-10 bg-dark-grey/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center"
           >
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                 <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Connection Dropped</h1>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                 {this.state.errorMsg || "We lost connection to the Vexox network. Please check your signal and try again."}
              </p>
              
              <button 
                onClick={this.handleRetry}
                className="w-full bg-white text-amethyst-950 font-bold py-3.5 px-6 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                 <RefreshCw className="w-4 h-4" />
                 Reconnect Network
              </button>
           </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
