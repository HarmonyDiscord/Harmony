import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { discordActivityStatusAtom } from '../../atoms/DiscordActivityStatus';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import MediaSlider from '../layout/MediaSlider';
import getSongURL from '../../util/getSongURL';
import { Flex } from '@chakra-ui/react';

export default function MediaPlayer() {
	const [songURL, setSongURL] = useState<string | undefined>(undefined);
	const playerRef = useRef<ReactPlayer>(null);

	const [discordActivityStatus] = useAtom(discordActivityStatusAtom);
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);
	const [currentMedia] = useAtom(currentMediaAtom);

	const [progress, setProgress] = useState(0);

	useEffect(() => {
		async function setup() {
			if (!currentMedia) return null;

			setMediaControls({
				...(mediaControls ?? defaultMediaControls),
				isPlaying: false,
				isLoading: true
			});

			setSongURL(undefined);

			const url = await getSongURL(currentMedia.id, discordActivityStatus?.isActivity ?? false);

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

	return (
		<Flex direction='column' w='100%' h='100%' gap='10px' maxH='100%'>
			<ReactPlayer
				ref={playerRef}
				url={songURL}
				width='100%'
				height='100%'
				style={{
					maxHeight: '100%',
					borderRadius: '10px'
				}}
				playing={mediaControls?.isPlaying ?? false}
				volume={mediaControls?.volume ?? 1}
				muted={mediaControls?.isMuted ?? false}
				loop={mediaControls?.isLooping ?? false}
				onProgress={(p) => setProgress(p.played)}
				progressInterval={1}
				onReady={() => {
					setMediaControls({
						...(mediaControls ?? defaultMediaControls),
						isLoading: false
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
				onError={(err) => console.error(err)}
			/>
			<MediaSlider playerRef={playerRef} progress={progress} />
		</Flex>
	);
}
