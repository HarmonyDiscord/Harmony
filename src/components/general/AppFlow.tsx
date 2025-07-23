import {
	Box,
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text
} from '@chakra-ui/react';
import { DiscordSDK, Events, type Types } from '@discord/embedded-app-sdk';
import { useAtom } from 'jotai';
import { atom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { MdArrowForward, MdPlayArrow } from 'react-icons/md';
import { io } from 'socket.io-client';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { currentPlaylistAtom } from '../../atoms/CurrentPlaylistAtom';
import { currentSecondsAtom } from '../../atoms/CurrentSecondsAtom';
import { discordActivityStatusAtom } from '../../atoms/DiscordActivityStatus';
import { feedAtom } from '../../atoms/FeedAtom';
import { loadingAtom } from '../../atoms/LoadingAtom';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import { participantsAtom } from '../../atoms/ParticipantsAtom';
import { userAtom } from '../../atoms/UserAtom';
import { api, setIsDiscordActivity } from '../../util/api';
import LogoIcon from '../icons/LogoIcon';

const clientId = process.env['NEXT_PUBLIC_DISCORD_CLIENT_ID'] ?? '';

let discordSDK: DiscordSDK | null = null;
let socket: ReturnType<typeof io> | null = null;

try {
	discordSDK = new DiscordSDK(clientId);
} catch {}

export const isHostAtom = atom<boolean>(false);

const hasRequestedSyncRef = { current: false };

function generateRoomId() {
	return Math.random().toString(36).substring(2, 10);
}

export default function AppFlow({ children }: Readonly<{ children: any }>) {
	const [, setDiscordActivityStatus] = useAtom(discordActivityStatusAtom);
	const [, setIsLoading] = useAtom(loadingAtom);
	const [user, setUser] = useAtom(userAtom);
	const [participants, setParticipants] = useAtom(participantsAtom);
	const [, setFeed] = useAtom(feedAtom);
	const [, setCurrentMedia] = useAtom(currentMediaAtom);
	const [currentMedia] = useAtom(currentMediaAtom);
	const [mediaControls] = useAtom(mediaControlsAtom);
	const [currentPlaylist] = useAtom(currentPlaylistAtom);
	const [currentSeconds] = useAtom(currentSecondsAtom);
	const [isHost] = useAtom(isHostAtom);
	const [, setIsHost] = useAtom(isHostAtom);
	const [, setMediaControls] = useAtom(mediaControlsAtom);
	const [, setCurrentSeconds] = useAtom(currentSecondsAtom);
	const [, setCurrentPlaylist] = useAtom(currentPlaylistAtom);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [, setAutoplayRequested] = useState(false);

	const currentValuesRef = useRef({
		currentMedia: null as any,
		mediaControls: null as any,
		currentSeconds: 0
	});

	useEffect(() => {
		currentValuesRef.current = {
			currentMedia,
			mediaControls,
			currentSeconds
		};
	}, [currentMedia, mediaControls, currentSeconds]);

	function handleAutoplayRequest() {
		setAutoplayRequested(true);
		setIsModalOpen(false);
		setIsLoading(false);
	}

	const handleSyncMedia = (data: {
		currentMedia: any;
		currentMediaControls?: {
			isPlaying: boolean;
			isLooping: boolean;
		};
		currentSeconds: number;
		requesterId?: string;
	}) => {
		setCurrentMedia(data.currentMedia);
		let shouldSetSeconds = !!data.requesterId;
		setMediaControls((prev: any) => {
			const prevPlaying = prev?.isPlaying;
			const nextPlaying = data.currentMediaControls?.isPlaying;
			if (prevPlaying === true && nextPlaying === false) shouldSetSeconds = true;
			return {
				...(prev ?? defaultMediaControls),
				isPlaying: nextPlaying,
				isLooping: data.currentMediaControls?.isLooping
			};
		});

		if (shouldSetSeconds) {
			setCurrentSeconds(data.currentSeconds);
			window.dispatchEvent(new CustomEvent('harmony-seek', { detail: { seconds: data.currentSeconds } }));
		}
	};

	const handleSeekTo = (data: number) => {
		setCurrentSeconds(data);

		window.dispatchEvent(new CustomEvent('harmony-seek', { detail: { seconds: data } }));
	};

	const handleSyncPlaylist = (data: {
		currentPlaylist: any;
	}) => {
		setCurrentPlaylist(data.currentPlaylist);
	};

	const handleReady = (data: any) => {
		console.log('handleReady', data);
		setIsHost(data.isHost);
		setCurrentMedia(data.currentMedia);
		setMediaControls((prev: any) => {
			const nextPlaying = data.currentMediaControls?.isPlaying;
			return {
				...(prev ?? defaultMediaControls),
				isPlaying: nextPlaying,
				isLooping: data.currentMediaControls?.isLooping
			};
		});
		setCurrentPlaylist(data.currentPlaylist);
		if (!data.isHost) {
			setIsLoading(true);
			setIsModalOpen(true);
		} else {
			setIsModalOpen(false);
			setIsLoading(false);
		}
	};

	const handleNewHost = (data: any) => {
		setIsHost(data.isHost);
		if (data.isHost) {
			setIsModalOpen(false);
			setIsLoading(false);
		}
	};

	async function appSetup() {
		if (discordSDK) {
			setIsDiscordActivity(true);
			setDiscordActivityStatus((prev) => ({ ...prev, isActivity: true }));
		}

		const results = await api.content.mediaSearch('robe extremoduro');
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

			const response = await fetch('/.proxy/api/token', {
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
				id: auth.user.id,
				name: auth.user.username,
				avatarURL: auth.user.avatar
					? `https://cdn.discordapp.com/avatars/${auth.user.id}/${auth.user.avatar}.png`
					: undefined
			});

			const { participants } = await discordSDK.commands.getInstanceConnectedParticipants();

			setParticipants(
				participants.map((p) => ({
					id: p.id,
					name: p.username,
					avatarURL: p.avatar ? `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png` : undefined
				}))
			);

			function updateParticipants({ participants }: Types.GetActivityInstanceConnectedParticipantsResponse) {
				setParticipants(
					participants.map((p) => ({
						id: p.id,
						name: p.username,
						avatarURL: p.avatar ? `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png` : undefined
					}))
				);
			}

			discordSDK.subscribe(Events.ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE, updateParticipants);

			discordSDK.subscribe(Events.ACTIVITY_LAYOUT_MODE_UPDATE, ({ layout_mode }) => {
				setDiscordActivityStatus((prev) => ({ ...prev, isOverlay: layout_mode === 1 }));
			});
		}

		if (socket) socket.disconnect();

		let roomId = window.location.hash.replace('#', '');
		let usingDiscordInstanceId = false;
		if (discordSDK?.instanceId) {
			roomId = discordSDK.instanceId;
			usingDiscordInstanceId = true;
		}
		if (!roomId) {
			roomId = generateRoomId();
			setHash(roomId);
		} else if (usingDiscordInstanceId) {
			setHash(roomId);
		}

		socket = io(
			`${discordSDK ? `/` : process.env.NODE_ENV === 'production' ? 'https://harmony-events.tnfangel.com' : 'http://localhost:4001'}`,
			{
				transports: process.env.NODE_ENV === 'production' ? ['polling', 'websocket'] : ['polling', 'websocket'],
				path: `${discordSDK ? '/.proxy/events/' : '/events'}`,
				auth: {
					roomId
				},
				reconnection: true,
				reconnectionAttempts: Infinity,
				reconnectionDelay: 2000,
				reconnectionDelayMax: 60000
			}
		);

		if (socket) {
			const handleRequestSyncMedia = ({ requesterId }: { requesterId: string }) => {
				const {
					currentMedia: currentMediaValue,
					mediaControls: mediaControlsValue,
					currentSeconds: currentSecondsValue
				} = currentValuesRef.current;

				socket?.emit('syncMedia', {
					currentMedia: currentMediaValue,
					currentMediaControls: {
						isPlaying: mediaControlsValue?.isPlaying,
						isLooping: mediaControlsValue?.isLooping
					},
					currentSeconds: currentSecondsValue,
					requesterId
				});
			};

			socket.on('ready', handleReady);
			socket.on('newHost', handleNewHost);
			socket.on('syncMedia', handleSyncMedia);
			socket.on('requestSyncMedia', handleRequestSyncMedia);
			socket.on('seekTo', handleSeekTo);
			socket.on('syncPlaylist', handleSyncPlaylist);

			return () => {
				socket?.off('ready', handleReady);
				socket?.off('newHost', handleNewHost);
				socket?.off('syncMedia', handleSyncMedia);
				socket?.off('requestSyncMedia', handleRequestSyncMedia);
				socket?.off('seekTo', handleSeekTo);
				socket?.off('syncPlaylist', handleSyncPlaylist);
			};
		}
	}

	useEffect(() => {
		if (typeof window === 'undefined') return;

		let cleanup: (() => void) | undefined;

		appSetup().then((cleanupFn) => {
			if (typeof cleanupFn === 'function') {
				cleanup = cleanupFn;
			}
		});

		return () => {
			if (cleanup) cleanup();
		};
	}, [user, participants]);

	useEffect(() => {
		if (isHost && socket) {
			socket.emit('syncMedia', {
				currentMedia,
				currentMediaControls: {
					isPlaying: mediaControls?.isPlaying,
					isLooping: mediaControls?.isLooping
				},
				currentSeconds
			});
		}
	}, [currentMedia?.id, mediaControls?.isPlaying, mediaControls?.isLooping, isHost]);

	useEffect(() => {
		if (isHost && socket) {
			socket.emit('syncPlaylist', {
				currentPlaylist
			});
		}
	}, [currentPlaylist, isHost]);

	const initialHashRef = useRef<string | null>(null);
	const isProgrammaticHashChange = useRef(false);

	useEffect(() => {
		if (initialHashRef.current === null) {
			initialHashRef.current = window.location.hash;
		}
	}, []);

	function setHash(hash: string) {
		isProgrammaticHashChange.current = true;
		window.location.hash = hash;
	}

	useEffect(() => {
		function onHashChange() {
			if (isProgrammaticHashChange.current) {
				isProgrammaticHashChange.current = false;
				return;
			}
			if (window.location.hash !== initialHashRef.current) {
				window.location.reload();
			}
		}
		window.addEventListener('hashchange', onHashChange);
		return () => {
			window.removeEventListener('hashchange', onHashChange);
		};
	}, []);

	return (
		<>
			{!isHost && (
				<Modal isOpen={isModalOpen} onClose={() => handleAutoplayRequest()} isCentered closeOnEsc={false}>
					<ModalOverlay bg='#00000020' />
					<ModalContent bg='#00000050' color='#fff'>
						<ModalHeader fontWeight='bold' fontSize='2xl' display='flex' alignItems='center' gap='2'>
							<LogoIcon
								width='20px'
								height='auto'
								style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }}
							/>{' '}
							Session Controlled by Host
						</ModalHeader>
						<ModalBody>
							<Text fontSize='lg'>
								This session is controlled by the host. To enable playback, please click continue.
							</Text>
						</ModalBody>
						<ModalFooter>
							<Button
								w='100%'
								onClick={handleAutoplayRequest}
								color='#fff'
								rightIcon={<MdArrowForward />}
							>
								Continue
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			)}
			{typeof children === 'function' ? children({ isModalOpen }) : children}
		</>
	);
}

export { socket, hasRequestedSyncRef };
