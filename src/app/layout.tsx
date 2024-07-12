'use client';

import AppFlow from '@/components/general/AppFlow';
import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react';

const config = {
	initialColorMode: 'dark',
	useSystemColorMode: false
};

const fonts = {};

const theme = extendTheme({
	config,
	fonts,
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
				WebkitTapHighlightColor: 'transparent'
			}}
		>
			<head>
				<title>Harmony</title>

				<style>
					{`::-webkit-scrollbar{width:6px;z-index:100000}::-webkit-scrollbar-track{border-radius:10px}::-webkit-scrollbar-track:hover{background-color:#00000020}::-webkit-scrollbar-thumb{border-radius:10px;background-color:#00000050}::-webkit-scrollbar-thumb:hover{background-color:#00000060}`}
				</style>
			</head>
			<body style={{ width: '100%', height: '100%' }}>
				<ColorModeScript initialColorMode={theme['config'].initialColorMode} />
				<ChakraProvider theme={theme}>
					<CacheProvider>
						<AppFlow>{children}</AppFlow>
					</CacheProvider>
				</ChakraProvider>
			</body>
		</html>
	);
}
