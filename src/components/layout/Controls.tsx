import {
	Box,
	Center,
	Flex,
	Heading,
	Hide,
	IconButton,
	Slider,
	SliderFilledTrack,
	SliderThumb,
	SliderTrack,
	Spacer,
	Text
} from '@chakra-ui/react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import Image from 'next/image';
import { memo, useEffect, useRef, useState } from 'react';
import {
	MdClose,
	MdDownload,
	MdPause,
	MdPlayArrow,
	MdRepeat,
	MdRepeatOn,
	MdSkipNext,
	MdSkipPrevious,
	MdVolumeOff,
	MdVolumeUp
} from 'react-icons/md';
import { BarLoader } from 'react-spinners';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { discordActivityStatusAtom } from '../../atoms/DiscordActivityStatus';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import { type CobaltResponse } from '../../types/Cobalt';
import formatDuration from '../../util/formatDuration';

export default memo(function Controls() {
	const [currentMedia, setCurrentSong] = useAtom(currentMediaAtom);
	const [discordActivityStatus] = useAtom(discordActivityStatusAtom);
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);
	const [songURL, setSongURL] = useState<string | undefined>(undefined);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [progress, setProgress] = useState(0);
	const [currentTime, setCurrentTime] = useState('00:00');

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

			console.log('got url', url);

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

	const audio = audioRef.current;

	useEffect(() => {
		if (!audio) return;

		if (mediaControls?.isPlaying) audio.play().catch(() => null);
		else audio.pause();

		if (mediaControls?.isMuted) audio.volume = 0;
		else if (mediaControls?.volume) audio.volume = mediaControls.volume;
	}, [mediaControls]);

	const handleTimeUpdate = () => {
		if (!audio) return;
		if (mediaControls?.isLoading) return;

		const value = (audio.currentTime / audio.duration) * 100;

		setCurrentTime(formatDuration(audio.currentTime));

		if (!isNaN(value)) setProgress(value);
	};

	const handleProgressChange = (value: number) => {
		if (!audio) return;

		const newTime = (value / 100) * audio.duration;

		if (!isNaN(newTime)) {
			audio.currentTime = newTime;

			setProgress(value);
		}
	};

	const handleVolumeChange = (value: number) => {
		setMediaControls({ ...(mediaControls ?? defaultMediaControls), isMuted: false });
		setMediaControls({
			...(mediaControls ?? defaultMediaControls),
			volume: value / 100
		});
	};

	const toggleLoop = () => {
		setMediaControls({
			...(mediaControls ?? defaultMediaControls),
			isLooping: !mediaControls?.isLooping
		});
	};

	return (
		<AnimatePresence mode='popLayout'>
			{currentMedia && (
				<Box
					as={motion.div}
					w='100%'
					p='20px'
					pt='0px'
					initial={{ y: 10, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: 10, opacity: 0 }}
				>
					<Flex w='100%' h='100%' direction='column' gap='10px'>
						<Center my='5px' h='16px'>
							<Box w='100%'>
								<AnimatePresence mode='wait'>
									{!mediaControls?.isLoading ? (
										<Flex w='100%' gap='12px'>
											<Text>{currentTime}</Text>
											<Slider
												as={motion.div}
												key='slider'
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
											animate={{ width: '100%', opacity: 1, transition: { duration: 0.1 } }}
											exit={{ width: '0%', opacity: 0, transition: { duration: 0.1 } }}
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
						</Center>
						<Flex
							w='100%'
							bg='#FFFFFF10'
							borderRadius='10px'
							p='20px'
							gap='20px'
							zIndex={2}
							alignItems='center'
							backdropFilter='blur(5px)'
							direction={['column', 'column', 'row']}
						>
							<AnimatePresence mode='wait'>
								<Flex
									key={currentMedia.id}
									as={motion.div}
									gap='12px'
									alignItems='center'
									initial={{ y: -10, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ y: 10, opacity: 0 }}
								>
									<Image
										width={48}
										height={48}
										src={currentMedia.thumbnail ?? ''}
										alt='Media icon'
										objectFit='cover'
										style={{
											borderRadius: '5px'
										}}
									/>
									<Flex gap='4px' direction='column'>
										<Heading size='md'>{currentMedia.name}</Heading>
										<Text>
											{currentMedia.album?.name} – {currentMedia.artist.name}
										</Text>
									</Flex>
								</Flex>
							</AnimatePresence>
							<Flex
								gap='10px'
								w='100%'
								position={['relative', 'relative', 'absolute']}
								alignItems='center'
							>
								<Spacer />
								<IconButton icon={<MdSkipPrevious fontSize='24px' />} aria-label='Previous' />
								<IconButton
									icon={
										mediaControls?.isPlaying || mediaControls?.isLoading ? (
											<MdPause fontSize='26px' />
										) : (
											<MdPlayArrow fontSize='26px' />
										)
									}
									size='lg'
									isDisabled={mediaControls?.isLoading}
									onClick={() =>
										setMediaControls({
											...(mediaControls ?? defaultMediaControls),
											isPlaying: !mediaControls?.isPlaying
										})
									}
									aria-label='Play'
								/>
								<IconButton icon={<MdSkipNext fontSize='24px' />} aria-label='Next' />
								<Spacer />
							</Flex>
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
								onCanPlayThrough={() => {
									setMediaControls({
										...(mediaControls ?? defaultMediaControls),
										isLoading: false,
										isPlaying: true
									});
								}}
							/>
							<Hide below='sm'>
								<Spacer />
								<Flex gap='10px' alignItems='center'>
									<Flex w='200px' gap='20px'>
										<Slider
											aria-label='volume'
											colorScheme='gray'
											defaultValue={(mediaControls?.volume ?? 100) * 100}
											onChange={handleVolumeChange}
											value={mediaControls?.isMuted ? 0 : (mediaControls?.volume ?? 100) * 100}
										>
											<SliderTrack>
												<SliderFilledTrack />
											</SliderTrack>
											<SliderThumb />
										</Slider>
										<IconButton
											icon={
												mediaControls?.isMuted ? (
													<MdVolumeOff fontSize='24px' />
												) : (
													<MdVolumeUp fontSize='24px' />
												)
											}
											onClick={() =>
												setMediaControls({
													...(mediaControls ?? defaultMediaControls),
													isMuted: !mediaControls?.isMuted
												})
											}
											aria-label='Volume'
										/>
									</Flex>
									<IconButton
										icon={
											mediaControls?.isLooping ? (
												<MdRepeatOn fontSize='24px' />
											) : (
												<MdRepeat fontSize='24px' />
											)
										}
										aria-label='Toggle Loop'
										onClick={() => toggleLoop()}
									/>
									<IconButton
										icon={<MdDownload fontSize='24px' />}
										aria-label='Download'
										isDisabled={!songURL}
										onClick={() => open(songURL)}
									/>
									<IconButton
										icon={<MdClose fontSize='24px' />}
										aria-label='Close'
										onClick={() => setCurrentSong(null)}
									/>
								</Flex>
							</Hide>
						</Flex>
					</Flex>
				</Box>
			)}
		</AnimatePresence>
	);
});
