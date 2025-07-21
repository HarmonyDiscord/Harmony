import { discordActivityStatusAtom } from '@/atoms/DiscordActivityStatus';
import { Box, Center, Flex, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { BarLoader } from 'react-spinners';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { currentSecondsAtom } from '../../atoms/CurrentSecondsAtom';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import formatDuration from '../../util/formatDuration';

export default function MediaSlider({ seekTo }: { seekTo: any }) {
	const [currentMedia] = useAtom(currentMediaAtom);
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);
	const [currentSeconds, setCurrentSeconds] = useAtom(currentSecondsAtom);
	const [discordActivityStatus] = useAtom(discordActivityStatusAtom);

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
									isReadOnly={mediaControls?.isLoading}
									value={((currentSeconds ?? 0) / currentMedia.duration) * 100}
									aria-label='track'
									colorScheme='gray'
									onChange={(v) => {
										setMediaControls({
											...(mediaControls ?? defaultMediaControls),
											isPlaying: false
										});

										setCurrentSeconds((v / 100) * currentMedia.duration);
										seekTo(v / 100);
									}}
									onChangeEnd={(v) => {
										setMediaControls({
											...(mediaControls ?? defaultMediaControls),
											isPlaying: true
										});
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
}
