'use client';

import { Center, Flex, Heading, SimpleGrid, SlideFade, Spacer, Spinner, useBreakpointValue } from '@chakra-ui/react';
import axios from 'axios';
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { ContentType } from 'src/types/content/ContentType';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { feedAtom } from '../../atoms/FeedAtom';
import { mediaControlsAtom } from '../../atoms/MediaControAtom';
import { useDebounce } from '../../hooks/useDebounce';
import type { SearchResult } from '../../types/SearchResult';
import MediaCard from '../general/SongCard';
import Controls from '../layout/Controls';
import LeftMenu from '../layout/LeftMenu';
import Navbar from '../layout/Navbar';

export default function IndexScreen() {
	const [feed] = useAtom(feedAtom);

	const [searchInput, setSearchInput] = useState<string | null>(null);
	const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
	const [isSearchLoading, setIsSearchLoading] = useState(false);
	const [mediaControls] = useAtom(mediaControlsAtom);
	const [currentMedia] = useAtom(currentMediaAtom);
	const searchCountRef = useRef(0);
	const debouncedSearchInput = useDebounce(searchInput, 300);

	useEffect(() => {
		const searchEffect = async () => {
			if (!debouncedSearchInput) {
				setSearchResults(null);
				setIsSearchLoading(false);

				return;
			}

			const currentSearchCount = ++searchCountRef.current;

			setIsSearchLoading(true);

			const results = await axios
				.get(`/api/media/search?q=${encodeURIComponent(debouncedSearchInput)}`)
				.then((res) => res.data)
				.catch(() => null);

			if (currentSearchCount === searchCountRef.current) {
				if (!results) {
					setSearchResults(null);
				} else {
					setSearchResults(results);
				}

				setIsSearchLoading(false);
			}
		};

		searchEffect();
	}, [debouncedSearchInput]);

	const gridItems = searchResults || feed;

	const isMd = useBreakpointValue([false, false, true]);

	return (
		<Flex w='100%' h='100%' direction='column' overflow='hidden'>
			<Navbar searchInput={searchInput} setSearchInput={setSearchInput} />
			<Flex w='100%' h='100%' maxH='100%' overflow='hidden'>
				{isSearchLoading ? (
					<Center w='100%' h='100%'>
						<Spinner size='xl' thickness='4px' />
					</Center>
				) : gridItems && gridItems.length > 0 ? (
					(!currentMedia || isMd || mediaControls?.isSidePanelClosed) && (
						<SimpleGrid
							w='100%'
							h='fit-content'
							maxH='100%'
							p='20px'
							style={{
								mask: 'linear-gradient(to top, transparent 0%, #000000 5%, #000000 95%, transparent 100%)',
								maskMode: 'alpha'
							}}
							minChildWidth='250px'
							gap='20px'
							overflowY='auto'
							zIndex={1}
						>
							{gridItems.map((result, i) => {
								switch (result?.type) {
									case ContentType.Video:
									case ContentType.Song:
										return (
											<SlideFade in delay={i * 0.02} key={result.id}>
												<MediaCard
													id={result.id}
													type={ContentType.Song}
													title={result.title}
													album={result.type == ContentType.Song ? result.album : undefined}
													artist={result.artist}
													cover={result.cover}
													duration={result.duration}
												/>
											</SlideFade>
										);
								}
							})}
						</SimpleGrid>
					)
				) : (
					<Center w='100%' h='100%'>
						<Heading>Sorry, no results found.</Heading>
					</Center>
				)}
				<LeftMenu />
			</Flex>
			<Spacer />
			<Controls />
		</Flex>
	);
}
