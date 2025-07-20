import { DiscordSDK } from '@discord/embedded-app-sdk';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { defaultDiscordActivityStatus, discordActivityStatusAtom } from '../../atoms/DiscordActivityStatus';
import { feedAtom } from '../../atoms/FeedAtom';
import { loadingAtom } from '../../atoms/LoadingAtom';
import { userAtom } from '../../atoms/UserAtom';
import { api } from '../../util/api';

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
	const [discordActivityStatus, setDiscordActivityStatus] = useAtom(discordActivityStatusAtom);
	const [_isLoading, setIsLoading] = useAtom(loadingAtom);
	const [_user, setUser] = useAtom(userAtom);
	const [_feed, setFeed] = useAtom(feedAtom);

	async function setup() {
		const results = await api.content.mediaSearch('robe');
		if (!results) return setFeed(null);
		setFeed(results);

		if (discordSDK) {
			setDiscordActivityStatus({
				...(discordActivityStatus ?? defaultDiscordActivityStatus),
				isActivity: true
			});

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

			setIsLoading(false);

			await discordSDK.subscribe('ACTIVITY_LAYOUT_MODE_UPDATE', ({ layout_mode }) => {
				console.log('sdk update', layout_mode);
				setDiscordActivityStatus({
					...(discordActivityStatus ?? defaultDiscordActivityStatus),
					isOverlay: layout_mode === 1
				});
			});
		} else {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		if (typeof window === 'undefined') return;

		setup();

		return () => {};
	}, []);

	return children;
}
