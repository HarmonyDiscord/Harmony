import { Flex, useToast } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { currentPlaylistAtom } from '../../atoms/CurrentPlaylistAtom';
import { currentSecondsAtom } from '../../atoms/CurrentSecondsAtom';
import { discordActivityStatusAtom } from '../../atoms/DiscordActivityStatus';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import { upNextAtom } from '../../atoms/UpNextAtom';
import { api } from '../../util/api';
import MediaSlider from '../layout/MediaSlider';
import { hasRequestedSyncRef, isHostAtom, socket } from './AppFlow';

export default memo(function MediaPlayer() {
	const [songURL, setSongURL] = useState<string | undefined>(undefined);
	const playerRef = useRef<any>(null);
	const [isHost] = useAtom(isHostAtom);
	const toast = useToast();
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);
	const [currentMedia, setCurrentMedia] = useAtom(currentMediaAtom);
	const [, setCurrentSeconds] = useAtom(currentSecondsAtom);
	const setupCountRef = useRef(0);
	const [pendingPlayback, setPendingPlayback] = useState(false);
	const [discordActivityStatus] = useAtom(discordActivityStatusAtom);
	const [currentPlaylist] = useAtom(currentPlaylistAtom);
	const [upNext, setUpNext] = useAtom(upNextAtom);

	const mediaPlayerSetup = useCallback(async () => {
		console.log('mediaPlayerSetup called', { currentMedia });
		if (!currentMedia) {
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
		if (typeof window !== 'undefined') {
			const activity = {
				type: 2,
				instance: true,
				details: currentMedia.name,
				state: currentMedia.album?.name
					? currentMedia.album.name + ' - ' + currentMedia.artist.name
					: currentMedia.artist.name,
				assets: {
					large_image: currentMedia.thumbnail
				},
				timestamps: {
					start: Date.now(),
					end: Date.now() + currentMedia.duration * 1000
				}
			};
			if (window.discordSDK)
				await window.discordSDK.commands.setActivity({
					activity
				});
			if ('api' in window) {
				// @ts-expect-error Desktop API
				window.api.setActivity(activity);
			}
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
		const hasPlaylist = Object.keys(currentPlaylist).length > 0;

		if (hasPlaylist && upNext.length === 0) {
			const playlistArray = Object.values(currentPlaylist);
			const seedMedia = playlistArray[0] || currentMedia;

			if (seedMedia) {
				api.content.getUpNext(seedMedia.id).then((results) => {
					setUpNext(results || []);
				});
			}
		} else if (!hasPlaylist && upNext.length > 0) {
			setUpNext([]);
		}
	}, [Object.keys(currentPlaylist).length > 0]);

	useEffect(() => {
		if (pendingPlayback && songURL) {
			setMediaControls((prev) => ({ ...(prev ?? defaultMediaControls), isPlaying: true }));
			setPendingPlayback(false);
		}
	}, [pendingPlayback, songURL, setMediaControls]);

	useEffect(() => {
		function handleHarmonySeek(e: any) {
			if (typeof e.detail?.seconds === 'number' && playerRef.current) {
				if (typeof playerRef.current.seekTo === 'function') {
					playerRef.current.seekTo(e.detail.seconds, 'seconds');
				} else if ('currentTime' in playerRef.current) {
					playerRef.current.currentTime = e.detail.seconds;
				}
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
			if (typeof playerRef.current.seekTo === 'function') {
				playerRef.current.seekTo(to, 'seconds');
			} else if ('currentTime' in playerRef.current) {
				playerRef.current.currentTime = to;
			}
		},
		[playerRef]
	);

	const currentPlaylistIdArray = [...Object.keys(currentPlaylist)];
	const currentMediaIndex = currentMedia && currentPlaylistIdArray.indexOf(currentMedia.id);

	return (
		<Flex direction='column' w='100%' h='100%' gap='0px' maxH='100%'>
			<ReactPlayer
				wrapper='div'
				src={songURL}
				ref={playerRef}
				width='0px'
				height='0px'
				style={{
					display: 'none',
					overflow: 'hidden'
				}}
				playing={mediaControls?.isPlaying ?? false}
				volume={mediaControls?.volume ?? 1}
				muted={mediaControls?.isMuted ?? false}
				loop={mediaControls?.isLooping ?? false}
				onTimeUpdate={(eOrState: any) => {
					const seconds =
						typeof eOrState?.target?.currentTime === 'number'
							? eOrState.target.currentTime
							: typeof eOrState?.playedSeconds === 'number'
								? eOrState.playedSeconds
								: undefined;
					if (typeof seconds === 'number') setCurrentSeconds(seconds);
				}}
				onProgress={(p: any) => {
					if (typeof p?.playedSeconds === 'number') setCurrentSeconds(p.playedSeconds);
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
					}

					if (upNext.length > 0) {
						const nextMedia = upNext[0];
						if (nextMedia) {
							setCurrentMedia(nextMedia);
							setUpNext((prev) => prev.slice(1));
							return;
						}
					}

					setMediaControls({
						...(mediaControls ?? defaultMediaControls),
						isPlaying: false
					});
				}}
				onSeeked={() => {
					const position =
						typeof playerRef.current.currentTime === 'number'
							? playerRef.current.currentTime
							: typeof playerRef.current.getCurrentTime === 'function'
								? playerRef.current.getCurrentTime()
								: 0;
					if (isHost) socket?.emit('seekTo', position);
					if (typeof window !== 'undefined' && playerRef.current && currentMedia) {
						const start = Date.now() - position * 1000;
						const end = start + currentMedia.duration * 1000;
						const activity = {
							type: 2,
							instance: true,
							details: currentMedia.name,
							state: currentMedia.album?.name
								? currentMedia.album.name + ' - ' + currentMedia.artist.name
								: currentMedia.artist.name,
							assets: {
								large_image: currentMedia.thumbnail
							},
							timestamps: {
								start,
								end
							}
						};
						if (window.discordSDK)
							window.discordSDK.commands.setActivity({
								activity
							});
						if ('api' in window) {
							// @ts-expect-error Desktop API
							window.api.setActivity(activity);
						}
					}
				}}
				onWaiting={() => {
					setMediaControls({
						...(mediaControls ?? defaultMediaControls),
						isBuffering: true
					});
				}}
				onPlaying={() => {
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
						isPlaying: true
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
