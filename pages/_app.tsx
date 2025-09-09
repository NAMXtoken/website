import { ColorsDocsPage } from "@components/ColorsDocsPage";
import { CssLibPreferenceProvider } from "@components/CssLibPreference";
import { Favicon } from "@components/Favicon";
import { PrimitivesDocsPage } from "@components/PrimitivesDocsPage";
import { ThemeProvider } from "@components/ThemeProvider";
import { ThemesDocsPage } from "@components/ThemesDocsPage";
import { Theme, ThemePanel } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { handleUrlChange } from "@utils/analytics";
import { AppProps } from "next/app";
import { Router, useRouter } from "next/router";
import * as React from "react";
import "./styles.css";
import "./syntax-highlighting.css";

function Pages({ Component, pageProps }: AppProps) {
	const router = useRouter();

	if (router.pathname.startsWith("/primitives/docs")) {
		return (
			<Theme
				accentColor="blue"
				grayColor="slate"
				className="radix-themes-custom-fonts"
			>
				<PrimitivesDocsPage>
					<Favicon />
					<Component {...pageProps} />
					<ThemePanel />
				</PrimitivesDocsPage>
			</Theme>
		);
	}

	if (router.pathname.startsWith("/primitives")) {
		return (
			<Theme
				accentColor="blue"
				grayColor="slate"
				className="radix-themes-custom-fonts"
			>
				<Favicon />
				<Component {...pageProps} />
				<ThemePanel />
			</Theme>
		);
	}

	if (router.pathname.startsWith("/colors/docs")) {
		return (
			<Theme
				accentColor="pink"
				grayColor="gray"
				className="radix-themes-custom-fonts"
			>
				<ColorsDocsPage>
					<Favicon />
					<Component {...pageProps} />
					<ThemePanel />
				</ColorsDocsPage>
			</Theme>
		);
	}

	if (router.pathname.startsWith("/colors")) {
		return (
			<Theme
				accentColor="pink"
				grayColor="gray"
				className="radix-themes-custom-fonts"
			>
				<Favicon />
				<Component {...pageProps} />
				<ThemePanel />
			</Theme>
		);
	}

	if (router.pathname.startsWith("/themes/docs")) {
		return (
			<Theme accentColor="indigo" className="radix-themes-custom-fonts">
				<ThemesDocsPage>
					<Favicon />
					<Component {...pageProps} />
					<ThemePanel />
				</ThemesDocsPage>
			</Theme>
		);
	}

	if (router.pathname.startsWith("/themes/playground")) {
		return (
			<Theme accentColor="indigo">
				<Favicon />
				<Component {...pageProps} />
				<ThemePanel />
			</Theme>
		);
	}

	if (router.pathname.startsWith("/themes")) {
		return (
			<Theme accentColor="indigo" className="radix-themes-custom-fonts">
				<Favicon />
				<Component {...pageProps} />
				<ThemePanel />
			</Theme>
		);
	}

	if (router.pathname.startsWith("/icons")) {
		return (
			<Theme
				accentColor="teal"
				grayColor="slate"
				className="radix-themes-custom-fonts"
			>
				<Favicon />
				<Component {...pageProps} />
				<ThemePanel />
			</Theme>
		);
	}

	if (router.pathname.startsWith("/blog")) {
		return (
			<Theme accentColor="indigo" className="radix-themes-custom-fonts">
				<Favicon />
				<Component {...pageProps} />
				<ThemePanel />
			</Theme>
		);
	}

	return (
		<Theme accentColor="indigo" className="radix-themes-custom-fonts">
			<Favicon />
			<Component {...pageProps} />
			<ThemePanel />
		</Theme>
	);
}

function App(props: AppProps) {
	useAnalytics();

	return (
		<CssLibPreferenceProvider>
			<ThemeProvider>
				<Pages {...props} />
			</ThemeProvider>
		</CssLibPreferenceProvider>
	);
}

export default App;

function useAnalytics() {
	React.useEffect(() => {
		Router.events.on("routeChangeComplete", handleUrlChange);
		return () => {
			Router.events.off("routeChangeComplete", handleUrlChange);
		};
	}, []);
}
