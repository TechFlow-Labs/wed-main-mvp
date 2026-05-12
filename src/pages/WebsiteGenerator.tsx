import { FormEvent, useState } from 'react';
import {
  generateWeddingWebsite,
  publicWeddingPageUrl,
  WeddingWebsiteResponse,
  WebsiteFaqItem,
  WebsiteScheduleItem,
} from '../lib/weddingWebsiteApi';

function slugify(input: string): string {
  const raw = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 48)
    .replace(/^-+|-+$/g, '');
  if (raw.length >= 3) return raw;
  return 'wedding-site';
}

function emptySchedule(): WebsiteScheduleItem {
  return { time: '', title: '', description: '' };
}

function emptyFaq(): WebsiteFaqItem {
  return { question: '', answer: '' };
}

export function WebsiteGenerator() {
  const [coupleNames, setCoupleNames] = useState('');
  const [venue, setVenue] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [story, setStory] = useState('');
  const [scheduleRows, setScheduleRows] = useState<WebsiteScheduleItem[]>([emptySchedule()]);
  const [faqRows, setFaqRows] = useState<WebsiteFaqItem[]>([emptyFaq()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<WeddingWebsiteResponse | null>(null);

  const liveWeddingUrl = result ? publicWeddingPageUrl(result.public_path) : null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const schedule = scheduleRows
        .filter((r) => r.time.trim() && r.title.trim())
        .map((r) => ({
          time: r.time.trim(),
          title: r.title.trim(),
          description: r.description?.trim() || null,
        }));
      const faq = faqRows
        .filter((r) => r.question.trim() && r.answer.trim())
        .map((r) => ({
          question: r.question.trim(),
          answer: r.answer.trim(),
        }));

      const generated = await generateWeddingWebsite({
        slug: slugify(coupleNames || 'wedding-site'),
        couple_names: coupleNames,
        venue,
        wedding_date: weddingDate,
        story,
        schedule,
        faq,
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
      <form onSubmit={onSubmit} className="bg-white border rounded-xl p-4 space-y-6">
        <div className="space-y-4">
          <input className="w-full border rounded-md px-3 py-2" placeholder="Couple names" value={coupleNames} onChange={(e) => setCoupleNames(e.target.value)} required />
          <input className="w-full border rounded-md px-3 py-2" placeholder="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} required />
          <input className="w-full border rounded-md px-3 py-2" type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} required />
          <textarea className="w-full border rounded-md px-3 py-2" placeholder="Couple story" value={story} onChange={(e) => setStory(e.target.value)} rows={4} />
        </div>

        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Schedule</h3>
            <button type="button" className="text-sm text-wed-primary" onClick={() => setScheduleRows((rows) => [...rows, emptySchedule()])}>
              Add row
            </button>
          </div>
          <p className="text-sm text-gray-500">Leave rows empty to use default timings from the server.</p>
          <ul className="space-y-3">
            {scheduleRows.map((row, i) => (
              <li key={`sched-${i}`} className="border rounded-lg p-3 space-y-2 grid gap-2 sm:grid-cols-3">
                <input
                  className="border rounded-md px-2 py-1.5 text-sm"
                  placeholder="Time"
                  value={row.time}
                  onChange={(e) => {
                    const v = e.target.value;
                    setScheduleRows((rows) => rows.map((r, j) => (j === i ? { ...r, time: v } : r)));
                  }}
                />
                <input
                  className="border rounded-md px-2 py-1.5 text-sm sm:col-span-2"
                  placeholder="Title"
                  value={row.title}
                  onChange={(e) => {
                    const v = e.target.value;
                    setScheduleRows((rows) => rows.map((r, j) => (j === i ? { ...r, title: v } : r)));
                  }}
                />
                <input
                  className="border rounded-md px-2 py-1.5 text-sm sm:col-span-3"
                  placeholder="Description (optional)"
                  value={row.description ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setScheduleRows((rows) => rows.map((r, j) => (j === i ? { ...r, description: v } : r)));
                  }}
                />
                {scheduleRows.length > 1 && (
                  <button
                    type="button"
                    className="text-sm text-gray-400 hover:text-red-600 sm:col-span-3 text-left"
                    onClick={() => setScheduleRows((rows) => rows.filter((_, j) => j !== i))}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">FAQ</h3>
            <button type="button" className="text-sm text-wed-primary" onClick={() => setFaqRows((rows) => [...rows, emptyFaq()])}>
              Add question
            </button>
          </div>
          <p className="text-sm text-gray-500">Leave empty for default FAQs.</p>
          <ul className="space-y-3">
            {faqRows.map((row, i) => (
              <li key={`faq-${i}`} className="border rounded-lg p-3 space-y-2">
                <input
                  className="w-full border rounded-md px-2 py-1.5 text-sm"
                  placeholder="Question"
                  value={row.question}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFaqRows((rows) => rows.map((r, j) => (j === i ? { ...r, question: v } : r)));
                  }}
                />
                <textarea
                  className="w-full border rounded-md px-2 py-1.5 text-sm"
                  placeholder="Answer"
                  rows={2}
                  value={row.answer}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFaqRows((rows) => rows.map((r, j) => (j === i ? { ...r, answer: v } : r)));
                  }}
                />
                {faqRows.length > 1 && (
                  <button type="button" className="text-sm text-gray-400 hover:text-red-600" onClick={() => setFaqRows((rows) => rows.filter((_, j) => j !== i))}>
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

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
          {liveWeddingUrl && (
            <a
              className="text-sm text-wed-primary hover:underline"
              href={liveWeddingUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open live wedding page
            </a>
          )}
          <div className="text-sm text-gray-600">RSVP deadline: {result.rsvp_deadline || 'n/a'}</div>
        </div>
      )}
    </div>
  );
}
