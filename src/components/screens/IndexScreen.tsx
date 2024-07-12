'use client';

import { Box, Flex, Heading, Text } from '@chakra-ui/react';

export default function IndexScreen() {
	return (
		<Box w='100%' h='100%'>
			<Flex w='100%' bg='#00000020' p='10px'>
				<Heading size='md'>Harmony</Heading>
			</Flex>
			<Flex w='100%'>
				<Text>Hola</Text>
			</Flex>
		</Box>
	);
}
