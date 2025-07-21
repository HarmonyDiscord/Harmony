'use client';

import { Box, Center, Stack } from '@chakra-ui/react';
import { BarLoader } from 'react-spinners';
import LogoIcon from '../icons/LogoIcon';

export default function LoadingScreen() {
	return (
		<Center h='100%' w='100%'>
			<Stack alignItems='center'>
				<Box py='20px'>
					<LogoIcon width='auto' height='180px' color='#FFFFFF' />
				</Box>
				<BarLoader
					color='#FFFFFF'
					loading={true}
					width='150px'
					cssOverride={{ borderRadius: '10px' }}
					aria-label='Loading'
				/>
			</Stack>
		</Center>
	);
}
