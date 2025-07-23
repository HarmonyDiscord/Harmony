'use client';

import { Box, Center, Stack } from '@chakra-ui/react';
import { BarLoader } from 'react-spinners';
import LogoIcon from '../icons/LogoIcon';

export default function LoadingScreen({ isModalOpen }: { isModalOpen?: boolean }) {
	return (
		<Center h='100%' w='100%'>
			<Stack alignItems='center'>
				{!isModalOpen && (
					<>
						<Box pb='15px' pt='25px'>
							<LogoIcon width='auto' height='160px' color='#FFFFFF' />
						</Box>
						<BarLoader
							color='#FFFFFF'
							loading={true}
							width='150px'
							cssOverride={{ borderRadius: '10px' }}
							aria-label='Loading'
						/>
					</>
				)}
			</Stack>
		</Center>
	);
}
