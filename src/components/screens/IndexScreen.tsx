'use client';

import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { MdMusicNote } from 'react-icons/md';

export default function IndexScreen() {
	return (
		<Box w='100%' h='100%'>
			<Box w='100%' p='20px' pb='0px'>
				<Flex
					w='100%'
					bg='#FFFFFF10'
					borderRadius='10px'
					p='20px'
					gap='5px'
					zIndex={2}
					backdropFilter='blur(5px)'
				>
					<MdMusicNote fontSize='32px' color='#FFFFFF' />
					<Heading size='md'>Harmony</Heading>
				</Flex>
			</Box>
			<Flex w='100%' p='20px'>
				<Text>Hola</Text>
			</Flex>
		</Box>
	);
}
