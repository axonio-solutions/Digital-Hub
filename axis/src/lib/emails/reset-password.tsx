import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";

interface PasswordResetProps {
	resetLink?: string;
	companyName?: string;
	userName?: string;
}

export default function PasswordReset({
	resetLink,
	companyName = "Axis",
	userName,
}: PasswordResetProps) {
	return (
		<Html>
			<Head />
			<Body style={main}>
				<Preview>Reset your password</Preview>
				<Container style={container}>
					<Section style={coverSection}>
						<Section style={upperSection}>
							<Heading style={h1}>Reset your password</Heading>
							<Text style={mainText}>Hello {userName},</Text>
							<Text style={mainText}>
								We received a request to reset the password for your account
								with {companyName}. If you didn't make this request, you can
								safely ignore this email.
							</Text>
							<Text style={mainText}>
								To reset your password, click the button below:
							</Text>
							<Section style={resetSection}>
								<Button href={resetLink} style={resetButton}>
									Reset Password
								</Button>
								<Text style={validityText}>
									(This link is valid for 1 hour)
								</Text>
							</Section>
							<Text style={alternativeText}>
								If the button doesn't work, you can also reset your password by
								copying and pasting the following URL into your browser:
							</Text>
							<Text style={linkText}>
								<Link href={resetLink} style={link}>
									{resetLink}
								</Link>
							</Text>
							<Text style={securityText}>
								For security reasons, this password reset link will expire in 1
								hour. If you need to reset your password after that time, please
								visit our website and request another reset link.
							</Text>
						</Section>
						<Hr />
						<Section style={lowerSection}>
							<Text style={cautionText}>
								{companyName} will never email you and ask you to disclose or
								verify your password, credit card, or banking account number.
							</Text>
						</Section>
					</Section>
					<Text style={footerText}>
						This message was sent by {companyName}. If you have any questions,
						please contact our support team. View our{" "}
						<Link href="#" target="_blank" style={link}>
							privacy policy
						</Link>
						.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

PasswordReset.PreviewProps = {
	resetLink:
		"https://example.com/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
	companyName: "Example Inc",
	userName: "John",
} satisfies PasswordResetProps;

const main = {
	backgroundColor: "#fff",
	color: "#212121",
};

const container = {
	padding: "20px",
	margin: "0 auto",
	backgroundColor: "#f5f5f5",
};

const h1 = {
	color: "#333",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "20px",
	fontWeight: "bold",
	marginBottom: "15px",
};

const link = {
	color: "#0070f3",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "14px",
	textDecoration: "underline",
};

const text = {
	color: "#333",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "14px",
	margin: "24px 0",
};

const coverSection = { backgroundColor: "#fff" };

const upperSection = { padding: "25px 35px" };

const lowerSection = { padding: "25px 35px" };

const footerText = {
	...text,
	fontSize: "12px",
	padding: "0 20px",
	color: "#666",
};

const resetButton = {
	backgroundColor: "#d32f2f",
	borderRadius: "4px",
	color: "#fff",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "16px",
	fontWeight: "bold",
	textDecoration: "none",
	textAlign: "center" as const,
	display: "block",
	padding: "12px 24px",
};

const validityText = {
	...text,
	margin: "16px 0",
	fontSize: "12px",
	textAlign: "center" as const,
};

const alternativeText = {
	...text,
	margin: "24px 0 8px 0",
	fontSize: "13px",
};

const linkText = {
	...text,
	margin: "0 0 24px 0",
	fontSize: "13px",
	wordBreak: "break-all" as const,
};

const resetSection = {
	display: "flex",
	flexDirection: "column" as const,
	alignItems: "center",
	justifyContent: "center",
	margin: "32px 0",
};

const mainText = { ...text, marginBottom: "14px" };

const cautionText = { ...text, margin: "0px" };

const securityText = {
	...text,
	fontSize: "13px",
	color: "#666",
	marginTop: "32px",
};
