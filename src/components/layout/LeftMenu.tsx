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
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { memo, useEffect, useRef, useState } from 'react';
import { MdContentCopy } from 'react-icons/md';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { currentPlaylistAtom } from '../../atoms/CurrentPlaylistAtom';
import { currentSecondsAtom } from '../../atoms/CurrentSecondsAtom';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import type { SearchResult } from '../../types/SearchResult';
import { api } from '../../util/api';
import { isHostAtom } from '../general/AppFlow';
import ContentItem from '../general/content/ContentItem';
import LogoIcon from '../icons/LogoIcon';
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
			gap='20px'
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

function Lyric({ l, timestamp }: Readonly<{ l: string; timestamp?: number }>) {
	const [isHovering, setIsHovering] = useState(false);
	const [isHost] = useAtom(isHostAtom);

	const handleClick = () => {
		if (!isHost) return;
		if (timestamp !== undefined) {
			window.dispatchEvent(new CustomEvent('harmony-seek', { detail: { seconds: timestamp } }));
		}
	};

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
			w='100%'
			maxW='100%'
			gap='10px'
			px='5px'
			alignItems='center'
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => setIsHovering(false)}
			onClick={handleClick}
			cursor={timestamp !== undefined && isHost ? 'pointer' : 'default'}
		>
			<Text w='100%' wordBreak='break-word' overflowWrap='break-word' whiteSpace='pre-wrap' maxW='100%' mr='6px'>
				{l}
			</Text>
			<Fade in={isHovering} delay={0.08}>
				<MdContentCopy />
			</Fade>
		</Flex>
	);
}

interface SyncedLyric {
	timestamp: number;
	text: string;
	nextTimestamp?: number;
}

function parseSyncedLyrics(lyrics: string[]): SyncedLyric[] {
	return lyrics
		.map((line, index) => {
			const match = line.match(/^\[(\d{2}):(\d{2})\.(\d{2})\]\s*(.+)$/);
			if (match && match[1] && match[2] && match[3] && match[4]) {
				const [, minutes, seconds, centiseconds, text] = match;
				const timestamp = parseInt(minutes) * 60 + parseInt(seconds) + parseInt(centiseconds) / 100;
				return { timestamp, text };
			}
			return null;
		})
		.filter((lyric): lyric is SyncedLyric => lyric !== null)
		.sort((a, b) => a.timestamp - b.timestamp)
		.map((lyric, index, array) => ({
			...lyric,
			nextTimestamp: array[index + 1]?.timestamp
		}));
}

