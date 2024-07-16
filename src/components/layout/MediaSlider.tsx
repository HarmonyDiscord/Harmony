import { Box, Center, Flex, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text } from '@chakra-ui/react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { BarLoader } from 'react-spinners';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { discordActivityStatusAtom } from '../../atoms/DiscordActivityStatus';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import { type CobaltResponse } from '../../types/Cobalt';
import formatDuration from '../../util/formatDuration';

export default function MediaSlider() {
	const [currentMedia] = useAtom(currentMediaAtom);
	const [progress, setProgress] = useState(0);
	const [currentTime, setCurrentTime] = useState('00:00');
	const [mediaControls] = useAtom(mediaControlsAtom);

	useEffect(() => {
		if (!currentMedia) return;

		setProgress((mediaControls?.progress.played ?? 0) * 100);
		setCurrentTime(formatDuration(mediaControls?.progress.playedSeconds ?? 0));
	}, [mediaControls?.progress]);

	const handleProgressChange = (value: number) => {
		mediaControls?.seekTo(value / 100);
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
			</Center>
		)
	);
}
