'use client';

import { Box, ScaleFade } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { loadingAtom } from '../../atoms/LoadingAtom';
import IndexLoadingScreen from '../screens/LoadingScreen';
import AppFlow from './AppFlow';
import gradient from '../../../public/svg/gradient.svg';
import Image from 'next/image';

export default function AppWrapper({ children }: Readonly<{ children: any }>) {
	const [isLoading] = useAtom(loadingAtom);

	return (
		<AppFlow>
			<Box h='100%' w='100%'>
				<Image
					src={gradient}
					alt='Larva fresca'
					style={{
						position: 'absolute',
						width: '100vw',
						height: '100vh',
						objectFit: 'cover',
						pointerEvents: 'none',
						zIndex: -1
					}}
				/>
				<Box
					h='100%'
					w='100%'
					style={{
						background: '#00000010'
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
			</Box>
		</AppFlow>
	);
}
