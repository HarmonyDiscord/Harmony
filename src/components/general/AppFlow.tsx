import { DiscordSDK } from '@discord/embedded-app-sdk';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { loadingAtom } from '../../atoms/LoadingAtom';

const clientId = process.env['NEXT_PUBLIC_DISCORD_CLIENT_ID'] ?? '';

const discordSDK = new DiscordSDK(clientId);

export default function AppFlow({
	children
}: Readonly<{
	children: any;
}>) {
	const [_isLoading, setIsLoading] = useAtom(loadingAtom);

	async function setup() {
		await discordSDK.ready();

		const { code } = await discordSDK.commands.authorize({
			client_id: clientId,
			response_type: 'code',
			prompt: 'none',
			scope: ['identify']
		});

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

		const auth = await discordSDK.commands.authenticate({
			access_token
		});

		setIsLoading(false);

		console.log(auth);
	}

	useEffect(() => {
		if (typeof window === 'undefined') return;

		setup();

		return () => {};
	}, []);

	return children;
}
