'use client';

import { Box, Fade, ScaleFade } from '@chakra-ui/react';
import ColorThief from 'colorthief';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { loadingAtom } from '../../atoms/LoadingAtom';
import IndexLoadingScreen from '../screens/LoadingScreen';
import AppFlow from './AppFlow';

export default function AppWrapper({ children }: Readonly<{ children: any }>) {
	const [isLoading] = useAtom(loadingAtom);
	const [currentMedia] = useAtom(currentMediaAtom);
	const [colorA, setColorA] = useState('#FF0067');
	const [colorB, setColorB] = useState('#8877FF');
	const [colorC, setColorC] = useState('#FF0000');

	useEffect(() => {
		if (!currentMedia?.thumbnail) {
			setColorA('#FF0067');
			setColorB('#8877FF');
			setColorC('#FF0000');
			return;
		}

		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.src = currentMedia.thumbnail;

		const handleLoad = () => {
			try {
				const colorThief = new ColorThief();
				const palette = colorThief.getPalette(img, 3);

				if (palette && palette.length === 3) {
					const [p0, p1, p2] = palette;

					if (p0 && p1 && p2) {
						setColorA(`rgb(${p0[0]}, ${p0[1]}, ${p0[2]})`);
						setColorB(`rgb(${p1[0]}, ${p1[1]}, ${p1[2]})`);
						setColorC(`rgb(${p2[0]}, ${p2[1]}, ${p2[2]})`);
					}
				}
			} catch (e) {
				setColorA('#FF0067');
				setColorB('#8877FF');
				setColorC('#FF0000');
				console.error('Error extrayendo colores:', e);
			}
		};

		img.addEventListener('load', handleLoad);

		return () => {
			img.removeEventListener('load', handleLoad);
		};
	}, [currentMedia?.thumbnail]);

	return (
		<AppFlow>
			{({ isModalOpen }: { isModalOpen: boolean }) => (
				<Box h='100%' w='100%'>
					<Fade in style={{ zIndex: -1, height: '100%' }}>
						<div
							style={{
								position: 'absolute',
								width: '100vw',
								height: '100vh',
								pointerEvents: 'none',
								overflow: 'hidden'
							}}
						>
							<motion.svg
								preserveAspectRatio='xMidYMid slice'
								width='100%'
								height='100%'
								viewBox='0 0 4852 5922'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
								style={{
									objectFit: 'cover'
								}}
							>
								<g filter='url(#filter0_f_3_44)'>
									<motion.ellipse
										cx='2248.53'
										cy='1988.87'
										rx='856.255'
										ry='628.819'
										transform='rotate(0.675332 2248.53 1988.87)'
										animate={{ fill: colorA }}
										transition={{ duration: 1.5, ease: 'easeInOut' }}
									/>
								</g>
								<g filter='url(#filter1_f_3_44)'>
									<motion.ellipse
										cx='2101.68'
										cy='3142.41'
										rx='407.424'
										ry='299.205'
										transform='rotate(0.675332 2101.68 3142.41)'
										animate={{ fill: colorB }}
										transition={{ duration: 1.5, ease: 'easeInOut' }}
									/>
								</g>
								<g filter='url(#filter2_f_3_44)'>
									<motion.ellipse
										cx='2248.14'
										cy='3829.76'
										rx='945.841'
										ry='655.858'
										transform='rotate(28.4873 2248.14 3829.76)'
										animate={{ fill: colorB }}
										transition={{ duration: 1.5, ease: 'easeInOut' }}
									/>
								</g>
								<g filter='url(#filter3_f_3_44)'>
									<motion.ellipse
										cx='3520.14'
										cy='3724.23'
										rx='424.779'
										ry='645.664'
										animate={{ fill: colorC }}
										transition={{ duration: 1.5, ease: 'easeInOut' }}
									/>
								</g>
								<g filter='url(#filter4_f_3_44)'>
									<motion.ellipse
										cx='3048.92'
										cy='3741.22'
										rx='424.779'
										ry='304.708'
										animate={{ fill: colorA }}
										transition={{ duration: 1.5, ease: 'easeInOut' }}
									/>
								</g>
								<defs>
									<filter
										id='filter0_f_3_44'
										x='33.0073'
										y='0.71759'
										width='4431.04'
										height='3976.3'
										filterUnits='userSpaceOnUse'
										colorInterpolationFilters='sRGB'
									>
										<feFlood floodOpacity='0' result='BackgroundImageFix' />
										<feBlend
											mode='normal'
											in='SourceGraphic'
											in2='BackgroundImageFix'
											result='shape'
										/>
										<feGaussianBlur stdDeviation='679.646' result='effect1_foregroundBlur_3_44' />
									</filter>
									<filter
										id='filter1_f_3_44'
										x='334.98'
										y='1483.9'
										width='3533.41'
										height='3317.03'
										filterUnits='userSpaceOnUse'
										colorInterpolationFilters='sRGB'
									>
										<feFlood floodOpacity='0' result='BackgroundImageFix' />
										<feBlend
											mode='normal'
											in='SourceGraphic'
											in2='BackgroundImageFix'
											result='shape'
										/>
										<feGaussianBlur stdDeviation='679.646' result='effect1_foregroundBlur_3_44' />
									</filter>
									<filter
										id='filter2_f_3_44'
										x='0.379883'
										y='1738.44'
										width='4495.52'
										height='4182.63'
										filterUnits='userSpaceOnUse'
										colorInterpolationFilters='sRGB'
									>
										<feFlood floodOpacity='0' result='BackgroundImageFix' />
										<feBlend
											mode='normal'
											in='SourceGraphic'
											in2='BackgroundImageFix'
											result='shape'
										/>
										<feGaussianBlur stdDeviation='679.646' result='effect1_foregroundBlur_3_44' />
									</filter>
									<filter
										id='filter3_f_3_44'
										x='2189.17'
										y='2172.37'
										width='2661.95'
										height='3103.72'
										filterUnits='userSpaceOnUse'
										colorInterpolationFilters='sRGB'
									>
										<feFlood floodOpacity='0' result='BackgroundImageFix' />
										<feBlend
											mode='normal'
											in='SourceGraphic'
											in2='BackgroundImageFix'
											result='shape'
										/>
										<feGaussianBlur stdDeviation='453.097' result='effect1_foregroundBlur_3_44' />
									</filter>
									<filter
										id='filter4_f_3_44'
										x='1717.95'
										y='2530.32'
										width='2661.95'
										height='2421.81'
										filterUnits='userSpaceOnUse'
										colorInterpolationFilters='sRGB'
									>
										<feFlood floodOpacity='0' result='BackgroundImageFix' />
										<feBlend
											mode='normal'
											in='SourceGraphic'
											in2='BackgroundImageFix'
											result='shape'
										/>
										<feGaussianBlur stdDeviation='453.097' result='effect1_foregroundBlur_3_44' />
									</filter>
								</defs>
							</motion.svg>
						</div>

						<Box
							h='100%'
							w='100%'
							style={{ background: '#00000010' }}
							backgroundSize='cover'
							backgroundRepeat='no-repeat'
							backgroundPosition='center center'
							color='#FFFFFF'
						>
							<Box h='100%' w='100%' style={{ scrollbarGutter: 'stable' }} bg='#00000010'>
								{isLoading ? (
									<IndexLoadingScreen isModalOpen={isModalOpen} />
								) : (
									<ScaleFade
										in={true}
										style={{ height: '100%', width: '100%' }}
										initialScale={0.8}
										transition={{ enter: { duration: 0.3 } }}
									>
										{children}
									</ScaleFade>
								)}
							</Box>
						</Box>
					</Fade>
				</Box>
			)}
		</AppFlow>
	);
}
