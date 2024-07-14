'use client';

import {
	Center,
	Flex,
	Heading,
	Show,
	SimpleGrid,
	SlideFade,
	Spacer,
	Spinner,
	useBreakpointValue
} from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import searchSongs from '../../app/actions/searchSongs';
import { currentSongAtom } from '../../atoms/CurrentSongAtom';
import { feedAtom } from '../../atoms/FeedAtom';
import { songControlsAtom } from '../../atoms/SongControlsAtom';
import { useDebounce } from '../../hooks/useDebounce';
import type { Song } from '../../types/Song';
import SongCard from '../general/SongCard';
import Controls from '../layout/Controls';
import LeftMenu from '../layout/LeftMenu';
import Navbar from '../layout/Navbar';

export default function IndexScreen() {
	const [feed] = useAtom(feedAtom);

	const [searchInput, setSearchInput] = useState<string | null>(null);
	const [searchResults, setSearchResults] = useState<Song[] | null>(null);
	const [isSearchLoading, setIsSearchLoading] = useState(false);
	const [songControls] = useAtom(songControlsAtom);
	const [currentSong] = useAtom(currentSongAtom);
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

			const results = await searchSongs(debouncedSearchInput);

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
					(!currentSong || isMd || songControls?.isSidePanelClosed) && (
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
							{gridItems.map(({ id, title, album, artist, cover, duration }, i) => (
								<SlideFade in delay={i * 0.02} key={id}>
									<SongCard
										id={id}
										title={title}
										album={album}
										artist={artist}
										cover={cover}
										duration={duration}
									/>
								</SlideFade>
							))}
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