const SyncedLyrics = memo(function SyncedLyrics({
	lyrics,
	currentMedia
}: Readonly<{ lyrics: SyncedLyric[]; currentMedia: any }>) {
	const [currentSeconds] = useAtom(currentSecondsAtom);
	const [currentLineIndex, setCurrentLineIndex] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);
	const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
	const [isHost] = useAtom(isHostAtom);

	const handleLyricClick = (timestamp: number) => {
		if (!isHost) return;
		window.dispatchEvent(new CustomEvent('harmony-seek', { detail: { seconds: timestamp } }));
	};

	const isBlank = (text: string) =>
		text === undefined ||
		text === null ||
		text.split('').length === 0 ||
		text.replace(/[\s\u00A0\u1680\u180E\u2000-\u200D\u202F\u205F\u3000\uFEFF]/g, '') === '';

	useEffect(() => {
		if (lyrics.length === 0) return;

		let newIndex = -1;
		for (let i = 0; i < lyrics.length; i++) {
			const lyric = lyrics[i];
			if (lyric && currentSeconds >= lyric.timestamp) {
				newIndex = i;
			} else {
				break;
			}
		}

		if (newIndex >= 0) {
			const lastLyric = lyrics[newIndex];
			if (lastLyric && lastLyric.nextTimestamp && currentSeconds >= lastLyric.nextTimestamp) {
				newIndex = -1;
			}
		}

		if (newIndex !== currentLineIndex) {
			setCurrentLineIndex(newIndex);
		}
	}, [currentSeconds, lyrics, currentLineIndex]);

	const smoothScrollTo = (container: HTMLDivElement, targetScrollTop: number) => {
		const startScrollTop = container.scrollTop;
		const distance = targetScrollTop - startScrollTop;
		const duration = 500;
		let startTime: number | null = null;

		const animateScroll = (currentTime: number) => {
			if (startTime === null) startTime = currentTime;
			const timeElapsed = currentTime - startTime;
			const progress = Math.min(timeElapsed / duration, 1);

			const easeOutQuart = 1 - Math.pow(1 - progress, 4);

			container.scrollTop = startScrollTop + distance * easeOutQuart;

			if (progress < 1) {
				requestAnimationFrame(animateScroll);
			}
		};

		requestAnimationFrame(animateScroll);
	};

	useEffect(() => {
		if (containerRef.current && lineRefs.current[currentLineIndex]) {
			const container = containerRef.current;
			const currentLine = lineRefs.current[currentLineIndex];

			if (currentLine) {
				const containerHeight = container.clientHeight;
				const lineTop = currentLine.offsetTop;
				const lineHeight = currentLine.clientHeight;

				const targetScrollTop = lineTop - containerHeight / 2 + lineHeight / 2;

				smoothScrollTo(container, Math.max(0, targetScrollTop));
			}
		}
	}, [currentLineIndex]);

	const getCharacterHighlightProgress = (lyric: SyncedLyric, charIndex: number, totalChars: number) => {
		if (currentSeconds < lyric.timestamp) return 0;

		const nextTime = lyric.nextTimestamp ?? (currentMedia?.duration || 2);
		const lineDuration = nextTime - lyric.timestamp;
		const timeInLine = currentSeconds - lyric.timestamp;
		const progress = Math.min(timeInLine / lineDuration, 1);

		const charProgress = (progress * totalChars - charIndex) / 1;
		return Math.max(0, Math.min(1, charProgress));
	};

	return (
		<Flex
			ref={containerRef}
			w='100%'
			h='100%'
			pr='10px'
			py='10px'
			direction='column'
			overflowY='auto'
			overflowX='hidden'
			userSelect='text'
			style={{
				mask: 'linear-gradient(to top, transparent 0%, #000000 5%, #000000 95%, transparent 100%)',
				maskMode: 'alpha'
			}}
		>
			<Box h='50vh' />

			{lyrics.map((lyric, index) => {
				const isActive = currentLineIndex >= 0 && index === currentLineIndex;
				const isPast = currentLineIndex >= 0 && index < currentLineIndex;
				const isFuture = currentLineIndex < 0 || index > currentLineIndex;

				return (
					<motion.div
						ref={(el) => {
							lineRefs.current[index] = el as HTMLDivElement | null;
						}}
						key={`${index}-${lyric.text}`}
						initial={{ opacity: 0, y: 20 }}
						animate={{
							opacity: isActive ? 1 : isPast ? 0.6 : 0.3,
							y: 0,
							scaleY: isActive ? 1.06 : 1,
							color: isActive ? '#FFFFFF' : isPast ? '#CCCCCC' : '#888888'
						}}
						transition={{
							duration: 0.3,
							ease: 'easeOut'
						}}
						style={{
							transformOrigin: 'left center',
							width: '100%'
						}}
					>
						<Box
							position='relative'
							py='8px'
							px='5px'
							borderRadius='4px'
							bg={isActive ? '#FFFFFF20' : 'transparent'}
							backdropFilter={isActive ? 'blur(10px)' : 'none'}
							transition='all 0.3s ease'
							overflow='hidden'
							cursor={isHost ? 'pointer' : 'default'}
							onClick={() => handleLyricClick(lyric.timestamp)}
							_hover={{
								bg: isActive ? '#FFFFFF30' : '#FFFFFF10'
							}}
						>
							{isActive && isBlank(lyric.text) ? (
								<Fade in unmountOnExit>
									<Center py='4px'>
										<LogoIcon width='auto' height='20px' color='#FFFFFF' />
									</Center>
								</Fade>
							) : (
								<Text
									fontSize={isActive ? '18px' : '16px'}
									fontWeight={isActive ? 'bold' : 'normal'}
									wordBreak='break-word'
									overflowWrap='break-word'
									whiteSpace='pre-wrap'
									maxW='100%'
									w='100%'
									mr='6px'
									position='relative'
									zIndex={2}
								>
									{lyric.text}
								</Text>
							)}
							{isActive &&
								(() => {
									const nextTime = lyric.nextTimestamp ?? (currentMedia?.duration || 2);
									const duration = nextTime - lyric.timestamp;
									const rawProgress = (currentSeconds - lyric.timestamp) / duration;
									const progress = Math.max(0, Math.min(1, rawProgress));
									const percent = progress * 100;
									const fadeWidth = 2;
									const leftFade = Math.max(0, percent - fadeWidth);
									const rightFade = Math.min(100, percent + fadeWidth);
									return (
										<Box
											position='absolute'
											top='0'
											left='0'
											h='100%'
											bg={`linear-gradient(90deg, #FFFFFF00 0%, #FFFFFF40 ${leftFade}%, #FFFFFF30 ${percent}%, #FFFFFF00 ${rightFade}%, #FFFFFF00 100%)`}
											transition='background 0.1s linear'
											width='100%'
											zIndex={1}
										/>
									);
								})()}
						</Box>
					</motion.div>
				);
			})}

			<Box h='50vh' />
		</Flex>
	);
});

