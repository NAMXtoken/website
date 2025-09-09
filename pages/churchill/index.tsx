import Landing from "@components/Landing";
import { FancyBackground } from "@components/marketing/FancyBackground";
import { MobileMenuProvider } from "@components/MobileMenu";
import { PrimitivesHeader } from "@components/PrimitivesHeader";
import { PrimitivesMobileMenu } from "@components/PrimitivesMobileMenu";
import { TitleAndMetaTags } from "@components/TitleAndMetaTags";
import { Box, Container } from "@radix-ui/themes";

export default function ChurchillHome() {
    return (
        <MobileMenuProvider>
            <PrimitivesMobileMenu />

            <TitleAndMetaTags
                title="Radix Primitives"
                description="Unstyled, accessible, open source React primitives for high-quality web apps and design systems."
                image="primitives.png"
            />
            <Box style={{ height: 0 }}>
                <PrimitivesHeader ghost />
            </Box>
            <FancyBackground>
                <Container mx={{ initial: "5", xs: "6", sm: "7", md: "9" }}>
                    {/* <FixturesList /> */}
                    {/* <WeekdayEvents /> */}
                    <Landing />
                </Container>
                {/* <PrimitivesHero /> */}
            </FancyBackground>
            {/* <CaseStudiesSection />
            <Container mx={{ initial: "5", xs: "6", sm: "7", md: "9" }}>
                <Separator size="2" />
            </Container>
            <Box overflow="hidden">
                <BenefitsSection />
                <StatsSection />
            </Box>
            <ComponentHighlightsSection />
            <AccessibilitySection />
            <DeveloperExperienceSection />
            <AdoptionSection />
            <Container mx={{ initial: "5", xs: "6", sm: "7", md: "9" }}>
                <Separator size="2" />
            </Container>
            <Section size={{ initial: "2", md: "4" }}>
                <Container mx={{ initial: "5", xs: "6", sm: "7", md: "9" }}>
                    <CommunitySection />
                </Container>
            </Section>
            <Container mx={{ initial: "5", xs: "6", sm: "7", md: "9" }}>
                <Separator size="2" />
                <Section size={{ initial: "2", md: "4" }} pb="0">
                    <Footer />
                </Section>
            </Container>*/}
        </MobileMenuProvider >
    );
}
