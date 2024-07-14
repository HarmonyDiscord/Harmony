'use client';

import { Box, Fade, ScaleFade } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import Image from 'next/image';
import { useState } from 'react';
import gradient from '../../../public/svg/gradient.svg';
import { loadingAtom } from '../../atoms/LoadingAtom';
import IndexLoadingScreen from '../screens/LoadingScreen';
import AppFlow from './AppFlow';

export default function AppWrapper({ children }: Readonly<{ children: any }>) {
	const [isLoading] = useAtom(loadingAtom);
	const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);

	return (
		<AppFlow>
			<Box h='100%' w='100%'>
				<Fade in={isBackgroundLoaded} style={{ zIndex: -1, height: '100%' }}>
					<Image
						src={gradient}
						alt='Background'
						style={{
							position: 'absolute',
							width: '100vw',
							height: '100vh',
							objectFit: 'cover',
							pointerEvents: 'none'
						}}
						onLoad={() => setIsBackgroundLoaded(true)}
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
						<Box h='100%' w='100%' style={{ scrollbarGutter: 'stable' }} bg='#00000010'>
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
							)}
						</Box>
					</Box>
				</Fade>
			</Box>
		</AppFlow>
	);
}
