import { Badge, Box, Card, Flex, Grid, Strong, Text } from '@radix-ui/themes';
import { useEffect, useMemo, useState } from 'react';

type DayName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

type Cocktail = {
  name: string;
  promoPrice: string; // e.g., "$8"
  originalPrice?: string; // e.g., "$12" (optional, to display strikethrough)
  description?: string;
};

export type WeekEvent = {
  day: DayName;
  cocktail: Cocktail;
  dealOfTheDay: string;
  musicGenre: string;
  specials?: string[]; // Additional events/offerings
  imageUrl?: string;
  imageUrlRight?: string;
  blurb?: string;
};

// Removed fixtures integration per request

const orderedDays: DayName[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const defaultEvents: WeekEvent[] = [
  {
    day: 'Monday',
    cocktail: { name: 'Old Fashioned', promoPrice: '$8', originalPrice: '$12' },
    dealOfTheDay: 'Half-price wings after 6pm',
    musicGenre: 'Classic Rock',
    specials: ['Industry Night 10% off with ID'],
  },
  {
    day: 'Tuesday',
    cocktail: { name: 'Margarita', promoPrice: '$7', originalPrice: '$11' },
    dealOfTheDay: 'Taco Trio + Drink $12',
    musicGenre: 'Latin & Reggaeton',
    specials: ['Trivia at 8pm'],
  },
  {
    day: 'Wednesday',
    cocktail: { name: 'Whiskey Sour', promoPrice: '$7', originalPrice: '$10' },
    dealOfTheDay: 'Burger + Fries $10',
    musicGenre: 'Indie & Alternative',
    specials: ['Open Mic Night 9pm'],
  },
  {
    day: 'Thursday',
    cocktail: { name: 'Aperol Spritz', promoPrice: '$8', originalPrice: '$12' },
    dealOfTheDay: 'Charcuterie Board $14',
    musicGenre: 'House & Lounge',
    specials: ['Ladies Night 2-for-1 7–9pm'],
  },
  {
    day: 'Friday',
    cocktail: { name: 'Espresso Martini', promoPrice: '$9', originalPrice: '$13' },
    dealOfTheDay: 'Oysters $1 each (while supplies last)',
    musicGenre: 'Top 40 / Dance',
    specials: ['DJ from 9pm'],
  },
  {
    day: 'Saturday',
    cocktail: { name: 'Negroni', promoPrice: '$9', originalPrice: '$13' },
    dealOfTheDay: 'Steak Frites $18',
    musicGenre: 'Funk & Disco',
    specials: ['Late-night menu until 1am'],
  },
  {
    day: 'Sunday',
    cocktail: { name: 'Bloody Mary', promoPrice: '$7', originalPrice: '$10' },
    dealOfTheDay: 'Sunday Roast $16',
    musicGenre: 'Jazz & Soul',
    specials: ['Board Games Night from 6pm'],
  },
];

export default function WeekdayEvents() {
  const [events, setEvents] = useState<WeekEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/promotions', { cache: 'no-store' });
        if (!res.ok) {
          let msg = `Request failed: ${res.status}`;
          try {
            const body = await res.json();
            if (body?.error || body?.message) msg += ` - ${body.error || body.message}`;
          } catch { }
          throw new Error(msg);
        }
        const data = (await res.json()) as WeekEvent[];
        if (!Array.isArray(data)) throw new Error('Unexpected response');
        setEvents(data.length ? data : defaultEvents);
      } catch (e: any) {
        setError(e?.message || 'Failed to load promotions');
        setEvents(defaultEvents);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  



  // Sort events to Monday→Sunday order
  const sorted = useMemo(() => {
    const order = new Map(orderedDays.map((d, i) => [d, i] as const));
    return [...events].sort((a, b) => (order.get(a.day)! - order.get(b.day)!));
  }, [events]);

  const dayBlurbs: Record<DayName, string> = {
    Monday:
      "Ah, Monday — we meet again. Might as well start strong with Churchill’s comfort deals and easy vibes.",
    Tuesday:
      "Tuesday’s gathering steam: tacos, trivia, and tip‑top cocktails to keep it rolling.",
    Wednesday:
      "Midweek momentum. You’re halfway there — treat yourself to something classic and satisfying.",
    Thursday:
      "Thursday warm‑up. Share a round, dial up the playlist, and get the weekend started early.",
    Friday:
      "Friday’s here. Big flavors, big energy — let the good times pour.",
    Saturday:
      "Saturday prime time. Settle in for the week’s best pours, plates, and playlists.",
    Sunday:
      "Sunday slowdown. Comfort plates, smooth sounds, and one last toast to the week.",
  };



  // Calculate today for a small badge
  const todayLabel = useMemo(() => {
    const idx = new Date().getDay(); // 0=Sun..6=Sat
    const map: Record<number, DayName> = {
      0: 'Sunday',
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday',
    };
    return map[idx];
  }, []);

  

  return (
    <>
      <Flex align="center" justify="start" gap="2" mb="3">
        <Text size="5" weight="bold">Weekly Promotions at Churchill’s</Text>
      </Flex>

      {loading && <Text size="2" color="gray">Loading promotions…</Text>}
      {error && !loading && <Text size="2" color="red">{error}</Text>}

      <Grid columns={{ initial: '1' }} gap="6">
        {sorted.map((ev, i) => {
          const isToday = ev.day === todayLabel;
          const imgLeft = ev.imageUrl || 'https://images.unsplash.com/photo-1617050318658-a9a3175e34cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80';
          const imgRight = ev.imageUrlRight || ev.imageUrl || 'https://images.unsplash.com/photo-1617050318658-a9a3175e34cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80';
          const mobileImageFirst = i % 2 === 0; // Monday first (image left)
          return (
            <Box key={ev.day} width="100%">
              <Card size="2">
                {/* Mobile layout: Row 1 (2 cols): image | day+blurb (alternating); Row 2 (1 col): details */}
                <Box display={{ initial: 'block', sm: 'none' }}>
                  <Flex direction="column" gap="3">
                    {/* Row 1 */}
                    <Grid columns="2" gap="3">
                      {mobileImageFirst ? (
                        <>
                          <Box>
                            <img
                              src={imgLeft}
                              alt={ev.day + ' promotions'}
                              style={{ display: 'block', width: '100%', height: 140, objectFit: 'cover', borderRadius: 6 }}
                            />
                          </Box>
                          <Box>
                            <Flex direction="column" gap="2">
                              <Flex align="center" justify="between">
                                <Text weight="bold" size="6">{ev.day}</Text>
                                {isToday && <Badge size="1" radius="full" color="green">Today</Badge>}
                              </Flex>
                              <Text as="p" size="2" color="gray">{ev.blurb || dayBlurbs[ev.day]}</Text>
                            </Flex>
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box>
                            <Flex direction="column" gap="2">
                              <Flex align="center" justify="between">
                                <Text weight="bold" size="6">{ev.day}</Text>
                                {isToday && <Badge size="1" radius="full" color="green">Today</Badge>}
                              </Flex>
                              <Text as="p" size="2" color="gray">{ev.blurb || dayBlurbs[ev.day]}</Text>
                            </Flex>
                          </Box>
                          <Box>
                            <img
                              src={imgLeft}
                              alt={ev.day + ' promotions'}
                              style={{ display: 'block', width: '100%', height: 140, objectFit: 'cover', borderRadius: 6 }}
                            />
                          </Box>
                        </>
                      )}
                    </Grid>

                    {/* Row 2 */}
                    <Box>
                      <Flex direction="column" gap="2">
                        <Box>
                          <Text as="div" weight="medium" size="2">Featured Cocktail</Text>
                          <Text as="div" size="3">
                            <Strong>{ev.cocktail.name}</Strong>{' '}
                            {ev.cocktail.originalPrice ? (
                              <>
                                (<span style={{ textDecoration: 'line-through', opacity: 0.7 }}>{ev.cocktail.originalPrice}</span>) → <Strong>{ev.cocktail.promoPrice}</Strong>
                              </>
                            ) : (
                              <>→ <Strong>{ev.cocktail.promoPrice}</Strong></>
                            )}
                          </Text>
                          {ev.cocktail.description && (
                            <Text as="p" size="2" color="gray">{ev.cocktail.description}</Text>
                          )}
                        </Box>
                        <Box>
                          <Text as="div" weight="medium" size="2">Deal of the Day</Text>
                          <Text as="div" size="2" color="gray">{ev.dealOfTheDay}</Text>
                        </Box>
                        <Box>
                          <Text as="div" weight="medium" size="2">Music</Text>
                          <Text as="div" size="2" color="gray">{ev.musicGenre}</Text>
                        </Box>
                        {ev.specials && ev.specials.length > 0 && (
                          <Box>
                            <Text as="div" weight="medium" size="2">Specials</Text>
                            <Text as="div" size="2" color="gray">{ev.specials.join(', ')}</Text>
                          </Box>
                        )}
                      </Flex>
                    </Box>
                  </Flex>
                </Box>

                {/* Desktop/tablet layout: 3 columns (image | content | image) */}
                <Flex direction="row" align="stretch" gap="3" display={{ initial: 'none', sm: 'flex' }}>
                  {(() => {
                    const leftImageEl = (
                      <Box style={{ width: 350, height: '80vh', overflow: 'hidden', borderRadius: 6, background: 'var(--gray-5)' }}>
                        <img
                          src={imgLeft}
                          alt={ev.day + ' promotions'}
                          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                    );
                    const contentElThird = (
                      <Flex direction="column" gap="3" style={{ flex: 1 }}>
                        <Flex align="center" justify="between">
                          <Text weight="bold" size="8">{ev.day}</Text>
                          {isToday && <Badge size="1" radius="full" color="green">Today</Badge>}
                        </Flex>
                        <Text as="p" size="2" color="gray">{ev.blurb || dayBlurbs[ev.day]}</Text>

                        <Box>
                          <Text as="div" weight="medium" size="2">Featured Cocktail</Text>
                          <Text as="div" size="3">
                            <Strong>{ev.cocktail.name}</Strong>{' '}
                            {ev.cocktail.originalPrice ? (
                              <>
                                (<span style={{ textDecoration: 'line-through', opacity: 0.7 }}>{ev.cocktail.originalPrice}</span>) → <Strong>{ev.cocktail.promoPrice}</Strong>
                              </>
                            ) : (
                              <>→ <Strong>{ev.cocktail.promoPrice}</Strong></>
                            )}
                          </Text>
                          {ev.cocktail.description && (
                            <Text as="p" size="2" color="gray">{ev.cocktail.description}</Text>
                          )}
                        </Box>

                        <Box>
                          <Text as="div" weight="medium" size="2">Deal of the Day</Text>
                          <Text as="div" size="2" color="gray">{ev.dealOfTheDay}</Text>
                        </Box>

                        <Box>
                          <Text as="div" weight="medium" size="2">Music</Text>
                          <Text as="div" size="2" color="gray">{ev.musicGenre}</Text>
                        </Box>

                        {ev.specials && ev.specials.length > 0 && (
                          <Box>
                            <Text as="div" weight="medium" size="2">Specials</Text>
                            <Text as="div" size="2" color="gray">{ev.specials.join(', ')}</Text>
                          </Box>
                        )}
                      </Flex>
                    );
                    const rightImageEl = (
                      <Box style={{ width: 350, height: '80vh', overflow: 'hidden', borderRadius: 6, background: 'var(--gray-5)' }}>
                        <img
                          src={imgRight}
                          alt={ev.day + ' promotions'}
                          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                    );
                    return (
                      <>
                        {leftImageEl}
                        {contentElThird}
                        {rightImageEl}
                      </>
                    );
                  })()}
                </Flex>
              </Card>
            </Box >
          );
        })}
      </Grid >
    </>
  );
}
