'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import {
  Copy, Check, ShieldCheck, Settings2, Code2,
  Database, Download, RefreshCw, AlertTriangle
} from 'lucide-react';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-zinc-500 text-sm gap-2">
      <div className="w-4 h-4 border-2 border-zinc-600 border-t-indigo-500 rounded-full animate-spin" />
      Loading editor...
    </div>
  ),
});

const EDITOR_OPTIONS_INPUT = {
  minimap: { enabled: false },
  fontSize: 13,
  fontFamily: "'JetBrains Mono', 'Menlo', monospace",
  fontLigatures: true,
  padding: { top: 16, bottom: 16 },
  scrollBeyondLastLine: false,
  lineHeight: 1.7,
  renderLineHighlight: 'gutter' as const,
  cursorBlinking: 'smooth' as const,
  cursorSmoothCaretAnimation: 'on' as const,
  formatOnPaste: true,
  wordWrap: 'on' as const,
  smoothScrolling: true,
};

const EDITOR_OPTIONS_OUTPUT = {
  readOnly: true,
  minimap: { enabled: false },
  fontSize: 13,
  fontFamily: "'JetBrains Mono', 'Menlo', monospace",
  fontLigatures: true,
  padding: { top: 16, bottom: 16 },
  scrollBeyondLastLine: false,
  lineHeight: 1.7,
  renderLineHighlight: 'none' as const,
  matchBrackets: 'never' as const,
  hideCursorInOverviewRuler: true,
  wordWrap: 'on' as const,
  smoothScrolling: true,
};

const textareaClass =
  'w-full h-full resize-none bg-transparent text-zinc-100 font-mono text-[13px] leading-7 ' +
  'outline-none border-none p-4 placeholder-zinc-600 caret-indigo-400';
import { parseSqlDDL } from '@/lib/parser';
import { generateCSharpPoco } from '@/lib/generators/csharp';
import { generateTypeScript } from '@/lib/generators/typescript';
import { generateMockData } from '@/lib/generators/mockData';

export interface WorkbenchProps {
  defaultSql?: string;
  defaultTab?: 'csharp' | 'typescript' | 'json' | 'sql';
}

const DEFAULT_SQL = `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  role_id INT,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL,
  permissions JSONB
);`;

const TAB_CONFIG = [
  { id: 'csharp' as const, label: 'C# Model', ext: 'cs', lang: 'csharp' },
  { id: 'typescript' as const, label: 'TypeScript', ext: 'ts', lang: 'typescript' },
  { id: 'json' as const, label: 'Mock JSON', ext: 'json', lang: 'json' },
  { id: 'sql' as const, label: 'SQL Inserts', ext: 'sql', lang: 'sql' },
];

