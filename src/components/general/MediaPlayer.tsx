import { Flex, Spacer, useToast } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { currentSecondsAtom } from '../../atoms/CurrentSecondsAtom';
import { discordActivityStatusAtom } from '../../atoms/DiscordActivityStatus';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import getSongURL from '../../util/getSongURL';
import MediaSlider from '../layout/MediaSlider';

export default function MediaPlayer() {
	const [songURL, setSongURL] = useState<string | undefined>(undefined);
	const playerRef = useRef<ReactPlayer>(null);

	const toast = useToast();

	const [discordActivityStatus] = useAtom(discordActivityStatusAtom);
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);
	const [currentMedia, setCurrentMedia] = useAtom(currentMediaAtom);
	const [, setCurrentSeconds] = useAtom(currentSecondsAtom);

	const setupCountRef = useRef(0);

	const setup = useCallback(async () => {
		if (!currentMedia) return null;

		const currentSetup = ++setupCountRef.current;

		setMediaControls({
			...(mediaControls ?? defaultMediaControls),
			isPlaying: false,
			isLoading: true
		});

		setSongURL(undefined);

		setCurrentSeconds(0);

		const url = await getSongURL(
			currentMedia.id,
			discordActivityStatus?.isActivity ?? false,
			!mediaControls?.isVideoMode
		).catch(() => null);

		if (!url) {
			setMediaControls({
				...(mediaControls ?? defaultMediaControls),
				isLoading: false,
				isPlaying: false
			});

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

		if (currentSetup !== setupCountRef.current) return;

		const res = await fetch(url).catch(() => null);

		if (!res) {
			setMediaControls({
				...(mediaControls ?? defaultMediaControls),
				isLoading: false,
				isPlaying: false
			});

			setCurrentMedia(null);

			toast({
				status: 'error',
				variant: 'subtle',
				position: 'top',
				title: 'Unable to download the media. Please try again later.',
				containerStyle: {
					backdropFilter: 'blur(5px)'
				}
			});

			return;
		}

		if (currentSetup !== setupCountRef.current) return;

		const blob = await res.blob().catch(() => null);

		if (!blob) {
			setMediaControls({
				...(mediaControls ?? defaultMediaControls),
				isLoading: false,
				isPlaying: false
			});

			setCurrentMedia(null);

			toast({
				status: 'error',
				variant: 'subtle',
				position: 'top',
				title: 'Unable to convert the media. Please try again later.',
				containerStyle: {
					backdropFilter: 'blur(5px)'
				}
			});

			return;
		}

		if (currentSetup !== setupCountRef.current) return;

		setSongURL(URL.createObjectURL(blob));

		setMediaControls({
			...(mediaControls ?? defaultMediaControls),
			isLoading: false,
			isPlaying: true
		});

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
	}, [currentMedia]);

	useEffect(() => {
		setup();
	}, [currentMedia]);

	useEffect(() => {
		if (!mediaControls) return;

		setMediaControls({
			...(mediaControls ?? defaultMediaControls)
		});
	}, [setMediaControls]);

	const seekTo = useCallback(
		(to: number) => {
			if (!playerRef.current) return;

			playerRef.current.seekTo(to * (currentMedia?.duration ?? 0), 'seconds');
		},
		[playerRef, currentMedia?.duration]
	);

	return (
		<Flex direction='column' w='100%' h='100%' gap='10px' maxH='100%'>
			<ReactPlayer
				key='player'
				ref={playerRef}
				url={songURL}
				width={mediaControls?.isVideoMode ? '100%' : '0px'}
				height={mediaControls?.isVideoMode ? '100%' : '0px'}
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
				onPlay={() =>
					setMediaControls({
						...(mediaControls ?? defaultMediaControls),
						isPlaying: true
					})
				}
				onPause={() =>
					setMediaControls({
						...(mediaControls ?? defaultMediaControls),
						isPlaying: false
					})
				}
				onEnded={() =>
					setMediaControls({
						...(mediaControls ?? defaultMediaControls),
						isPlaying: false
					})
				}
			/>
			<Spacer />
			<MediaSlider seekTo={seekTo} />
		</Flex>
	);
}
