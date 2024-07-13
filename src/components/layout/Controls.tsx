import { Box, Flex, Heading, IconButton, Image, Spacer, Text } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { MdClose, MdLoop, MdPlayArrow, MdSkipNext, MdSkipPrevious, MdVolumeUp } from 'react-icons/md';
import { currentSongAtom } from '../../atoms/CurrentSongAtom';
import { AnimatePresence, motion } from 'framer-motion';

export default function Controls() {
	const [currentSong, setCurrentSong] = useAtom(currentSongAtom);

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
						gap='5px'
						zIndex={2}
						alignItems='center'
						backdropFilter='blur(5px)'
					>
						<Flex gap='12px' alignItems='center'>
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
						<Flex gap='10px' w='100%' position='absolute'>
							<Spacer />
							<IconButton icon={<MdSkipPrevious fontSize='24px' />} aria-label='Previous' />
							<IconButton icon={<MdPlayArrow fontSize='24px' />} aria-label='Play' />
							<IconButton icon={<MdSkipNext fontSize='24px' />} aria-label='Next' />
							<Spacer />
						</Flex>
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
					</Flex>
				</Box>
			)}
		</AnimatePresence>
	);
}