export default function Workbench({ defaultSql = DEFAULT_SQL, defaultTab = 'csharp' }: WorkbenchProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [sqlInput, setSqlInput] = useState(defaultSql);
  const [debouncedSql, setDebouncedSql] = useState(defaultSql);
  const [activeTab, setActiveTab] = useState<'csharp' | 'typescript' | 'json' | 'sql'>(defaultTab);
  const [mockRowCount, setMockRowCount] = useState(10);

  const [csharpOutput, setCsharpOutput] = useState('');
  const [tsOutput, setTsOutput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [sqlOutput, setSqlOutput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSql(sqlInput), 300);
    return () => clearTimeout(timer);
  }, [sqlInput]);

  // Generation
  useEffect(() => {
    let newError = '';
    let newCsharp = '';
    let newTs = '';
    let newJson = '';
    let newSql = '';

    try {
      const schemas = parseSqlDDL(debouncedSql);
      if (schemas.length === 0) {
        newError = 'No valid CREATE TABLE statements found. Paste a DDL script to get started.';
      } else {
        let csCode = '';
        let tsCode = '';
        const jsons: string[] = [];
        const sqls: string[] = [];

        for (const schema of schemas) {
          csCode += generateCSharpPoco(schema) + '\n';
          tsCode += generateTypeScript(schema) + '\n';
          const mock = generateMockData(schema, mockRowCount);
          jsons.push(mock.json);
          sqls.push(mock.sql);
        }

        newCsharp = csCode.trim();
        newTs = tsCode.trim();

        if (schemas.length > 1) {
          const combined = schemas.map((s, i) => `"${s.tableName}": ${jsons[i]}`).join(',\n  ');
          newJson = `{\n  ${combined}\n}`;
        } else {
          newJson = jsons[0];
        }

        newSql = sqls.join('\n');
      }
    } catch (err: unknown) {
      newError = err instanceof Error ? err.message : 'Error parsing SQL';
    }

    // Batch all state updates in one pass to avoid cascading renders
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: derives display state from debouncedSql
    setErrorMsg(newError);
    setCsharpOutput(newCsharp);
    setTsOutput(newTs);
    setJsonOutput(newJson);
    setSqlOutput(newSql);
  }, [debouncedSql, mockRowCount]);

  const getActiveContent = useCallback(() => {
    if (activeTab === 'csharp') return csharpOutput;
    if (activeTab === 'typescript') return tsOutput;
    if (activeTab === 'json') return jsonOutput;
    return sqlOutput;
  }, [activeTab, csharpOutput, tsOutput, jsonOutput, sqlOutput]);

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const tab = TAB_CONFIG.find(t => t.id === activeTab)!;
    const content = getActiveContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schema.${tab.ext}`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleReset = () => {
    setSqlInput(defaultSql);
  };

  const activeLanguage = TAB_CONFIG.find(t => t.id === activeTab)?.lang ?? 'plaintext';
  const showRowSlider = activeTab === 'json' || activeTab === 'sql';
  const activeContent = getActiveContent();

  return (
    <div className="flex flex-col w-full border border-zinc-800/60 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 bg-zinc-950 text-zinc-100"
      style={{ fontFamily: 'var(--font-inter)' }}>

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0">
            <Database className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              SchemaForge
            </span>
            <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold leading-none mt-0.5">
              Code & Data Generator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">100% Client-Side & Private — Zero Server Transmission</span>
          <span className="sm:hidden">100% Private</span>
        </div>
      </header>

      {/* Main Workspace — stacks vertically on mobile, side-by-side on desktop */}
      <main
        className="flex flex-col md:flex-row flex-1 overflow-hidden md:min-h-[520px] md:max-h-[760px]"
        style={isDesktop ? { height: 'calc(100vh - 9rem)' } : undefined}
      >

        {/* Left: SQL Input */}
        <div
          className="w-full md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-zinc-800/60"
          style={isDesktop ? undefined : { minHeight: '240px', maxHeight: '40vh' }}
        >
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/40 border-b border-zinc-800/60 flex-shrink-0">
            <div className="flex items-center gap-2 text-zinc-400">
              <Code2 className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">SQL Input</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 font-medium bg-zinc-800/60 px-2 py-0.5 rounded hidden sm:inline">
                PostgreSQL / MySQL / SQLite
              </span>
              <button
                onClick={handleReset}
                title="Reset to sample SQL"
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 rounded transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            {isDesktop ? (
              <Editor
                height="100%"
                defaultLanguage="sql"
                theme="vs-dark"
                value={sqlInput}
                onChange={(val) => setSqlInput(val || '')}
                options={EDITOR_OPTIONS_INPUT}
                loading={
                  <div className="flex items-center justify-center h-full text-zinc-500 text-sm gap-2">
                    <div className="w-4 h-4 border-2 border-zinc-600 border-t-indigo-500 rounded-full animate-spin" />
                    Loading editor...
                  </div>
                }
              />
            ) : (
              <textarea
                className={textareaClass}
                value={sqlInput}
                onChange={(e) => setSqlInput(e.target.value)}
                placeholder="Paste your SQL CREATE TABLE statements here…"
                spellCheck={false}
                autoCapitalize="none"
                autoCorrect="off"
                style={{ height: '100%' }}
              />
            )}
          </div>
        </div>

        {/* Right: Output */}
        <div
          className="w-full md:w-1/2 flex flex-col bg-[#1e1e1e]"
          style={isDesktop ? undefined : { minHeight: '320px' }}
        >
          {/* Tab bar */}
          <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-zinc-900/60 border-b border-zinc-800/60 gap-2 flex-shrink-0">
            <div className="flex space-x-0.5 p-0.5 bg-zinc-950/60 rounded-lg border border-zinc-800/50 overflow-x-auto">
              {TAB_CONFIG.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-zinc-800 text-indigo-300 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {showRowSlider && (
                <div className="flex items-center gap-2 text-zinc-400 bg-zinc-950/60 px-2.5 py-1.5 rounded-lg border border-zinc-800/50">
                  <Settings2 className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                  <input
                    id="rowCount"
                    type="range"
                    min="1"
                    max="50"
                    value={mockRowCount}
                    onChange={(e) => setMockRowCount(parseInt(e.target.value))}
                    className="w-16 cursor-pointer"
                  />
                  <span className="w-5 text-right font-mono text-indigo-300 font-bold text-xs">{mockRowCount}</span>
                </div>
              )}

              {/* Copy */}
              <button
                onClick={handleCopy}
                title="Copy to clipboard"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 active:scale-95 ${
                  copied
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>

              {/* Download */}
              <button
                onClick={handleDownload}
                title="Download as file"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 active:scale-95 border ${
                  downloaded
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 border-zinc-700/60'
                }`}
              >
                {downloaded ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                {downloaded ? 'Saved!' : 'Download'}
              </button>
            </div>
          </div>

          {/* Output editor or error */}
          <div className="flex-1 relative overflow-hidden">
            {errorMsg ? (
              <div className="absolute inset-0 flex items-center justify-center p-6 bg-[#1e1e1e]">
                <div className="text-center max-w-sm">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                  </div>
                  <p className="font-semibold text-zinc-200 mb-2">Waiting for valid SQL</p>
                  <p className="text-sm text-zinc-500 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            ) : isDesktop ? (
              <Editor
                height="100%"
                language={activeLanguage}
                theme="vs-dark"
                value={activeContent}
                options={EDITOR_OPTIONS_OUTPUT}
              />
            ) : (
              <textarea
                readOnly
                className={textareaClass + ' text-zinc-300'}
                value={activeContent}
                style={{ height: '100%' }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
