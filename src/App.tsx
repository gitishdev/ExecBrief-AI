/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Youtube, Loader2, Plus, X, AlertCircle } from 'lucide-react';
import { synthesizeVideo } from './lib/gemini';
import { getStoredSummary, storeSummary } from './lib/storage';
import { SummaryCard } from './components/SummaryCard';

export default function App() {
  const [urls, setUrls] = useState<string[]>(['']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<{ url: string; summary: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const addUrlField = () => {
    if (urls.length < 3) {
      setUrls([...urls, '']);
    }
  };

  const removeUrlField = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls.length ? newUrls : ['']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validUrls = urls.filter(url => url.trim() !== '');
    if (validUrls.length === 0) {
      setError('Please enter at least one YouTube URL.');
      return;
    }

    setIsGenerating(true);
    setResults([]);

    try {
      const promises = validUrls.map(async (url) => {
        // Check local storage first
        const stored = getStoredSummary(url);
        if (stored) {
          return { url, summary: stored.summary };
        }

        // If not in storage, generate via Gemini
        const summary = await synthesizeVideo(url);
        storeSummary(url, summary);
        return { url, summary };
      });

      const newResults = await Promise.all(promises);
      setResults(newResults);
    } catch (err) {
      console.error(err);
      setError('An error occurred while generating the synthesis. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-2 rounded-lg">
              <Youtube className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">ExecBrief AI</span>
          </div>
          <div className="text-sm font-medium text-slate-500">
            Executive Synthesis
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 print:p-0">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-12 print:hidden">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
            Distill hours of video into minutes of insight.
          </h1>
          <p className="text-lg text-slate-600">
            Enter up to 3 YouTube links below. We'll generate a concise, one-page executive summary with key takeaways, speaker bios, and actionable insights.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-12 print:hidden">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <AnimatePresence>
                {urls.map((url, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Youtube className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleUrlChange(index, e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                        required={index === 0 && urls.length === 1}
                      />
                    </div>
                    {urls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUrlField(index)}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        aria-label="Remove URL"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={addUrlField}
                disabled={urls.length >= 3 || isGenerating}
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add another video (Max 3)
              </button>

              <button
                type="submit"
                disabled={isGenerating || urls.every(u => !u.trim())}
                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Synthesizing...
                  </>
                ) : (
                  'Generate Synthesis'
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="text-center py-12 print:hidden">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Analyzing video content...</h3>
            <p className="text-slate-500 mt-2">This may take a minute as our AI expert reviews the material.</p>
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <div className="space-y-12">
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <SummaryCard url={result.url} summary={result.summary} />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
