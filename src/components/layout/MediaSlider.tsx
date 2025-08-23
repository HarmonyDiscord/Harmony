import { Box, Center, Flex, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { memo, useEffect, useRef, useState } from 'react';
import { BarLoader } from 'react-spinners';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { currentSecondsAtom } from '../../atoms/CurrentSecondsAtom';
import { discordActivityStatusAtom } from '../../atoms/DiscordActivityStatus';
import { mediaControlsAtom } from '../../atoms/MediaControlAtom';
import formatDuration from '../../util/formatDuration';
import { isHostAtom, socket } from '../general/AppFlow';

export default memo(function MediaSlider({ seekTo, isDisabled }: { seekTo: any; isDisabled?: boolean }) {
	const [currentMedia] = useAtom(currentMediaAtom);
	const [mediaControls] = useAtom(mediaControlsAtom);
	const [currentSeconds] = useAtom(currentSecondsAtom);
	const [discordActivityStatus] = useAtom(discordActivityStatusAtom);
	const [isHost] = useAtom(isHostAtom);
	const isDragging = useRef(false);
	const [sliderValue, setSliderValue] = useState(0);
	const [useSliderValue, setUseSliderValue] = useState(false);
	const seekTimeout = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		return () => {
			if (seekTimeout.current) clearTimeout(seekTimeout.current);
		};
	}, []);

	return (
		currentMedia && (
			<Center mt={discordActivityStatus.isOverlay ? '0px' : '5px'} mb='5px' h='16px'>
				<Box w='100%'>
					<AnimatePresence mode='wait'>
						<Flex w='100%' gap='12px'>
							<Text>{formatDuration(currentSeconds) ?? '00:00'}</Text>
							{!mediaControls?.isLoading ? (
								<Slider
									key='slider'
									as={motion.div}
									isReadOnly={!isHost || mediaControls?.isLoading}
									isDisabled={isDisabled}
									value={
										isDragging.current || useSliderValue
											? sliderValue
											: (currentSeconds / currentMedia.duration) * 100
									}
									aria-label='track'
									colorScheme='gray'
									onChange={(v) => {
										if (!isHost) return;
										setSliderValue(v);
									}}
									onChangeStart={() => {
										isDragging.current = true;
									}}
									onChangeEnd={(v) => {
										const currentSecondsValue = (v / 100) * currentMedia.duration;
										seekTo(currentSecondsValue);

										isDragging.current = false;
										setUseSliderValue(true);
										if (seekTimeout.current) clearTimeout(seekTimeout.current);
										seekTimeout.current = setTimeout(() => {
											setUseSliderValue(false);
										}, 1000);
									}}
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
});
