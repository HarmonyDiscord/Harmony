import { Box, Center, Flex, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { BarLoader } from 'react-spinners';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import formatDuration from '../../util/formatDuration';
import { mediaControlsAtom } from '../../atoms/MediaControlAtom';
import MediaController from '../general/MediaController';
import type ReactPlayer from 'react-player';

export default function MediaSlider({
	songURL,
	setSongURL
}: {
	songURL?: string;
	setSongURL: any;
}) {
	const playerRef = useRef<ReactPlayer>(null);
	const [currentMedia] = useAtom(currentMediaAtom);
	const [mediaControls] = useAtom(mediaControlsAtom);
	const [progress, setProgress] = useState(0);
	const [currentTime, setCurrentTime] = useState('00:00');

	useEffect(() => {
		if (!currentMedia) return;

		setCurrentTime(formatDuration(currentMedia.duration * progress));
	}, [progress]);

	return (
		currentMedia && (
			<Center my='5px' h='16px'>
				<Box w='100%'>
					<AnimatePresence mode='wait'>
						{!mediaControls?.isLoading ? (
							<Flex w='100%' gap='12px'>
								<Text>{currentTime}</Text>
								<Slider
									key='slider'
									as={motion.div}
									isReadOnly={mediaControls?.isWaiting}
									aria-label='track'
									colorScheme='gray'
									value={(progress ?? 0) * 100}
									onChange={(v) => playerRef.current?.seekTo(v / 100, 'fraction')}
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
				<MediaController
					songURL={songURL}
					setSongURL={setSongURL}
					setProgress={setProgress}
					playerRef={playerRef}
				/>
			</Center>
		)
	);
}
