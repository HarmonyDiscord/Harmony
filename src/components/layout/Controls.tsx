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
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import Image from 'next/image';
import { memo, useState } from 'react';
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
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { currentPlaylistAtom } from '../../atoms/CurrentPlaylistAtom';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import VideoSlider from './VideoSlider';

export default memo(function Controls() {
	const [currentPlaylist] = useAtom(currentPlaylistAtom);
	const [currentMedia, setCurrentSong] = useAtom(currentMediaAtom);
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);
	const [songURL, setSongURL] = useState<string | undefined>(undefined);

	const currentPlaylistIdArray = [...Object.keys(currentPlaylist)];

	const currentMediaIndex = currentMedia && currentPlaylistIdArray.indexOf(currentMedia.id);

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
						<VideoSlider songURL={songURL} setSongURL={setSongURL} />
						<Flex
							w='100%'
							bg='#FFFFFF10'
							borderRadius='10px'
							p='10px'
							pr='20px'
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
										width={60}
										height={60}
										src={currentMedia.thumbnail ?? ''}
										alt={currentMedia.name}
										objectFit='cover'
										style={{
											borderRadius: '5px'
										}}
									/>
									<Flex gap='4px' direction='column'>
										<Heading size='md'>{currentMedia.name}</Heading>
										<Text>
											{currentMedia.album?.name} - {currentMedia.artist.name}
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
								<IconButton
									icon={<MdSkipPrevious fontSize='24px' />}
									aria-label='Previous'
									isDisabled={!currentPlaylistIdArray[currentMediaIndex! - 1]}
								/>
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
								<IconButton
									icon={<MdSkipNext fontSize='24px' />}
									aria-label='Next'
									isDisabled={!currentPlaylistIdArray[currentMediaIndex! + 1]}
								/>
								<Spacer />
							</Flex>
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
