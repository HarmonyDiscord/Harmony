import { Flex, Spacer } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { discordActivityStatusAtom } from '../../atoms/DiscordActivityStatus';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import getSongURL from '../../util/getSongURL';
import MediaSlider from '../layout/MediaSlider';

export default function MediaPlayer() {
	const [songURL, setSongURL] = useState<string | undefined>(undefined);
	const playerRef = useRef<ReactPlayer>(null);

	const [discordActivityStatus] = useAtom(discordActivityStatusAtom);
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);
	const [currentMedia] = useAtom(currentMediaAtom);

	const [progress, setProgress] = useState(0);
	const [loadProgress, setLoadProgress] = useState(0);

	useEffect(() => {
		async function setup() {
			if (!currentMedia) return null;

			setMediaControls({
				...(mediaControls ?? defaultMediaControls),
				isPlaying: false,
				isLoading: true
			});

			setSongURL(undefined);

			const url = await getSongURL(
				currentMedia.id,
				discordActivityStatus?.isActivity ?? false,
				!mediaControls?.isVideoMode
			);

			setSongURL(url);

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
		}

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
				onProgress={(p) => {
					setProgress(p.playedSeconds);
					setLoadProgress(p.loadedSeconds);
				}}
				progressInterval={1}
				onBuffer={() =>
					setMediaControls({
						...(mediaControls ?? defaultMediaControls),
						isLoading: true
					})
				}
				onBufferEnd={() =>
					setMediaControls({
						...(mediaControls ?? defaultMediaControls),
						isLoading: false
					})
				}
				onReady={() => {
					setMediaControls({
						...(mediaControls ?? defaultMediaControls),
						isLoading: false,
						isPlaying: true
					});
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
				onError={(err) => {
					setMediaControls({
						...(mediaControls ?? defaultMediaControls),
						isPlaying: false
					});

					console.error(err);
				}}
			/>
			<Spacer />
			<MediaSlider seekTo={seekTo} seconds={progress} loadSeconds={loadProgress} />
		</Flex>
	);
}
