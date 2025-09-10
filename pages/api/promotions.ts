import type { NextApiRequest, NextApiResponse } from 'next';

type WeekEvent = {
  day: string;
  cocktail: {
    name: string;
    promoPrice: string;
    originalPrice?: string;
    description?: string;
  };
  dealOfTheDay: string;
  musicGenre: string;
  specials?: string[];
  imageUrl?: string;
  imageUrlRight?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const baseUrl = process.env.FIXTURES_URL || process.env.NEXT_PUBLIC_FIXTURES_URL;
  if (!baseUrl) {
    return res.status(500).json({ error: 'Missing FIXTURES_URL environment variable' });
  }

  const url = baseUrl.includes('?') ? `${baseUrl}&type=promotions` : `${baseUrl}?type=promotions`;

  try {
    const upstream = await fetch(url, { method: 'GET', cache: 'no-store', headers: { Accept: 'application/json' } });
    if (!upstream.ok) {
      const text = await upstream.text();
      return res.status(502).json({ error: `Upstream error ${upstream.status}`, details: text.slice(0, 500) });
    }

    const raw = await upstream.text();
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(502).json({ error: 'Upstream returned non-JSON response', preview: raw.slice(0, 500) });
    }

    const rows: unknown = Array.isArray(data) ? data : (data as any)?.promotions || (data as any)?.data;
    if (!Array.isArray(rows)) return res.status(500).json({ error: 'Unexpected upstream response shape' });

    const toArray = (v: any): any[] => (Array.isArray(v) ? v : v && typeof v === 'object' ? [v] : []);

    const normalized: WeekEvent[] = rows.map((r: any) => {
      // Support object or array rows
      const obj = Array.isArray(r)
        ? {
            day: r[0],
            cocktail_name: r[1],
            cocktail_promo_price: r[2],
            cocktail_original_price: r[3],
            deal_of_the_day: r[4],
            music_genre: r[5],
            specials: r[6],
            image_url: r[7],
            image_url_right: r[8],
            cocktail_description: r[9],
          }
        : r;

      const specialsField = String(obj?.specials ?? '').trim();
      const specials = specialsField
        ? specialsField.split(/;|,/).map((s: string) => s.trim()).filter(Boolean)
        : undefined;

      return {
        day: String(obj?.day ?? ''),
        cocktail: {
          name: String(obj?.cocktail_name ?? obj?.cocktail?.name ?? ''),
          promoPrice: String(obj?.cocktail_promo_price ?? obj?.cocktail?.promoPrice ?? ''),
          // Support both flat and nested shapes from the upstream (Sheet2 / Apps Script)
          originalPrice: obj?.cocktail_original_price
            ? String(obj.cocktail_original_price)
            : (obj?.cocktail?.originalPrice ? String(obj.cocktail.originalPrice) : undefined),
          description: obj?.cocktail_description ? String(obj.cocktail_description) : (obj?.cocktail?.description ? String(obj.cocktail.description) : undefined),
        },
        dealOfTheDay: String(obj?.deal_of_the_day ?? obj?.dealOfTheDay ?? ''),
        musicGenre: String(obj?.music_genre ?? obj?.musicGenre ?? ''),
        specials,
        imageUrl: obj?.image_url ? String(obj.image_url) : (obj?.image ? String(obj.image) : (obj?.imageUrl ? String(obj.imageUrl) : undefined)),
        imageUrlRight: obj?.image_url_right ? String(obj.image_url_right) : (obj?.imageRight ? String(obj.imageRight) : (obj?.imageUrlRight ? String(obj.imageUrlRight) : undefined)),
      } as WeekEvent;
    });

    // Basic validation: keep only rows with a valid day and cocktail name
    const days = new Set(['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']);
    const cleaned = normalized.filter((e) => days.has(e.day) && e.cocktail.name && e.cocktail.promoPrice);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=300');
    return res.status(200).json(cleaned);
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to fetch promotions', message: e?.message ?? String(e) });
  }
}
