import { Flex, useToast } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { currentSecondsAtom } from '../../atoms/CurrentSecondsAtom';
import { discordActivityStatusAtom } from '../../atoms/DiscordActivityStatus';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import { api } from '../../util/api';
import MediaSlider from '../layout/MediaSlider';
import { hasRequestedSyncRef, isHostAtom, socket } from './AppFlow';
import { currentPlaylistAtom } from '../../atoms/CurrentPlaylistAtom';

export default memo(function MediaPlayer() {
	const [songURL, setSongURL] = useState<string | undefined>(undefined);
	const playerRef = useRef<ReactPlayer>(null);
	const [isHost] = useAtom(isHostAtom);
	const toast = useToast();
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);
	const [currentMedia, setCurrentMedia] = useAtom(currentMediaAtom);
	const [, setCurrentSeconds] = useAtom(currentSecondsAtom);
	const setupCountRef = useRef(0);
	const [pendingPlayback, setPendingPlayback] = useState(false);
	const [discordActivityStatus] = useAtom(discordActivityStatusAtom);
	const [currentPlaylist] = useAtom(currentPlaylistAtom);

	const lastEmittedMediaIdRef = useRef<string | null>(null);

	const mediaPlayerSetup = useCallback(async () => {
		console.log('mediaPlayerSetup called', { currentMedia });
		if (!currentMedia) {
			lastEmittedMediaIdRef.current = null;
			return null;
		}

		const currentSetup = ++setupCountRef.current;

		if (songURL) {
			URL.revokeObjectURL(songURL);
			setSongURL(undefined);
		}

		setCurrentSeconds(0);

		if (discordActivityStatus.isActivity) {
			const res = await api.getMediaStream(currentMedia.id).catch(() => null);

			if (currentSetup !== setupCountRef.current) {
				if (res) {
					res.body?.cancel();
				}
				return;
			}

			if (!res) {
				setMediaControls((prev) => ({
					...(prev ?? defaultMediaControls),
					isLoading: false,
					isPlaying: false
				}));

				setCurrentMedia(null);

				toast({
					status: 'error',
					variant: 'subtle',
					position: 'top',
					title: 'Unable to get media information. Please try again later.',
					containerStyle: {
						backdropFilter: 'blur(5px)'
					}
				});

				return;
			}

			const blob = await res.blob().catch(() => null);

			if (currentSetup !== setupCountRef.current) {
				return;
			}

			if (!blob) {
				setMediaControls((prev) => ({
					...(prev ?? defaultMediaControls),
					isLoading: false,
					isPlaying: false
				}));

				setCurrentMedia(null);

				toast({
					status: 'error',
					variant: 'subtle',
					position: 'top',
					title: 'Media not available. Please try again later.',
					containerStyle: {
						backdropFilter: 'blur(5px)'
					}
				});

				return;
			}

			const newURL = URL.createObjectURL(blob);
			setSongURL(newURL);
		} else {
			setSongURL(api.getStreamURL(currentMedia.id));
		}

		setMediaControls((prev) => ({
			...(prev ?? defaultMediaControls),
			isLoading: false,
			isPlaying: true
		}));

		if ('mediaSession' in navigator) {
			navigator.mediaSession.metadata = new MediaMetadata({
				title: currentMedia.name,
				artist: currentMedia.artist.name,
				album: currentMedia.album?.name,
				artwork: currentMedia.thumbnail
					? [
							{
								src: currentMedia.thumbnail,
								sizes: '250x250',
								type: 'image/png'
							}
						]
					: []
			});
		}
	}, [currentMedia?.id, setCurrentMedia]);

	useEffect(() => {
		if (currentMedia) {
			setMediaControls((prev) => ({
				...(prev ?? defaultMediaControls),
				isLoading: true,
				isPlaying: false
			}));
			mediaPlayerSetup();
		}
		return () => {
			if (songURL) {
				URL.revokeObjectURL(songURL);
			}
		};
	}, [currentMedia?.id]);

	useEffect(() => {
		if (!mediaControls) {
			setMediaControls({
				...defaultMediaControls,
				isLoading: !!currentMedia
			});
		}
	}, []);

	useEffect(() => {
		if (pendingPlayback && songURL) {
			setMediaControls((prev) => ({ ...(prev ?? defaultMediaControls), isPlaying: true }));
			setPendingPlayback(false);
		}
	}, [pendingPlayback, songURL, setMediaControls]);

	useEffect(() => {
		function handleHarmonySeek(e: any) {
			if (typeof e.detail?.seconds === 'number' && playerRef.current) {
				playerRef.current.seekTo(e.detail.seconds, 'seconds');
			}
		}
		window.addEventListener('harmony-seek', handleHarmonySeek);
		return () => {
			window.removeEventListener('harmony-seek', handleHarmonySeek);
		};
	}, []);

	const seekTo = useCallback(
		(to: number) => {
			if (!playerRef.current) return;
			playerRef.current.seekTo(to, 'seconds');
		},
		[playerRef]
	);

	const currentPlaylistIdArray = [...Object.keys(currentPlaylist)];
	const currentMediaIndex = currentMedia && currentPlaylistIdArray.indexOf(currentMedia.id);

	return (
		<Flex direction='column' w='100%' h='100%' gap='0px' maxH='100%'>
			<ReactPlayer
				key='player'
				ref={playerRef}
				url={songURL}
				width='0px'
				height='0px'
				style={{
					overflow: 'hidden'
				}}
				playing={mediaControls?.isPlaying ?? false}
				volume={mediaControls?.volume ?? 1}
				muted={mediaControls?.isMuted ?? false}
				loop={mediaControls?.isLooping ?? false}
				progressInterval={1}
				onProgress={(p) => {
					setCurrentSeconds(p.playedSeconds);
				}}
				onPlay={() => {
					setMediaControls({
						...(mediaControls ?? defaultMediaControls),
						isPlaying: true
					});
				}}
				onPause={() => {
					setMediaControls({
						...(mediaControls ?? defaultMediaControls),
						isPlaying: false,
						isBuffering: false
					});
				}}
				onEnded={() => {
					if (
						currentPlaylistIdArray.length > 0 &&
						typeof currentMediaIndex === 'number' &&
						currentMediaIndex >= 0
					) {
						const nextId = currentPlaylistIdArray[currentMediaIndex + 1];
						if (nextId) {
							const nextMedia = currentPlaylist[nextId];
							if (nextMedia) {
								setCurrentMedia(nextMedia);
								return;
							}
						}
					} else {
						setMediaControls({
							...(mediaControls ?? defaultMediaControls),
							isPlaying: false
						});
					}
				}}
				onSeek={() => {
					setMediaControls({
						...(mediaControls ?? defaultMediaControls),
						isPlaying: true
					});
				}}
				onBuffer={() => {
					setMediaControls({
						...(mediaControls ?? defaultMediaControls),
						isBuffering: true
					});
				}}
				onBufferEnd={() => {
					setMediaControls({
						...(mediaControls ?? defaultMediaControls),
						isBuffering: false,
						isPlaying: true
					});
				}}
				onReady={() => {
					setMediaControls({
						...(mediaControls ?? defaultMediaControls),
						isBuffering: false,
						isLoading: false,
						isPlaying: isHost ? true : hasRequestedSyncRef.current ? false : true
					});
					if (!isHost && !hasRequestedSyncRef.current) {
						socket?.emit('requestSyncMedia');
						hasRequestedSyncRef.current = true;
					}
				}}
				onError={() => {
					toast({
						status: 'error',
						variant: 'subtle',
						position: 'top',
						title: 'Unable to load media. Please try again later.',
						containerStyle: {
							backdropFilter: 'blur(5px)'
						}
					});
				}}
			/>
			<MediaSlider seekTo={seekTo} />
		</Flex>
	);
});
