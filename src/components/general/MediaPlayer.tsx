import axios from 'axios';
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { currentMediaAtom } from 'src/atoms/CurrentMediaAtom';
import { discordActivityStatusAtom } from 'src/atoms/DiscordActivityStatus';
import { defaultMediaControls, mediaControlsAtom } from 'src/atoms/MediaControlAtom';
import type { CobaltResponse } from 'src/types/Cobalt';
import MediaSlider from '../layout/MediaSlider';

export default function MediaPlayer({ songURL, setSongURL }: Readonly<{ songURL?: string; setSongURL: any }>) {
	const playerRef = useRef<ReactPlayer>(null);

	const [discordActivityStatus] = useAtom(discordActivityStatusAtom);
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);
	const [currentMedia] = useAtom(currentMediaAtom);

	const [progress, setProgress] = useState(0);

	useEffect(() => {
		async function getSongURL(songId: string) {
			const { data } = await axios.post<CobaltResponse>(
				discordActivityStatus?.isActivity ? '/api/json' : 'https://api.cobalt.tools/api/json',
				{
					url: 'https://youtube.com/watch?v=' + songId,
					aFormat: 'mp3'
				},
				{
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json'
					}
				}
			);

			const url = discordActivityStatus?.isActivity
				? data.url
						?.replace('https://kityune.imput.net/api/stream', '/kityune/stream')
						.replace('https://olly.imput.net/api/stream', '/olly/stream')
				: data.url;

			return url;
		}

		async function setup() {
			if (!currentMedia) return null;

			setMediaControls({
				...(mediaControls ?? defaultMediaControls),
				isPlaying: false,
				isLoading: true
			});

			setSongURL(undefined);

			const url = await getSongURL(currentMedia.id);

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
		<>
			<ReactPlayer
				ref={playerRef}
				url={songURL}
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
		</>
	);
}
