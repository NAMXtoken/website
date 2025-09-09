import { Link } from "@radix-ui/themes";
import { useRouter } from "next/router";
import { Header, HeaderProps } from "./Header";

export const PrimitivesHeader = (props: HeaderProps) => {
	const router = useRouter();

	return (
		<Header gitHubLink="https://github.com/radix-ui/primitives" {...props}>
			<Link
				size="2"
				color="gray"
				href="#"
				highContrast={router.pathname.includes("/primitives/docs")}
			>
				Social
			</Link>
			<Link
				size="2"
				color="gray"
				href="#"
				highContrast={router.pathname.includes("/primitives/case-studies")}
			>
				Directions
			</Link>
		</Header>
	);
};
