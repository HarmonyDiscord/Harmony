import {
	Tabs,
	Text,
	TabList,
	Tab,
	TabIndicator,
	TabPanels,
	TabPanel,
	Box,
	Flex,
	Spinner,
	Center
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { memo, useEffect, useState } from 'react';
import { currentSongAtom } from '../../atoms/CurrentSongAtom';
import getSongLyrics from 'src/app/actions/getSongLyrics';

const Lyrics = memo(function Lyrics({ songId }: Readonly<{ songId?: string }>) {
	const [lyrics, setLyrics] = useState<null | string[]>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		async function setup() {
			if (!songId) return;

			setIsLoading(true);
			setLyrics(await getSongLyrics(songId));
			setIsLoading(false);
		}
		setup();
	}, [songId]);

	return (
		<Flex w='100%' h='100%' direction='column' overflowY='auto' userSelect='text'>
			{isLoading ? (
				<Center w='100%' h='100%'>
					<Spinner size='xl' />
				</Center>
			) : (
				lyrics?.map((l, i) => <Text key={i + '-' + l}>{l}</Text>) ?? (
					<Text>This song does not have lyrics.</Text>
				)
			)}
		</Flex>
	);
});

export default memo(function LeftMenu() {
	const [currentSong] = useAtom(currentSongAtom);

	return (
		<AnimatePresence mode='popLayout'>
			{currentSong && (
				<Box
					as={motion.div}
					p='20px'
					pl='10px'
					h='100%'
					w='500px'
					minW='500px'
					initial={{ x: 10, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					exit={{ x: 10, opacity: 0 }}
				>
					<Tabs
						isManual
						w='100%'
						h='100%'
						p='10px'
						gap='10px'
						variant='unstyled'
						position='relative'
						bg='#FFFFFF10'
						borderRadius='10px'
						zIndex={2}
						alignItems='center'
						backdropFilter='blur(5px)'
					>
						<TabList>
							<Tab>Playlist</Tab>
							<Tab>Lyrics</Tab>
							<Tab>Related</Tab>
						</TabList>
						<TabIndicator mt='2px' px='2px' height='2px' bg='white' borderRadius='1px' />
						<TabPanels h='100%' w='100%'>
							<TabPanel h='100%' w='100%'>
								<p>one!</p>
							</TabPanel>
							<TabPanel h='100%' w='100%' pb='40px'>
								<Lyrics songId={currentSong.id} />
							</TabPanel>
							<TabPanel h='100%' w='100%'>
								<p>three!</p>
							</TabPanel>
						</TabPanels>
					</Tabs>
				</Box>
			)}
		</AnimatePresence>
	);
});
