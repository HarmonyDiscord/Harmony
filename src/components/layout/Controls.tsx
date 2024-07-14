import { Box, Flex, Heading, Hide, IconButton, Image, Spacer, Text } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { MdClose, MdLoop, MdPause, MdPlayArrow, MdSkipNext, MdSkipPrevious, MdVolumeUp } from 'react-icons/md';
import getSongURL from '../../app/actions/getSongURL';
import { currentSongAtom } from '../../atoms/CurrentSongAtom';
import { defaultSongControls, songControlsAtom } from '../../atoms/SongControlsAtom';

export default function Controls() {
	const [currentSong, setCurrentSong] = useAtom(currentSongAtom);
	const [songControls, setSongControls] = useAtom(songControlsAtom);
	const [songURL, setSongURL] = useState<string | undefined>(undefined);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		async function setup() {
			if (!currentSong) return null;

			setSongControls({
				...(songControls ?? defaultSongControls),
				isPlaying: false,
				isLoading: true
			});

			const url = await getSongURL(currentSong.id);
			
			setSongURL(url);
			setSongControls({
				...(songControls ?? defaultSongControls),
				isPlaying: true,
				isLoading: false
			});
		}

		setup();
	}, [currentSong]);

	const audio = audioRef.current;

	useEffect(() => {
		if (!audio) return;

		if (songControls?.isPlaying) audio.play();
		else audio.pause();

		if (songControls?.volume) audio.volume = songControls.volume;
	}, [songControls]);
	/*
	const handleTimeUpdate = () => {
		setCurrentTime(audioRef.current.currentTime);
	};

	const handleLoadedMetadata = () => {
		setDuration(audioRef.current.duration);
	};

	const handleSeekChange = (e) => {
		audioRef.current.currentTime = e.target.value;
		setCurrentTime(e.target.value);
	};*/

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
									alt='si'
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
						<Flex gap='10px' w='100%' position={['relative', 'relative', 'absolute']}>
							<Spacer />
							<IconButton icon={<MdSkipPrevious fontSize='24px' />} aria-label='Previous' />
							<IconButton
								icon={
									songControls?.isPlaying ? (
										<MdPause fontSize='24px' />
									) : (
										<MdPlayArrow fontSize='24px' />
									)
								}
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
							autoPlay
							key={songURL}
							ref={audioRef}
						/*	onTimeUpdate={handleTimeUpdate}
							onLoadedMetadata={handleLoadedMetadata}*/
						>
							{songURL && <source src={songURL} type='audio/mpeg' />}
						</audio>
						<Hide below='sm'>
							<Spacer />
							<Flex gap='10px'>
								<IconButton icon={<MdVolumeUp fontSize='24px' />} aria-label='Previous' />
								<IconButton icon={<MdLoop fontSize='24px' />} aria-label='Play' />
								<IconButton
									icon={<MdClose fontSize='24px' />}
									aria-label='Close'
									onClick={() => setCurrentSong(null)}
								/>
							</Flex>
						</Hide>
					</Flex>
				</Box>
			)}
		</AnimatePresence>
	);
}
