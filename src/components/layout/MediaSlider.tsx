import {
	Box,
	Center,
	Flex,
	Progress,
	Slider,
	SliderFilledTrack,
	SliderThumb,
	SliderTrack,
	Text
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { type RefObject, useEffect, useState } from 'react';
import type ReactPlayer from 'react-player';
import { BarLoader } from 'react-spinners';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { mediaControlsAtom } from '../../atoms/MediaControlAtom';
import formatDuration from '../../util/formatDuration';

export default function MediaSlider({
	progress,
	loadProgress,
	playerRef
}: { progress: number; loadProgress: number; playerRef: RefObject<ReactPlayer> }) {
	const [currentMedia] = useAtom(currentMediaAtom);
	const [mediaControls] = useAtom(mediaControlsAtom);

	return (
		currentMedia && (
			<Center my='5px' h='16px'>
				<Box w='100%'>
					<AnimatePresence mode='wait'>
						{!mediaControls?.isLoading ? (
							<Flex w='100%' gap='12px'>
								<Text>{formatDuration(currentMedia.duration * progress)}</Text>
								<Slider
									key='slider'
									as={motion.div}
									isReadOnly={mediaControls?.isWaiting}
									aria-label='track'
									colorScheme='gray'
									value={(progress ?? 0) * 100}
									onChange={(v) => {
										playerRef.current?.seekTo(v / 100, 'fraction');
									}}
									focusThumbOnChange={false}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1, transition: { duration: 0.1 } }}
									exit={{ opacity: 0, transition: { duration: 0.1 } }}
								>
									<SliderTrack bg='transparent'>
										<SliderFilledTrack />
										<Progress
											value={(loadProgress ?? 0) * 100}
											w='100%'
											size='xs'
											colorScheme='whiteAlpha'
										/>
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
