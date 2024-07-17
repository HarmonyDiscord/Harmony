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
import { type RefObject, useEffect, useRef, useState } from 'react';
import type ReactPlayer from 'react-player';
import { BarLoader } from 'react-spinners';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import formatDuration from '../../util/formatDuration';

export default function MediaSlider({
	seconds,
	loadSeconds,
	seekTo,
	isBuffering
}: { seconds: number; loadSeconds: number; seekTo: any; isBuffering: boolean }) {
	const [currentMedia] = useAtom(currentMediaAtom);
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);

	const loadingTimeout = useRef<Timer | null>(null);
	const bufferingTooLong = useRef(false);

	const [showLoadingBar, setShowLoadingBar] = useState(mediaControls?.isLoading || bufferingTooLong);

	useEffect(() => {
		console.log('MediaSlider', mediaControls?.isLoading, bufferingTooLong);
		setShowLoadingBar(mediaControls?.isLoading || bufferingTooLong);
	}, [mediaControls?.isLoading, isBuffering]);

	useEffect(() => {
		if (isBuffering) {
			loadingTimeout.current = setTimeout(() => {
				bufferingTooLong.current = true;
				setMediaControls({
					...(mediaControls ?? defaultMediaControls),
					isLoading: true
				});
			}, 1000);
		} else {
			if (loadingTimeout.current) clearTimeout(loadingTimeout.current);
			bufferingTooLong.current = false;
		}
	}, [isBuffering]);

	return (
		currentMedia && (
			<Center my='5px' h='16px'>
				<Box w='100%'>
					<AnimatePresence mode='wait'>
						<Flex w='100%' gap='12px'>
							<Text>{formatDuration(seconds) ?? '00:00'}</Text>
							{!showLoadingBar ? (
								<Slider
									key='slider'
									as={motion.div}
									isReadOnly={mediaControls?.isLoading}
									aria-label='track'
									colorScheme='gray'
									value={((seconds ?? 0) / currentMedia.duration) * 100}
									onChange={(v) => {
										seekTo(v / 100);
									}}
									focusThumbOnChange={false}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1, transition: { duration: 0.1 } }}
									exit={{ opacity: 0, transition: { duration: 0.1 } }}
								>
									<SliderTrack bg='transparent'>
										<SliderFilledTrack />
										<Progress
											value={((loadSeconds ?? 0) / currentMedia.duration) * 100}
											w='100%'
											size='xs'
											colorScheme='whiteAlpha'
										/>
									</SliderTrack>
									<SliderThumb />
								</Slider>
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
									style={{
										display: 'flex',
										alignItems: 'center'
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
							<Text>{formatDuration(currentMedia.duration) ?? '--:--'}</Text>
						</Flex>
					</AnimatePresence>
				</Box>
			</Center>
		)
	);
}
