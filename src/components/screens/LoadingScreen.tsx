'use client';

import { Center, Stack } from '@chakra-ui/react';
import { MdMusicNote } from 'react-icons/md';
import { BarLoader } from 'react-spinners';

export default function LoadingScreen() {
	return (
		<Center h='100%' w='100%'>
			<Stack alignItems='center'>
				<MdMusicNote fontSize='200px' color='#FFFFFF'/>
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
