import {
	Box,
	Center,
	Flex,
	Heading,
	Hide,
	IconButton,
	Image,
	Slider,
	SliderFilledTrack,
	SliderThumb,
	SliderTrack,
	Spacer,
	Text
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { memo, useEffect, useRef, useState } from 'react';
import {
	MdClose,
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
import { currentSongAtom } from '../../atoms/CurrentSongAtom';
import { defaultSongControls, songControlsAtom } from '../../atoms/SongControlsAtom';
import formatDuration from '../../util/formatDuration';
import axios from 'axios';

export default memo(function Controls() {
	const [currentSong, setCurrentSong] = useAtom(currentSongAtom);
	const [songControls, setSongControls] = useAtom(songControlsAtom);
	const [songURL, setSongURL] = useState<string | undefined>(undefined);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [progress, setProgress] = useState(0);
	const [currentTime, setCurrentTime] = useState('00:00');

	useEffect(() => {
		async function setup() {
			if (!currentSong) return null;

			setProgress(0);

			setSongControls({
				...(songControls ?? defaultSongControls),
				isPlaying: false,
				isLoading: true
			});

			const url = await axios
				.get(`/api/song/url?id=${encodeURIComponent(currentSong.id)}`)
				.then((res) => res.data)
				.catch(() => null);

			setSongURL(url);

			if ('mediaSession' in navigator) {
				navigator.mediaSession.metadata = new MediaMetadata({
					title: currentSong.title,
					artist: currentSong.artist,
					album: currentSong.album,
					artwork: currentSong.cover
						? [
								{
									src: currentSong.cover,
									sizes: '250x250',
									type: 'image/png'
								}
							]
						: []
				});
			}
		}

		setup();
	}, [currentSong]);

	const audio = audioRef.current;

	useEffect(() => {
		if (!audio) return;

		if (songControls?.isPlaying) audio.play().catch(() => null);
		else audio.pause();

		if (songControls?.isMuted) audio.volume = 0;
		else if (songControls?.volume) audio.volume = songControls.volume;
	}, [songControls]);

	const handleTimeUpdate = () => {
		if (!audio) return;
		if (songControls?.isLoading) return;

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
		setSongControls({ ...(songControls ?? defaultSongControls), isMuted: false });
		setSongControls({
			...(songControls ?? defaultSongControls),
			volume: value / 100
		});
	};

	const toggleLoop = () => {
		setSongControls({
			...(songControls ?? defaultSongControls),
			isLooping: !songControls?.isLooping
		});
	};

	return (
		<AnimatePresence mode='popLayout'>
			{currentSong && (
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
									{!songControls?.isLoading ? (
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
											<Text>{formatDuration(currentSong.duration)}</Text>
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
									key={currentSong.id}
									as={motion.div}
									gap='12px'
									alignItems='center'
									initial={{ y: -10, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ y: 10, opacity: 0 }}
								>
									<Image
										width='48px'
										height='48px'
										src={currentSong.cover}
										alt='Song icon'
										objectFit='cover'
										style={{
											borderRadius: '5px'
										}}
									/>
									<Flex gap='4px' direction='column'>
										<Heading size='md'>{currentSong.title}</Heading>
										<Text>
											{currentSong.album} – {currentSong.artist}
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
										songControls?.isPlaying || songControls?.isLoading ? (
											<MdPause fontSize='26px' />
										) : (
											<MdPlayArrow fontSize='26px' />
										)
									}
									size='lg'
									isDisabled={songControls?.isLoading}
									onClick={() =>
										setSongControls({
											...(songControls ?? defaultSongControls),
											isPlaying: !songControls?.isPlaying
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
									setSongControls({
										...(songControls ?? defaultSongControls),
										isPlaying: true
									})
								}
								onPause={() =>
									setSongControls({
										...(songControls ?? defaultSongControls),
										isPlaying: false
									})
								}
								onEnded={() =>
									setSongControls({
										...(songControls ?? defaultSongControls),
										isPlaying: false
									})
								}
								onCanPlayThrough={() => {
									setSongControls({
										...(songControls ?? defaultSongControls),
										isLoading: false
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
											defaultValue={(songControls?.volume ?? 100) * 100}
											onChange={handleVolumeChange}
											value={songControls?.isMuted ? 0 : (songControls?.volume ?? 100) * 100}
										>
											<SliderTrack>
												<SliderFilledTrack />
											</SliderTrack>
											<SliderThumb />
										</Slider>
										<IconButton
											icon={
												songControls?.isMuted ? (
													<MdVolumeOff fontSize='24px' />
												) : (
													<MdVolumeUp fontSize='24px' />
												)
											}
											onClick={() =>
												setSongControls({
													...(songControls ?? defaultSongControls),
													isMuted: !songControls?.isMuted
												})
											}
											aria-label='Volume'
										/>
									</Flex>
									<IconButton
										icon={
											songControls?.isLooping ? (
												<MdRepeatOn fontSize='24px' />
											) : (
												<MdRepeat fontSize='24px' />
											)
										}
										aria-label='Toggle Loop'
										onClick={() => toggleLoop()}
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
