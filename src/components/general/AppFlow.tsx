import { DiscordSDK } from '@discord/embedded-app-sdk';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { feedAtom } from '../../atoms/FeedAtom';
import { loadingAtom } from '../../atoms/LoadingAtom';
import { userAtom } from '../../atoms/UserAtom';
import axios from 'axios';

const clientId = process.env['NEXT_PUBLIC_DISCORD_CLIENT_ID'] ?? '';

let discordSDK: DiscordSDK | null = null;

try {
	discordSDK = new DiscordSDK(clientId);
} catch {}

export default function AppFlow({
	children
}: Readonly<{
	children: any;
}>) {
	const [_isLoading, setIsLoading] = useAtom(loadingAtom);
	const [_user, setUser] = useAtom(userAtom);
	const [_feed, setFeed] = useAtom(feedAtom);

	async function setup() {
		const results = await axios
			.get(`/api/song/search?q=${encodeURIComponent(' ')}`)
			.then((res) => res.data)
			.catch(() => null);

		if (!results) return setFeed(null);

		setFeed(results);

		if (discordSDK) {
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

			setUser({
				name: auth.user.id,
				avatarURL: auth.user.avatar
					? `https://cdn.discordapp.com/avatars/${auth.user.id}/${auth.user.avatar}.png`
					: undefined
			});
		}

		setIsLoading(false);
	}

	useEffect(() => {
		if (typeof window === 'undefined') return;

		setup();

		return () => {};
	}, []);

	return children;
}
