'use client';

import '@fontsource/hanken-grotesk';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { Provider as JotaiProvider } from 'jotai';
import AppWrapper from '../components/general/AppWrapper';

const config = {
	initialColorMode: 'dark',
	useSystemColorMode: false
};

const fonts = {
	heading: 'Hanken Grotesk',
	body: 'Hanken Grotesk'
};

const theme = extendTheme({
	config,
	fonts,
	styles: {
		global: () => ({
			body: {
				bg: '#000000'
			}
		})
	},
	shadows: {
		outline: `0 0 0 2px #ffffff10`
	}
});

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang='en'
			style={{
				width: '100%',
				height: '100%',
				scrollBehavior: 'smooth',
				userSelect: 'none',
				WebkitTapHighlightColor: 'transparent',
				overflowX: 'hidden'
			}}
		>
			<head>
				<title>Harmony</title>
				<style>
					{`::-webkit-scrollbar{width:6px;z-index:100000}::-webkit-scrollbar-track{border-radius:10px}::-webkit-scrollbar-track:hover{background-color:#FFFFFF05}::-webkit-scrollbar-thumb{border-radius:10px;background-color:#FFFFFF10}::-webkit-scrollbar-thumb:hover{background-color:#FFFFFF20}`}
				</style>
			</head>
			<body style={{ width: '100%', height: '100%', overflowX: 'hidden' }}>
				<JotaiProvider>
					<ChakraProvider theme={theme}>
						<AppWrapper>{children}</AppWrapper>
					</ChakraProvider>
				</JotaiProvider>
			</body>
		</html>
	);
}
