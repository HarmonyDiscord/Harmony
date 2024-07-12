import { DiscordSDK } from '@discord/embedded-app-sdk';
import { useEffect } from 'react';

const discordSdk = new DiscordSDK('1261305104397500437');

async function setup() {
	// Wait for READY payload from the discord client
	await discordSdk.ready();

	// Pop open the OAuth permission modal and request for access to scopes listed in scope array below
	const { code } = await discordSdk.commands.authorize({
		client_id: '1261305104397500437',
		response_type: 'code',
		state: '',
		prompt: 'none',
		scope: ['identify']
	});

	// Retrieve an access_token from your application's server
	const response = await fetch('/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			code
		})
	});

	const { access_token } = await response.json();

	// Authenticate with Discord client (using the access_token)
	const auth = await discordSdk.commands.authenticate({
		access_token
	});

	console.log(auth);
}

export default function AppFlow({
	children
}: Readonly<{
	children: any;
}>) {
	useEffect(() => {
		if (typeof window === 'undefined') return;

		setup();

		return () => {};
	}, []);

	return children;
}
