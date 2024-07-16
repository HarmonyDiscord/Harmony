import {
	Box,
	Center,
	CloseButton,
	Fade,
	Flex,
	SlideFade,
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
import { MdContentCopy } from 'react-icons/md';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { currentPlaylistAtom } from '../../atoms/CurrentPlaylistAtom';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import type { SearchResult } from '../../types/SearchResult';
import ContentItem from '../general/content/ContentItem';
import ContentList from './ContentList';

const Playlist = memo(function Playlist() {
	const [currentPlaylist] = useAtom(currentPlaylistAtom);

	return (
		<Flex
			w='100%'
			h='100%'
			pr='10px'
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
				<SlideFade in delay={i * 0.02} key={media.id + i}>
					<ContentItem item={media} />
				</SlideFade>
			))}
		</Flex>
	);
});

function Lyric({ l }: Readonly<{ l: string }>) {
	const [isHovering, setIsHovering] = useState(false);

	return (
		<Flex
			as={motion.div}
			initial={{
				backgroundColor: '#FFFFFF00'
			}}
			whileHover={{
				backgroundColor: '#FFFFFF10'
			}}
			borderRadius='2px'
			w='fit-content'
			maxW='100%'
			gap='10px'
			px='5px'
			alignItems='center'
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => setIsHovering(false)}
		>
			<Text>{l}</Text>
			<Fade in={isHovering} delay={0.08}>
				<MdContentCopy />
			</Fade>
		</Flex>
	);
}

const Lyrics = memo(function Lyrics({ mediaId }: Readonly<{ mediaId?: string }>) {
	const [lyrics, setLyrics] = useState<string[] | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		async function setup() {
			if (!mediaId) return;

			setIsLoading(true);
			setLyrics(
				await axios
					.get(`/api/content/media/lyrics?id=${encodeURIComponent(mediaId)}`)
					.then((res) => res.data)
					.catch(() => null)
			);
			setIsLoading(false);
		}
		setup();
	}, [mediaId]);

	return (
		<Flex
			w='100%'
			h='100%'
			pr='10px'
			py='10px'
			direction='column'
			overflowY='auto'
			userSelect='text'
			style={{
				mask: 'linear-gradient(to top, transparent 0%, #000000 5%, #000000 95%, transparent 100%)',
				maskMode: 'alpha'
			}}
		>
			{isLoading ? (
				<Center w='100%' h='100%'>
					<Spinner size='xl' />
				</Center>
			) : (
				lyrics?.map((l, i) => <Lyric key={i + '-' + l} l={l} />) ?? <Text>This song does not have lyrics.</Text>
			)}
		</Flex>
	);
});

const Related = memo(function Related({ query }: Readonly<{ query?: string }>) {
	const [related, setRelated] = useState<SearchResult[] | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		async function setup() {
			if (!query) return;

			setIsLoading(true);
			setRelated(
				await axios

					.get(`/api/content/search?q=${encodeURIComponent(query)}`)
					.then((res) => res.data)
					.catch(() => null)
			);
			setIsLoading(false);
		}
		setup();
	}, [query]);

	return (
		<Box
			w='100%'
			h='100%'
			pr='10px'
			py='10px'
			overflowY='auto'
			style={{
				mask: 'linear-gradient(to top, transparent 0%, #000000 5%, #000000 95%, transparent 100%)',
				maskMode: 'alpha'
			}}
		>
			{isLoading ? (
				<Center w='100%' h='100%'>
					<Spinner size='xl' />
				</Center>
			) : related ? (
				<ContentList items={related} />
			) : (
				<Text>Please try again.</Text>
			)}
		</Box>
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
							<TabPanel h='100%' w='100%' pb='40px'>
								<Playlist />
							</TabPanel>
							<TabPanel h='100%' w='100%' pb='40px'>
								<Lyrics mediaId={currentMedia.id} />
							</TabPanel>
							<TabPanel h='100%' w='100%' pb='40px'>
								<Related query={currentMedia.name} />
							</TabPanel>
						</TabPanels>
					</Tabs>
				</Box>
			)}
		</AnimatePresence>
	);
});
