'use client';

import { Box, ScaleFade } from '@chakra-ui/react';
import { useState } from 'react';
import IndexLoadingScreen from '../screens/LoadingScreen';
import AppFlow from './AppFlow';

export default function AppWrapper({ children }: Readonly<{ children: any }>) {
	const [isLoading, setIsLoading] = useState(true);

	return (
		<AppFlow>
			<Box
				h='100%'
				w='100%'
				style={{
					background: 'linear-gradient(90deg, rgba(104,42,107,1) 0%, rgba(131,2,58,1) 100%)'
				}}
				backgroundSize='cover'
				backgroundRepeat='no-repeat'
				backgroundPosition='center center'
				color='#FFFFFF'
			>
				<Box h='100%' w='100%' overflow='auto' style={{ scrollbarGutter: 'stable' }} bg='#00000010'>
					{isLoading ? (
						<IndexLoadingScreen />
					) : (
						<ScaleFade
							in={true}
							style={{ height: '100%', width: '100%' }}
							initialScale={0.8}
							transition={{
								enter: { duration: 0.3 }
							}}
						>
							{children}
						</ScaleFade>
					)}{' '}
				</Box>
			</Box>
		</AppFlow>
	);
}
