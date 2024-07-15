import { Center, Text, Box, Flex, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { BarLoader } from 'react-spinners';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import formatDuration from '../../util/formatDuration';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import { discordActivityStatusAtom } from '../../atoms/DiscordActivityStatus';
import { type CobaltResponse } from '../../types/Cobalt';
import axios from 'axios';

export default function VideoSlider({ songURL, setSongURL }: { songURL?: string; setSongURL: any }) {
	const [discordActivityStatus] = useAtom(discordActivityStatusAtom);
	const [currentMedia] = useAtom(currentMediaAtom);
	const [progress, setProgress] = useState(0);
	const [currentTime, setCurrentTime] = useState('00:00');
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const audio = audioRef.current;

	useEffect(() => {
		async function getSongUrl(songId: string) {
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

			setProgress(0);

			setMediaControls({
				...(mediaControls ?? defaultMediaControls),
				isPlaying: false,
				isLoading: true
			});

			setSongURL(undefined);

			const url = await getSongUrl(currentMedia.id);

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
		if (!audio) return;

		if (mediaControls?.isPlaying) audio.play().catch(() => null);
		else if (!mediaControls?.isLoading && !mediaControls?.isWaiting) audio.pause();

		if (mediaControls?.isMuted) audio.volume = 0;
		else if (mediaControls?.volume) audio.volume = mediaControls.volume;
	}, [mediaControls]);

	const handleTimeUpdate = () => {
		if (!audio) return;
		if (mediaControls?.isLoading) return;

		const value = (audio.currentTime / (currentMedia?.duration ?? audio.duration)) * 100;

		setCurrentTime(formatDuration(audio.currentTime));

		if (!isNaN(value)) setProgress(value);
	};

	const handleProgressChange = (value: number) => {
		if (!audio) return;

		const newTime = (value / 100) * (currentMedia?.duration ?? audio.duration);

		if (!isNaN(newTime)) {
			audio.currentTime = newTime;

			setProgress(value);
		}
	};

	return (
		currentMedia && (
			<Center my='5px' h='16px'>
				<Box w='100%'>
					<AnimatePresence mode='wait'>
						{!mediaControls?.isLoading ? (
							<Flex w='100%' gap='12px'>
								<Text>{currentTime}</Text>
								<Slider
									as={motion.div}
									key='slider'
									isReadOnly={mediaControls?.isWaiting}
									aria-label='track'
									colorScheme='gray'
									value={progress}
									onChange={handleProgressChange}
									focusThumbOnChange={false}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1, transition: { duration: 0.1 } }}
									exit={{ opacity: 0, transition: { duration: 0.1 } }}
								>
									<SliderTrack>
										<SliderFilledTrack />
									</SliderTrack>
									<SliderThumb />
								</Slider>
								<Text>{formatDuration(currentMedia.duration)}</Text>
							</Flex>
						) : (
							<motion.div
								key='loader'
								initial={{ width: '0%', opacity: 0 }}
								animate={{
									width: '100%',
									opacity: 1,
									transition: { duration: 0.1 }
								}}
								exit={{
									width: '0%',
									opacity: 0,
									transition: { duration: 0.1 }
								}}
							>
								<BarLoader
									color='#FFFFFF'
									width='100%'
									loading={true}
									cssOverride={{ borderRadius: '10px', display: 'block' }}
									aria-label='Loading'
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</Box>
				<audio
					key='current-song'
					autoPlay
					ref={audioRef}
					src={songURL}
					onTimeUpdate={handleTimeUpdate}
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
					onWaiting={() =>
						setMediaControls({
							...(mediaControls ?? defaultMediaControls),
							isWaiting: true
						})
					}
					onCanPlayThrough={() =>
						setMediaControls({
							...(mediaControls ?? defaultMediaControls),
							isLoading: false,
							isWaiting: false
						})
					}
				/>
			</Center>
		)
	);
}
