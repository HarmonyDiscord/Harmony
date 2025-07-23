'use client';

import { Box, Center, Flex, Heading, Spacer, Spinner, useBreakpointValue } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { currentContentAtom } from '../../atoms/CurrentContentAtom';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { currentPlaylistAtom } from '../../atoms/CurrentPlaylistAtom';
import { discordActivityStatusAtom } from '../../atoms/DiscordActivityStatus';
import { feedAtom } from '../../atoms/FeedAtom';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import { useDebounce } from '../../hooks/useDebounce';
import type { SearchResult } from '../../types/SearchResult';
import { ContentType } from '../../types/content/ContentType';
import type { Media } from '../../types/content/Media';
import { api } from '../../util/api';
import FullLogoIcon from '../icons/FullLogoIcon';
import ContentList from '../layout/ContentList';
import Controls from '../layout/Controls';
import Feed from '../layout/Feed';
import LeftMenu from '../layout/LeftMenu';
import Navbar from '../layout/Navbar';
import ArtistView from '../views/ArtistView';
import ContentView from '../views/ContentView';

export default function IndexScreen() {
	const [feed] = useAtom(feedAtom);
	const [discordActivityStatus] = useAtom(discordActivityStatusAtom);
	const [searchInput, setSearchInput] = useState<string>('');
	const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
	const [searchMediaResults, setSearchMediaResults] = useState<Media[] | null>(null);
	const [isSearchLoading, setIsSearchLoading] = useState(false);
	const [currentMedia] = useAtom(currentMediaAtom);
	const [currentContent, setCurrentContent] = useAtom(currentContentAtom);
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);
	const [currentPlaylist] = useAtom(currentPlaylistAtom);
	const searchCountRef = useRef(0);
	const debouncedSearchInput = useDebounce(searchInput, 300);

	const isLg = useBreakpointValue([false, false, true]);

	useEffect(() => {
		if (currentContent && !isLg) {
			setMediaControls({
				...(mediaControls ?? defaultMediaControls),
				isSidePanelClosed: true
			});
		}
	}, [currentContent, isLg]);

	useEffect(() => {
		if (debouncedSearchInput && !isLg) {
			setMediaControls({
				...(mediaControls ?? defaultMediaControls),
				isSidePanelClosed: true
			});
		}
	}, [debouncedSearchInput, isLg]);

	useEffect(() => {
		const searchEffect = async () => {
			if (!debouncedSearchInput) {
				setSearchResults(null);
				setSearchMediaResults(null);
				setIsSearchLoading(false);
				return;
			}

			const currentSearchCount = ++searchCountRef.current;

			setIsSearchLoading(true);
			setCurrentContent(null);

			const [results, songs] = await Promise.all([
				api.content.search(debouncedSearchInput),
				api.content.mediaSearch(debouncedSearchInput)
			]);

			if (currentSearchCount === searchCountRef.current) {
				if (!results) {
					setSearchResults(null);
					setSearchMediaResults(null);
				} else {
					setSearchResults(results);
					setSearchMediaResults(songs);
				}

				setIsSearchLoading(false);
			}
		};

		searchEffect();
	}, [debouncedSearchInput]);

	const content = searchResults || feed;

	return (
		<Flex w='100%' h='100%' direction='column' overflow='hidden'>
			<Navbar searchInput={searchInput} setSearchInput={setSearchInput} />
			{!discordActivityStatus.isOverlay && (
				<Flex w='100%' h='100%' maxH='100%' overflow='hidden'>
					{(isLg ||
						(!currentMedia && Object.keys(currentPlaylist).length === 0) ||
						mediaControls?.isSidePanelClosed) &&
						(isSearchLoading ? (
							<Center w='100%' h='100%'>
								<Spinner size='xl' thickness='4px' />
							</Center>
						) : currentContent &&
							(currentContent.type === ContentType.Artist || String(currentContent.type) === 'ARTIST') ? (
							<ArtistView />
						) : currentContent ? (
							<ContentView />
						) : content && content.length > 0 ? (
							searchResults || searchMediaResults ? (
								isLg ? (
									<Flex w='100%'>
										{searchMediaResults && <Feed items={searchMediaResults} />}
										{searchResults && (
											<Box
												p='20px'
												style={{
													mask: 'linear-gradient(to top, transparent 0%, #000000 5%, #000000 95%, transparent 100%)',
													maskMode: 'alpha'
												}}
												overflowY='auto'
											>
												<ContentList items={content} />
											</Box>
										)}
									</Flex>
								) : (
									searchResults && (
										<Box
											p='20px'
											style={{
												mask: 'linear-gradient(to top, transparent 0%, #000000 5%, #000000 95%, transparent 100%)',
												maskMode: 'alpha'
											}}
											overflowY='auto'
										>
											<ContentList items={content} />
										</Box>
									)
								)
							) : (
								feed && <Feed items={feed} />
							)
						) : (
							<Center w='100%' h='100%'>
								<Heading>Sorry, no results found.</Heading>
							</Center>
						))}
					<LeftMenu />
				</Flex>
			)}
			<Spacer />
			{currentMedia ? (
				<Controls />
			) : (
				discordActivityStatus.isOverlay && (
					<Center w='100%' h='100%'>
						<Flex direction='column' alignItems='center' gap='5px'>
							<FullLogoIcon width='auto' height='20px' color='#FFFFFF' />
							<Heading size='md'>Select a song to start.</Heading>
						</Flex>
					</Center>
				)
			)}
		</Flex>
	);
}