const Lyrics = memo(function Lyrics({
	mediaId,
	mediaName,
	mediaArtist
}: Readonly<{ mediaId?: string; mediaName?: string; mediaArtist?: string }>) {
	const [lyricsRes, setLyricsRes] = useState<{
		lyrics: string[];
		type: 'synced' | 'plain';
	} | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [currentMedia] = useAtom(currentMediaAtom);

	useEffect(() => {
		async function lyricsSetup() {
			if (!mediaId) return;
			setIsLoading(true);
			const result = await api.content.lyrics(mediaId, mediaName || undefined, mediaArtist || undefined);
			setLyricsRes(result);
			setIsLoading(false);
		}
		lyricsSetup();
	}, [mediaId, mediaName, mediaArtist]);

	if (isLoading) {
		return (
			<Center w='100%' h='100%'>
				<Spinner size='xl' />
			</Center>
		);
	}

	if (!lyricsRes?.lyrics) {
		return (
			<Center w='100%' h='100%'>
				<Text>This song does not have lyrics.</Text>
			</Center>
		);
	}

	if (lyricsRes.type === 'synced') {
		const syncedLyrics = parseSyncedLyrics(lyricsRes.lyrics);
		if (syncedLyrics.length > 0) {
			return <SyncedLyrics lyrics={syncedLyrics} currentMedia={currentMedia} />;
		}
	}

	// For plain lyrics, estimate timestamps based on line position and song duration
	const estimatedTimestamps = lyricsRes.lyrics.map((_, index) => {
		if (!currentMedia?.duration) return undefined;
		const totalLines = lyricsRes.lyrics.length;
		return (index / totalLines) * currentMedia.duration;
	});

	return (
		<Flex
			w='100%'
			h='100%'
			pr='10px'
			py='10px'
			direction='column'
			overflowY='auto'
			overflowX='hidden'
			userSelect='text'
			style={{
				mask: 'linear-gradient(to top, transparent 0%, #000000 5%, #000000 95%, transparent 100%)',
				maskMode: 'alpha'
			}}
		>
			{lyricsRes.lyrics.map((l, i) => (
				<Lyric key={i + '-' + l} l={l} timestamp={estimatedTimestamps[i]} />
			))}
		</Flex>
	);
});

const Related = memo(function Related({ query }: Readonly<{ query?: string }>) {
	const [related, setRelated] = useState<SearchResult[] | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		async function relatedSetup() {
			if (!query) return;
			setIsLoading(true);
			setRelated(await api.content.search(query));
			setIsLoading(false);
		}
		relatedSetup();
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
	const [currentPlaylist] = useAtom(currentPlaylistAtom);
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);

	return (
		<AnimatePresence mode='popLayout'>
			{(Object.keys(currentPlaylist).length > 0 || currentMedia) && !mediaControls?.isSidePanelClosed && (
				<Box
					as={motion.div}
					p='20px'
					pb='10px'
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
							<Tab isDisabled={Object.keys(currentPlaylist).length === 0}>Playlist</Tab>
							<Tab isDisabled={!currentMedia}>Lyrics</Tab>
							<Tab isDisabled={!currentMedia}>Related</Tab>
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
								{currentMedia ? (
									<Lyrics
										mediaId={currentMedia.id}
										mediaName={currentMedia.name}
										mediaArtist={currentMedia.artist.name}
									/>
								) : (
									<Text>Select a song to view lyrics.</Text>
								)}
							</TabPanel>
							<TabPanel h='100%' w='100%' pb='40px'>
								{currentMedia ? (
									<Related query={currentMedia.name} />
								) : (
									<Text>Select a song to view related songs.</Text>
								)}
							</TabPanel>
						</TabPanels>
					</Tabs>
				</Box>
			)}
		</AnimatePresence>
	);
});
