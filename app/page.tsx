import Workbench from '@/components/Workbench';
import { ShieldCheck, Zap, Lock, Code2 } from 'lucide-react';

const FEATURES = [
  { icon: Zap, title: 'Instant Conversion', desc: 'Live 300ms debounced preview as you type. No submit button needed.' },
  { icon: ShieldCheck, title: '100% Private', desc: 'Your schema never leaves your browser. Zero server calls, ever.' },
  { icon: Lock, title: 'Multi-Dialect', desc: 'PostgreSQL, MySQL, SQLite, SQL Server — all supported automatically.' },
  { icon: Code2, title: '4 Output Formats', desc: 'C# POCO, TypeScript interfaces, Mock JSON, and SQL INSERT statements.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col" style={{ fontFamily: 'var(--font-inter)' }}>
      {/* Hero section */}
      <div className="text-center px-4 pt-14 pb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide mb-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          100% Client-Side & Private — Zero Server Transmission
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-100 mb-4 leading-tight">
          SQL Schema to{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Code & Data
          </span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Paste any SQL <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded text-sm">CREATE TABLE</code> script.
          Instantly get C# models, TypeScript types, and realistic test data.
        </p>
      </div>

      {/* Workbench */}
      <div className="flex-1 px-4 pb-6 max-w-[1600px] w-full mx-auto">
        <Workbench />
      </div>

      {/* Feature pills */}
      <div className="px-4 pb-16 max-w-[1600px] w-full mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 hover:border-zinc-700/60 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">{title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
