'use client';

import { Flex, Spacer } from '@chakra-ui/react';
import Navbar from '../layout/Navbar';
import Controls from '../layout/Controls';

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