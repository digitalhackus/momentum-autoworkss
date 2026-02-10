import { ReactNode } from "react";
import { Lock, Sparkles, Rocket, Clock } from "lucide-react";
import { motion } from "motion/react";

interface ComingSoonProps {
  children: ReactNode;
  featureName: string;
  description: string;
  icon?: "rocket" | "sparkles" | "clock";
}

export function ComingSoon({ children, featureName, description, icon = "sparkles" }: ComingSoonProps) {
  const Icon = icon === "rocket" ? Rocket : icon === "clock" ? Clock : Sparkles;

  return (
    <div className="relative h-[calc(100vh-140px)] w-full rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm bg-slate-50/30">
      {/* Background content (blurred) */}
      <div className="filter blur-md opacity-40 select-none pointer-events-none p-4 h-full overflow-hidden">
        {children}
      </div>

      {/* Clean Glass Overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-6 bg-white/5 backdrop-blur-[4px]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-10 text-center space-y-6"
        >
          {/* Subtle Icon Container */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-theme/5 border border-theme/10 mb-2">
            <Icon className="h-8 w-8 text-theme" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {featureName}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-[280px] mx-auto">
              {description}
            </p>
          </div>

          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-semibold tracking-wide uppercase">
              <Lock className="h-3 w-3" />
              Under Development
            </div>
          </div>

          <p className="text-[10px] text-slate-400 font-medium pt-2">
            Expected in a future release of Momentum AutoWorks
          </p>
        </motion.div>
      </div>
    </div>
  );
}
