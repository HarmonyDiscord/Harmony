'use client';

import { loadingAtom } from '@/atoms/LoadingAtom';
import { Box, ScaleFade } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import IndexLoadingScreen from '../screens/LoadingScreen';
import AppFlow from './AppFlow';

export default function AppWrapper({ children }: Readonly<{ children: any }>) {
	const [isLoading] = useAtom(loadingAtom);

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
