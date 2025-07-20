'use client';

import { Box, Center, Flex, Heading, Spacer, Spinner, useBreakpointValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { discordActivityStatusAtom } from '../../atoms/DiscordActivityStatus';
import { feedAtom } from '../../atoms/FeedAtom';
import { mediaControlsAtom } from '../../atoms/MediaControlAtom';
import { useDebounce } from '../../hooks/useDebounce';
import type { SearchResult } from '../../types/SearchResult';
import type { Media } from '../../types/content/Media';
import { api } from '../../util/api';
import MediaPlayer from '../general/MediaPlayer';
import ContentList from '../layout/ContentList';
import Controls from '../layout/Controls';
import Feed from '../layout/Feed';
import LeftMenu from '../layout/LeftMenu';
import Navbar from '../layout/Navbar';

export default function IndexScreen() {
	const [feed] = useAtom(feedAtom);
	const [discordActivityStatus] = useAtom(discordActivityStatusAtom);
	const [mediaControls] = useAtom(mediaControlsAtom);
	const [currentMedia] = useAtom(currentMediaAtom);

	const [searchInput, setSearchInput] = useState<string | null>(null);
	const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
	const [searchMediaResults, setSearchMediaResults] = useState<Media[] | null>(null);
	const [isSearchLoading, setIsSearchLoading] = useState(false);

	const searchCountRef = useRef(0);
	const debouncedSearchInput = useDebounce(searchInput, 300);

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

	const isLg = useBreakpointValue([false, false, false, true]);

	return (
		<Flex w='100%' h='100%' direction='column' overflow='hidden'>
			<Navbar searchInput={searchInput} setSearchInput={setSearchInput} />
			{!discordActivityStatus?.isActivity && (
				<Flex w='100%' h='100%' maxH='100%' overflow='hidden'>
					{isSearchLoading ? (
						<Center w='100%' h='100%'>
							<Spinner size='xl' thickness='4px' />
						</Center>
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
					)}
					<LeftMenu />
				</Flex>
			)}
			<Spacer />
			<Controls />
		</Flex>
	);
}
