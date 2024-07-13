'use client';

import { Flex, Spacer } from '@chakra-ui/react';
import Controls from '../layout/Controls';
import Navbar from '../layout/Navbar';

export default function IndexScreen() {
	return (
		<Flex w='100%' h='100%' direction='column'>
			<Navbar />
			<Flex w='100%' p='20px'></Flex>
			<Spacer />
			<Controls />
		</Flex>
	);
}
