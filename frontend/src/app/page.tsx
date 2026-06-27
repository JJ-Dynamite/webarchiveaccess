'use client';

import { useState } from 'react';
import Head from 'next/head';

interface ArchiveResult {
  original_url: string;
  archived_url: string;
  timestamp: string;
  title: string;
  status: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ArchiveResult | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<ArchiveResult[]>([]);

  const handleArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ url }),
      });
      const data = await res.json();

      if (data.success) {
        setResult(data.data);
        setHistory([data.data, ...history.slice(0, 9)]);
      } else {
        setError(data.error || 'Failed to archive page');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Web Archive Access</title>
        <meta name="description" content="Access any old webpage" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Web Archive Access
              </h1>
              <p className="text-gray-400 text-xl">
                Access any old webpage from the past
              </p>
            </div>

            {/* Archive Form */}
            <form onSubmit={handleArchive} className="mb-12">
              <div className="flex gap-4">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter URL to archive..."
                  className="flex-1 px-6 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 text-white font-semibold rounded-xl transition-colors"
                >
                  {loading ? 'Archiving...' : 'Archive Now'}
                </button>
              </div>
            </form>

            {error && (
              <div className="mb-8 p-4 bg-red-900/50 border border-red-700 rounded-xl text-red-200">
                {error}
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">✓ Page Archived</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400">Original:</span>
                    <a href={result.original_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-400 hover:underline">
                      {result.original_url}
                    </a>
                  </div>
                  <div>
                    <span className="text-gray-400">Archived:</span>
                    <a href={result.archived_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-green-400 hover:underline">
                      View Archived Version →
                    </a>
                  </div>
                  <div>
                    <span className="text-gray-400">Timestamp:</span>
                    <span className="ml-2 text-white">{result.timestamp}</span>
                  </div>
                </div>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Recent Archives</h2>
                <div className="space-y-3">
                  {history.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <span className="text-gray-300 truncate flex-1">{item.original_url}</span>
                      <a
                        href={item.archived_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
