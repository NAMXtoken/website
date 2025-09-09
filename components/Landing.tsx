import { Box, Button, Card, Flex, Grid, Heading, Inset, Separator, Text } from '@radix-ui/themes';
import styles from './Landing.module.css';
import FixturesList from './FixtureList';
import WeekdayEvents from './WeekdayEvents';

export default function Landing() {
  return (
    <Box>
      {/* Hero */}
      <Box asChild px={{ initial: '3', sm: '5' }}
        py={{ initial: '5', sm: '7' }} style={{
          minHeight: '100vh'
        }}>
        <header>
          <Flex
            direction="column"
            align="center"
            justify="center"
            gap="3"
            style={{ position: 'relative', zIndex: 1, filter: 'none', backdropFilter: 'none', minHeight: '100vh', width: '100%' }}
          >
            <Box pt={{ initial: '3', sm: '5' }} pb={{ initial: '2', sm: '3' }}>
              <Heading as="h1" size={{ initial: '7', sm: '9' }} align="center">
                Welcome to Churchill’s
              </Heading>
              <Text size={{ initial: '3', sm: '4' }} color="gray" align="center">
                A neighborhood pub for craft cocktails, seasonal plates, and live sport.
              </Text>
            </Box>
            <Flex gap="3" mt="1" wrap="wrap" justify="center">
              <Button size={{ initial: '2', sm: '3' }} highContrast>Book a Table</Button>
              <Button size={{ initial: '2', sm: '3' }} variant="soft">View Menu</Button>
            </Flex>

            {/* Single hero image: card-like on mobile, full-bleed on desktop */}
            <Box mt="1" mb="4" className={styles.heroWrap}>
              <div className={styles.heroInner}>
                <img src="/images/hero.png" alt="Hero" className={styles.heroImage} />
              </div>
            </Box>
          </Flex>
        </header>
      </Box>

      <Separator my="4" size="4" />

      {/* Highlights */}
      <Box asChild px={{ initial: '3', sm: '5' }} py={{ initial: '4', sm: '6' }}>
        <section aria-labelledby="highlights-heading">
          <Heading id="highlights-heading" as="h2" size="7" mb="4">
            What’s on at Churchill’s
          </Heading>
          <Grid columns={{ initial: '1', sm: '3' }} gap="3">
            <Card>
              <Flex direction="column" gap="2">
                <Heading as="h3" size="5">Craft Cocktails</Heading>
                <Text color="gray">Classics and signatures, shaken or stirred by our bartenders.</Text>
              </Flex>
            </Card>
            <Card>
              <Flex direction="column" gap="2">
                <Heading as="h3" size="5">Seasonal Menu</Heading>
                <Text color="gray">Fresh, local, and rotating plates to pair with your drink.</Text>
              </Flex>
            </Card>
            <Card>
              <Flex direction="column" gap="2">
                <Heading as="h3" size="5">Live Sport</Heading>
                <Text color="gray">Premier league, rugby, and more on big screens.</Text>
              </Flex>
            </Card>
          </Grid>
        </section>
      </Box>

      <Separator my="4" size="4" />

      {/* This Week */}
      <Box asChild px={{ initial: '3', sm: '5' }} py={{ initial: '4', sm: '6' }}>
        <section aria-labelledby="week-heading">
          <Heading id="week-heading" as="h2" size="7" mb="4">
            This Week at Churchill’s
          </Heading>
          <WeekdayEvents />
        </section>
      </Box>

      <Separator my="4" size="4" />

      {/* Upcoming Broadcasts */}
      <Box asChild px={{ initial: '3', sm: '5' }} py={{ initial: '4', sm: '6' }}>
        <section id="fixtures" aria-labelledby="broadcasts-heading">
          <Heading id="broadcasts-heading" as="h2" size="7" mb="4">
            Upcoming Live Broadcasts
          </Heading>
          <FixturesList />
        </section>
      </Box>

      <Separator my="4" size="4" />

      {/* Gallery */}
      <Box asChild px={{ initial: '3', sm: '5' }} py={{ initial: '4', sm: '6' }}>
        <section aria-labelledby="gallery-heading">
          <Heading id="gallery-heading" as="h2" size="7" mb="4">
            Inside the Pub
          </Heading>
          {(() => {
            const gallery = [
              { src: '/images/pub-1.jpg', alt: 'Bar counter' },
              { src: '/images/pub-2.jpg', alt: 'Seating area' },
              { src: '/images/pub-3.jpg', alt: 'Outdoor patio' },
              { src: '/images/pub-4.jpg', alt: 'Booth seating' },
              { src: '/images/pub-5.jpg', alt: 'Cocktails' },
              { src: '/images/pub-6.jpg', alt: 'Dining area' },
            ];
            return (
              <Grid columns={{ initial: '2', sm: '3' }} gap="3">
                {gallery.map((img, i) => (
                  <Card key={i} size="2">
                    <Inset clip="padding-box" side="top" pb="current">
                      <img
                        src={img.src}
                        alt={img.alt}
                        style={{ display: 'block', objectFit: 'cover', width: '100%', height: 180 }}
                      />
                    </Inset>
                    <Text as="p" size="2" color="gray">{img.alt}</Text>
                  </Card>
                ))}
              </Grid>
            );
          })()}
        </section>
      </Box>

      <Separator my="4" size="4" />

      {/* Footer */}
      <Box asChild px={{ initial: '3', sm: '5' }} py={{ initial: '5', sm: '7' }}>
        <footer>
          <Flex align="center" justify="between" wrap="wrap" gap="3">
            <Text size="2" color="gray">© {new Date().getFullYear()} Churchill’s</Text>
            <Flex gap="3">
              <Button variant="ghost">Contact</Button>
              <Button variant="ghost">Find Us</Button>
              <Button variant="ghost">Hours</Button>
            </Flex>
          </Flex>
        </footer>
      </Box>
    </Box>
  );
}
