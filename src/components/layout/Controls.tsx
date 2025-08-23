import {
	Box,
	Flex,
	Heading,
	Hide,
	IconButton,
	Slider,
	SliderFilledTrack,
	SliderThumb,
	SliderTrack,
	Spacer,
	Spinner,
	Text
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import Image from 'next/image';
import { memo, useEffect, useRef } from 'react';
import {
	MdClose,
	MdDownload,
	MdFavoriteBorder,
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
import { discordActivityStatusAtom } from '../../atoms/DiscordActivityStatus';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import { isHostAtom } from '../general/AppFlow';
import MediaPlayer from '../general/MediaPlayer';
import FullLogoIcon from '../icons/FullLogoIcon';

export default memo(function Controls() {
	const [currentPlaylist] = useAtom(currentPlaylistAtom);
	const [currentMedia, setCurrentMedia] = useAtom(currentMediaAtom);
	const [discordActivityStatus] = useAtom(discordActivityStatusAtom);
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);
	const [isHost] = useAtom(isHostAtom);
	const ref = useRef<HTMLImageElement>(null);

	const currentPlaylistIdArray = [...Object.keys(currentPlaylist)];

	const currentMediaIndex = currentMedia && currentPlaylistIdArray.indexOf(currentMedia.id);

	const handleVolumeChange = (value: number) => {
		setMediaControls({
			...(mediaControls ?? defaultMediaControls),
			isMuted: false
		});
		setMediaControls({
			...(mediaControls ?? defaultMediaControls),
			volume: value / 100
		});
	};

	return (
		<AnimatePresence mode='popLayout'>
			{currentMedia && (
				<Box
					as={motion.div}
					w='100%'
					p={discordActivityStatus.isOverlay ? '15px' : '20px'}
					pt='0px'
					initial={{ y: 10, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: 10, opacity: 0 }}
				>
					<Flex w='100%' h='100%' direction='column' gap='10px'>
						{discordActivityStatus.isOverlay && (
							<Box pb='0px'>
								<FullLogoIcon width='auto' height='22px' color='#FFFFFF' />
							</Box>
						)}
						<MediaPlayer />
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
									w={discordActivityStatus.isOverlay ? '100%' : undefined}
									key={currentMedia.id}
									as={motion.div}
									gap='12px'
									alignItems='center'
									initial={{ y: -10, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ y: 10, opacity: 0 }}
								>
									<Image
										ref={ref}
										width={60}
										height={60}
										src={currentMedia.thumbnail ?? ''}
										alt=' '
										objectFit='cover'
										style={{
											borderRadius: '5px'
										}}
										referrerPolicy='no-referrer'
										unoptimized={!discordActivityStatus.isActivity}
									/>
									<Flex gap='4px' direction='column'>
										<Heading size={discordActivityStatus.isOverlay ? 'xs' : 'md'}>
											{currentMedia.name}
										</Heading>
										<Text fontSize={discordActivityStatus.isOverlay ? 'sm' : undefined}>
											{currentMedia.album && `${currentMedia.album.name} - `}
											{currentMedia.artist.name}
										</Text>
									</Flex>
									{!discordActivityStatus.isOverlay && (
										<IconButton icon={<MdFavoriteBorder fontSize='24px' />} aria-label='Favorite' />
									)}
									{discordActivityStatus.isOverlay && <Spacer />}
								</Flex>
							</AnimatePresence>
							{!discordActivityStatus.isOverlay && (
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
										isDisabled={!isHost || !currentPlaylistIdArray[currentMediaIndex! - 1]}
										onClick={() => {
											const prevId = currentPlaylistIdArray[currentMediaIndex! - 1];
											if (prevId) {
												const prevMedia = currentPlaylist[prevId];
												if (prevMedia) setCurrentMedia(prevMedia);
											}
										}}
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
										isDisabled={!isHost || mediaControls?.isLoading}
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
										isDisabled={!isHost || !currentPlaylistIdArray[currentMediaIndex! + 1]}
										onClick={() => {
											const nextId = currentPlaylistIdArray[currentMediaIndex! + 1];
											if (nextId) {
												const nextMedia = currentPlaylist[nextId];
												if (nextMedia) setCurrentMedia(nextMedia);
											}
										}}
									/>
									<Spacer />
								</Flex>
							)}
							<Hide below='sm'>
								<Spacer />
								<AnimatePresence>
									{mediaControls?.isBuffering && (
										<Box
											as={motion.div}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
										>
											<Spinner size='md' borderWidth='3px' />
										</Box>
									)}
								</AnimatePresence>
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
										onClick={() =>
											setMediaControls({
												...(mediaControls ?? defaultMediaControls),
												isLooping: !mediaControls?.isLooping
											})
										}
										isDisabled={!isHost}
									/>
									<IconButton
										icon={<MdDownload fontSize='24px' />}
										aria-label='Download'
										onClick={async () => {
											const url = `https://harmony-streaming.tnfangel.com/stream?dl=1&videoURL=https://www.youtube.com/watch?v=${encodeURIComponent(currentMedia.id)}`;
											if (typeof window !== 'undefined' && window.discordSDK) {
												window.discordSDK.commands.openExternalLink({ url });
											} else {
												open(url);
											}
										}}
									/>
									<IconButton
										icon={<MdClose fontSize='24px' />}
										aria-label='Close'
										onClick={() => setCurrentMedia(null)}
										isDisabled={!isHost}
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
