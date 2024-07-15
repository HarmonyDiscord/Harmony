import {
	Box,
	Center,
	CloseButton,
	Flex,
	Spacer,
	Spinner,
	Tab,
	TabIndicator,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	Text
} from '@chakra-ui/react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { memo, useEffect, useState } from 'react';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { currentPlaylistAtom } from '../../atoms/CurrentPlaylistAtom';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import ContentItem from '../general/content/ContentItem';

const Playlist = memo(function Playlist() {
	const [currentPlaylist] = useAtom(currentPlaylistAtom);

	return (
		<Flex
			w='100%'
			h='100%'
			direction='column'
			overflowY='auto'
			gap='10px'
			style={{
				mask: 'linear-gradient(to top, transparent 0%, #000000 5%, #000000 95%, transparent 100%)',
				maskMode: 'alpha'
			}}
			py='10px'
		>
			{[...Object.values(currentPlaylist)].map((media, i) => (
				<ContentItem item={media} key={media.id + i} />
			))}
		</Flex>
	);
});

const Lyrics = memo(function Lyrics({ songId }: Readonly<{ songId?: string }>) {
	const [lyrics, setLyrics] = useState<null | string[]>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		async function setup() {
			if (!songId) return;

			setIsLoading(true);
			setLyrics(
				await axios
					.get(`/api/content/media/lyrics?id=${encodeURIComponent(songId)}`)
					.then((res) => res.data)
					.catch(() => null)
			);
			setIsLoading(false);
		}
		setup();
	}, [songId]);

	return (
		<Flex
			w='100%'
			h='100%'
			direction='column'
			overflowY='auto'
			userSelect='text'
			style={{
				mask: 'linear-gradient(to top, transparent 0%, #000000 5%, #000000 95%, transparent 100%)',
				maskMode: 'alpha'
			}}
			py='10px'
		>
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
	const [currentMedia] = useAtom(currentMediaAtom);
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);

	return (
		<AnimatePresence mode='popLayout'>
			{currentMedia && !mediaControls?.isSidePanelClosed && (
				<Box
					as={motion.div}
					p='20px'
					pl={['20px', '20px', '10px']}
					h='100%'
					w={['100%', '100%', '500px']}
					minW={['100%', '100%', '500px']}
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
						<TabList w='100%'>
							<Tab>Playlist</Tab>
							<Tab>Lyrics</Tab>
							<Tab>Related</Tab>
							<Spacer />
							<CloseButton
								onClick={() =>
									setMediaControls({
										...(mediaControls ?? defaultMediaControls),
										isSidePanelClosed: true
									})
								}
							/>
						</TabList>
						<TabIndicator mt='2px' px='2px' height='2px' bg='white' borderRadius='1px' />
						<TabPanels h='100%' w='100%'>
							<TabPanel h='100%' w='100%'>
								<Playlist />
							</TabPanel>
							<TabPanel h='100%' w='100%' pb='40px'>
								<Lyrics songId={currentMedia.id} />
							</TabPanel>
							<TabPanel h='100%' w='100%'>
								Working on it!
							</TabPanel>
						</TabPanels>
					</Tabs>
				</Box>
			)}
		</AnimatePresence>
	);
});
