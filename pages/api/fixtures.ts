import type { NextApiRequest, NextApiResponse } from 'next';

type Fixture = {
  teams: string;
  date: string;
  time: string;
  sport: string;
  imageUrl?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const url = process.env.FIXTURES_URL || process.env.NEXT_PUBLIC_FIXTURES_URL;
  if (!url) {
    return res.status(500).json({ error: 'Missing FIXTURES_URL environment variable' });
  }

  try {
    const upstream = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      // Avoid caching on the server to ensure freshness; edge caches controlled below
      cache: 'no-store',
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return res
        .status(502)
        .json({ error: `Upstream error ${upstream.status}`, details: text.slice(0, 500) });
    }

    // Read body once, then try to parse as JSON
    const raw = await upstream.text();
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      console.error('Upstream non-JSON response', raw.slice(0, 500));
      return res.status(502).json({ error: 'Upstream returned non-JSON response', preview: raw.slice(0, 500) });
    }

    const rows: unknown = Array.isArray(data)
      ? data
      : (data as any)?.fixtures ?? (data as any)?.data;
    if (!Array.isArray(rows)) {
      return res.status(500).json({ error: 'Unexpected upstream response shape' });
    }

    const normalized: Fixture[] = rows.map((r: any) => ({
      teams: String(r?.teams ?? r?.[0] ?? ''),
      date: String(r?.date ?? r?.[1] ?? ''),
      time: String(r?.time ?? r?.[2] ?? ''),
      sport: String(r?.sport ?? r?.[3] ?? ''),
      imageUrl: r?.image_url ? String(r.image_url) : (r?.image ? String(r.image) : (r?.imageUrl ? String(r.imageUrl) : (r?.[4] != null ? String(r[4]) : undefined))),
    }));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=300');
    return res.status(200).json(normalized);
  } catch (e: any) {
    console.error('Failed to fetch fixtures', e);
    return res
      .status(500)
      .json({ error: 'Failed to fetch fixtures', message: e?.message ?? String(e) });
  }
}
