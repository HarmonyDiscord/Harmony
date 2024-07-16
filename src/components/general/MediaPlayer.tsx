import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { discordActivityStatusAtom } from '../../atoms/DiscordActivityStatus';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import MediaSlider from '../layout/MediaSlider';
import getSongURL from '../../util/getSongURL';
import { Flex, Spacer } from '@chakra-ui/react';
import { currentMediaSourcesAtom, defaultCurrentMediaSources } from '../../atoms/CurrentMediaSourcesAtom';

export default function MediaPlayer() {
	const playerRef = useRef<ReactPlayer>(null);

	const [discordActivityStatus] = useAtom(discordActivityStatusAtom);
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);
	const [currentMediaSources, setCurrentMediaSources] = useAtom(currentMediaSourcesAtom);
	const [currentMedia] = useAtom(currentMediaAtom);

	const [progress, setProgress] = useState(0);

	const isAudio = !mediaControls?.isVideoMode;

	useEffect(() => {
		async function setup() {
			if (!currentMedia) return null;

			if (
				currentMediaSources?.currentId !== currentMedia.id ||
				(isAudio && currentMediaSources.songURL) ||
				(!isAudio && currentMediaSources.videoURL)
			) {
				setMediaControls({
					...(mediaControls ?? defaultMediaControls),
					isPlaying: false,
					isLoading: true
				});

				setCurrentMediaSources({
					...(currentMediaSources ?? defaultCurrentMediaSources),
					currentId: currentMedia.id,
					songURL: isAudio ? undefined : currentMediaSources?.songURL,
					videoURL: isAudio ? currentMediaSources?.videoURL : undefined
				});

				const url = await getSongURL(currentMedia.id, discordActivityStatus?.isActivity ?? false, isAudio);

				setCurrentMediaSources({
					...(currentMediaSources ?? defaultCurrentMediaSources),
					songURL: isAudio ? url : currentMediaSources?.songURL,
					videoURL: isAudio ? currentMediaSources?.videoURL : url
				});
			}

			setMediaControls({
				...(mediaControls ?? defaultMediaControls),
				isPlaying: true,
				isLoading: false
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
		<Flex direction='column' w='100%' h='100%' gap='10px' maxH='100%' overflow='hidden'>
			<ReactPlayer
				ref={playerRef}
				url={isAudio ? currentMediaSources?.songURL : currentMediaSources?.videoURL}
				width={mediaControls?.isVideoMode ? '100%' : '0px'}
				height={mediaControls?.isVideoMode ? '100%' : '0px'}
				style={{
					maxHeight: '100%',
					maxWidth: '100%',
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
			<Spacer />
			<MediaSlider playerRef={playerRef} progress={progress} />
		</Flex>
	);
}
