import { EnvelopeClosedIcon } from '@radix-ui/react-icons';
import { Badge, Box, Card, Flex, Grid, IconButton, Select, Text } from '@radix-ui/themes';
import { useEffect, useMemo, useState } from 'react';
import styles from './FixtureList.module.css';

type Fixture = {
    teams: string;
    date: string;
    time: string;
    sport: string;
    imageUrl?: string;
};

export default function FixturesList() {
    const [fixtures, setFixtures] = useState<Fixture[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSport, setSelectedSport] = useState<string>('all');

    const sports = useMemo(() => {
        const list = Array.from(new Set(fixtures.map((f) => f.sport).filter(Boolean)));
        return list.sort((a, b) => a.localeCompare(b));
    }, [fixtures]);

    const visibleFixtures = useMemo(
        () => (selectedSport === 'all' ? fixtures : fixtures.filter((f) => f.sport === selectedSport)),
        [fixtures, selectedSport]
    );

    // Parse fixture date/time, sort chronologically, and group by day
    const parseFixtureDateTime = (f: Fixture): Date | null => {
        const dsRaw = (f.date || '').trim();
        const tsRaw = (f.time || '').trim();
        if (!dsRaw) return null;

        const monthMap: Record<string, number> = {
            jan: 0, january: 0,
            feb: 1, february: 1,
            mar: 2, march: 2,
            apr: 3, april: 3,
            may: 4,
            jun: 5, june: 5,
            jul: 6, july: 6,
            aug: 7, august: 7,
            sep: 8, sept: 8, september: 8,
            oct: 9, october: 9,
            nov: 10, november: 10,
            dec: 11, december: 11,
        };

        const parseTime = (t: string) => {
            if (!t) return { h: 0, m: 0 };
            const m = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
            if (!m) return { h: 0, m: 0 };
            let h = parseInt(m[1], 10);
            const mm = m[2] ? parseInt(m[2], 10) : 0;
            const ap = m[3]?.toLowerCase();
            if (ap === 'pm' && h < 12) h += 12;
            if (ap === 'am' && h === 12) h = 0;
            return { h, m: mm };
        };

        const time = parseTime(tsRaw);

        const ds = dsRaw.replace(/\s{2,}/g, ' ').replace(/,$/, '');

        // Pattern: Weekday, Mon 1[, 2025]
        let m1 = ds.match(/^(?:[A-Za-z]+,?\s+)?([A-Za-z]+)\s+(\d{1,2})(?:,\s*(\d{4}))?$/);
        if (m1) {
            const mon = monthMap[m1[1].toLowerCase()];
            const day = parseInt(m1[2], 10);
            const year = m1[3] ? parseInt(m1[3], 10) : new Date().getFullYear();
            if (mon != null && day > 0) return new Date(year, mon, day, time.h, time.m);
        }

        // Pattern: yyyy-mm-dd
        let m2 = ds.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (m2) {
            const y = parseInt(m2[1], 10);
            const mon = parseInt(m2[2], 10) - 1;
            const day = parseInt(m2[3], 10);
            return new Date(y, mon, day, time.h, time.m);
        }

        // Pattern: dd/mm/yyyy or mm/dd/yyyy
        let m3 = ds.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
        if (m3) {
            let a = parseInt(m3[1], 10);
            let b = parseInt(m3[2], 10);
            const y = parseInt(m3[3].length === 2 ? '20' + m3[3] : m3[3], 10);
            // If first part > 12, treat as day/month; otherwise month/day
            const day = a > 12 ? a : b > 12 ? b : b; // default MDY
            const mon = a > 12 ? b - 1 : a - 1;
            return new Date(y, mon, day, time.h, time.m);
        }

        // Fallback to Date.parse variants
        const attempts = [
            tsRaw ? `${ds} ${tsRaw}` : ds,
            tsRaw ? `${ds.replace(/,/g, '')} ${tsRaw}` : ds.replace(/,/g, ''),
            (() => {
                const y = new Date().getFullYear();
                return tsRaw ? `${ds} ${y} ${tsRaw}` : `${ds} ${y}`;
            })(),
        ];
        for (const s of attempts) {
            const d = new Date(s);
            if (!isNaN(d.getTime())) return d;
        }
        return null;
    };

    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

    const grouped = useMemo(() => {
        const now = new Date();
        const todayStart = startOfDay(now);
        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setDate(todayStart.getDate() + 1);

        const enriched = visibleFixtures
            .map((f) => ({ item: f, dt: parseFixtureDateTime(f) }))
            .filter((x): x is { item: Fixture; dt: Date } => !!x.dt)
            .filter((x) => x.dt >= todayStart)
            .sort((a, b) => a.dt.getTime() - b.dt.getTime());

        const map = new Map<string, { label: string; order: number; items: { item: Fixture; dt: Date }[] }>();
        for (const x of enriched) {
            const dayStart = startOfDay(x.dt);
            const key = dayStart.toISOString();
            let label = new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(x.dt);
            if (isSameDay(dayStart, todayStart)) label = 'Today';
            else if (isSameDay(dayStart, tomorrowStart)) label = 'Tomorrow';
            if (!map.has(key)) map.set(key, { label, order: dayStart.getTime(), items: [] });
            map.get(key)!.items.push(x);
        }
        return Array.from(map.values()).sort((a, b) => a.order - b.order);
    }, [visibleFixtures]);

    const totalCount = useMemo(() => grouped.reduce((n, g) => n + g.items.length, 0), [grouped]);

    useEffect(() => {
        const fetchFixtures = async () => {
            try {
                const res = await fetch('/api/fixtures', { cache: 'no-store' });
                if (!res.ok) {
                    let msg = `Request failed: ${res.status}`;
                    try {
                        const body = await res.json();
                        if (body?.error || body?.message) {
                            msg += ` - ${body.error || body.message}`;
                        }
                    } catch {
                        // ignore JSON parse error
                    }
                    throw new Error(msg);
                }
                const data = (await res.json()) as Fixture[];
                if (!Array.isArray(data)) throw new Error('Unexpected response');
                setFixtures(data);
            } catch (e: any) {
                setError(e?.message || 'Failed to load fixtures');
            } finally {
                setLoading(false);
            }
        };

        fetchFixtures();
    }, []);

    return (
        <>
            <Flex align="center" justify="start" gap="4" mb="3">
                <Text size="5" weight="bold">Upcoming Live Broadcasts</Text>
                <Select.Root
                    value={selectedSport}
                    onValueChange={setSelectedSport}
                    disabled={loading || !!error}
                >
                    <Select.Trigger placeholder="Filter by sport" />
                    <Select.Content>
                        <Select.Item value="all">All sports</Select.Item>
                        {sports.map((s) => (
                            <Select.Item key={s} value={s}>{s}</Select.Item>
                        ))}
                    </Select.Content>
                </Select.Root>
            </Flex>

            {loading && <Text size="2" color="gray">Loading fixtures…</Text>}
            {error && !loading && <Text size="2" color="red">{error}</Text>}

            {!loading && !error && totalCount === 0 && (
                <Text size="2" color="gray">No fixtures for this sport.</Text>
            )}

            {!loading && !error && grouped.length > 0 && (
                <>
                    {grouped.map((group) => (
                        <div key={`${group.label}-${group.order}`}>
                            <Box px="2" py="2" mb="2">
                                <Text size="3" weight="bold">{group.label}</Text>
                            </Box>
                            <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="2" mb="4">
                                {group.items.map(({ item: match, dt }, i) => {
                                    const to = process.env.NEXT_PUBLIC_BOOKINGS_EMAIL || '';
                                    const subject = `Booking request: ${match.sport} - ${match.teams} (${match.date} ${match.time})`;
                                    const body = [
                                        'Hi Churchill Team!,',
                                        '',
                                        "I'd like to reserve a table for the following event:",
                                        '',
                                        `${match.teams}`,
                                        `on: ${match.date}`,
                                        `at: ${match.time}`,
                                        '',
                                        'Name:',
                                        'Party size:',
                                        'Phone:',
                                        'Special requests:',
                                        '',
                                        'Thanks!',
                                    ].join('\n');
                                    const href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                    const now = new Date();
                                    const live = dt <= now && now <= new Date(dt.getTime() + 2 * 60 * 60 * 1000);
                                    return (
                                        <Card key={`${group.order}-${i}`} variant="classic">
                                            <Flex align="center" justify="between" gap="3">
                                                <Flex align="center" gap="3" style={{ flex: 1 }}>
                                                    {match.imageUrl && (
                                                        <Box style={{ width: 56, height: 56, overflow: 'hidden', borderRadius: 6 }}>
                                                            <img
                                                                src={match.imageUrl}
                                                                alt="Event"
                                                                style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block' }}
                                                            />
                                                        </Box>
                                                    )}
                                                    <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
                                                        <Flex align="center" gap="2">
                                                            <Text weight="medium">{match.teams}</Text>
                                                            {live && (
                                                                <Badge size="1" color="red" radius="full">
                                                                    <span className={styles.pulse} aria-hidden />
                                                                    Live
                                                                </Badge>
                                                            )}
                                                        </Flex>
                                                        <Text size="2" color="gray">{match.sport} • {match.date} at {match.time}</Text>
                                                    </Flex>
                                                </Flex>
                                                <IconButton asChild size="1" variant="soft" aria-label={`Email booking for ${match.teams}`} title="Email booking">
                                                    <a href={href}>
                                                        <EnvelopeClosedIcon />
                                                    </a>
                                                </IconButton>
                                            </Flex>
                                        </Card>
                                    );
                                })}
                            </Grid>
                        </div>
                    ))}
                </>
            )}

            {!loading && !error && grouped.length === 0 && visibleFixtures.length > 0 && (
                <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="2">
                    {visibleFixtures.map((match, i) => {
                        const to = process.env.NEXT_PUBLIC_BOOKINGS_EMAIL || '';
                        const subject = `Booking request: ${match.sport} - ${match.teams} (${match.date} ${match.time})`;
                        const body = [
                            'Hi Churchill Team!,',
                            '',
                            "I'd like to reserve a table for the following event:",
                            '',
                            `${match.teams}`,
                            `on: ${match.date}`,
                            `at: ${match.time}`,
                            '',
                            'Name:',
                            'Party size:',
                            'Phone:',
                            'Special requests:',
                            '',
                            'Thanks!',
                        ].join('\n');
                        const href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        const dt = parseFixtureDateTime(match);
                        const now = new Date();
                        const live = !!dt && dt <= now && now <= new Date(dt.getTime() + 2 * 60 * 60 * 1000);
                        return (
                            <Card key={i} variant="classic">
                                <Flex align="center" justify="between" gap="3">
                                    <Flex align="center" gap="3" style={{ flex: 1 }}>
                                        {match.imageUrl && (
                                            <Box style={{ width: 56, height: 56, overflow: 'hidden', borderRadius: 6, background: 'var(--gray-5)' }}>
                                                <img
                                                    src={match.imageUrl}
                                                    alt="Event"
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block' }}
                                                />
                                            </Box>
                                        )}
                                        <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
                                            <Flex align="center" gap="2">
                                                <Text weight="medium">{match.teams}</Text>
                                                {live && (
                                                    <Badge size="1" color="red" radius="full">
                                                        <span className={styles.pulse} aria-hidden />
                                                        Live
                                                    </Badge>
                                                )}
                                            </Flex>
                                            <Text size="2" color="gray">{match.sport} • {match.date} at {match.time}</Text>
                                        </Flex>
                                    </Flex>
                                    <IconButton asChild size="1" variant="soft" aria-label={`Email booking for ${match.teams}`} title="Email booking">
                                        <a href={href}>
                                            <EnvelopeClosedIcon />
                                        </a>
                                    </IconButton>
                                </Flex>
                            </Card>
                        );
                    })}
                </Grid>
            )}
        </>
    );
}
