import { Box, Flex, Heading, IconButton, Image, Spacer, Text } from '@chakra-ui/react';
import { MdLoop, MdPlayArrow, MdShuffle, MdSkipNext, MdSkipPrevious, MdVolumeUp } from 'react-icons/md';

export default function Controls() {
	return (
		<Box w='100%' p='20px' pt='0px'>
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
						src='https://cdn.discordapp.com/attachments/1245099205337415811/1261445572947345538/image.png?ex=6692fc3d&is=6691aabd&hm=2d336793acf4819c171cad086fe4d4fdf7fa954304efe2c5d6af678eeabc2625&'
						alt='si'
						objectFit='cover'
					/>
					<Flex gap='4px' direction='column'>
						<Heading size='md'>La Mamada</Heading>
						<Text>Mamadas – Leiva</Text>
					</Flex>
				</Flex>
				<Spacer />
				<Flex gap='10px'>
					<IconButton icon={<MdSkipPrevious fontSize='24px' />} aria-label='Previous' />
					<IconButton icon={<MdPlayArrow fontSize='24px' />} aria-label='Play' />
					<IconButton icon={<MdSkipNext fontSize='24px' />} aria-label='Next' />
				</Flex>
				<Spacer />
				<Flex gap='10px'>
					<IconButton icon={<MdVolumeUp fontSize='24px' />} aria-label='Previous' />
					<IconButton icon={<MdLoop fontSize='24px' />} aria-label='Play' />
					<IconButton icon={<MdShuffle fontSize='24px' />} aria-label='Next' />
				</Flex>
			</Flex>
		</Box>
	);
}
