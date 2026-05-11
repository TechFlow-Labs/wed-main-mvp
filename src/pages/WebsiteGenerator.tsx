import { FormEvent, useState } from 'react';
import { generateWeddingWebsite, WeddingWebsiteResponse } from '../lib/weddingWebsiteApi';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 48);
}

export function WebsiteGenerator() {
  const [coupleNames, setCoupleNames] = useState('');
  const [venue, setVenue] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<WeddingWebsiteResponse | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const generated = await generateWeddingWebsite({
        slug: slugify(coupleNames || 'wedding-site'),
        couple_names: coupleNames,
        venue,
        wedding_date: weddingDate,
        story,
        schedule: [],
        faq: [],
      });
      setResult(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Wedding Website Generator</h2>
      <form onSubmit={onSubmit} className="bg-white border rounded-xl p-4 space-y-4">
        <input className="w-full border rounded-md px-3 py-2" placeholder="Couple names" value={coupleNames} onChange={(e) => setCoupleNames(e.target.value)} required />
        <input className="w-full border rounded-md px-3 py-2" placeholder="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} required />
        <input className="w-full border rounded-md px-3 py-2" type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} required />
        <textarea className="w-full border rounded-md px-3 py-2" placeholder="Couple story" value={story} onChange={(e) => setStory(e.target.value)} rows={4} />
        <button disabled={loading} className="px-4 py-2 rounded-md bg-wed-primary text-white disabled:opacity-50" type="submit">
          {loading ? 'Generating...' : 'Generate Website'}
        </button>
      </form>

      {error && <div className="border border-red-300 bg-red-50 text-red-700 rounded-md p-3">{error}</div>}

      {!loading && !error && !result && (
        <div className="border border-dashed rounded-md p-4 text-gray-500">No website generated yet.</div>
      )}

      {result && (
        <div className="bg-white border rounded-xl p-4 space-y-2">
          <div className="font-semibold">{result.couple_names}</div>
          <div>{result.venue} - {result.wedding_date}</div>
          <div className="text-sm text-gray-600">Public path: {result.public_path}</div>
          <div className="text-sm text-gray-600">RSVP deadline: {result.rsvp_deadline || 'n/a'}</div>
        </div>
      )}
    </div>
  );
}
