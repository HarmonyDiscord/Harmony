'use client';

import { Center, Flex, Heading, SimpleGrid, SlideFade, Spacer, Spinner } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import search from '../../app/actions/search';
import { feedAtom } from '../../atoms/FeedAtom';
import { useDebounce } from '../../hooks/useDebounce';
import type { Song } from '../../types/Song';
import SongCard from '../general/SongCard';
import Controls from '../layout/Controls';
import Navbar from '../layout/Navbar';

export default function IndexScreen() {
	const [feed] = useAtom(feedAtom);
	const [searchInput, setSearchInput] = useState<string | null>(null);
	const [searchResults, setSearchResults] = useState<Song[] | null>(null);
	const [isSearchLoading, setIsSearchLoading] = useState(false);
	const searchCountRef = useRef(0);
	const debouncedSearchInput = useDebounce(searchInput, 300);

	useEffect(() => {
		const searchEffect = async () => {
			if (!debouncedSearchInput) {
				setSearchResults(null);
				setIsSearchLoading(false);
				return;
			}

			if (isSearchLoading) return;

			setIsSearchLoading(true);

			const currentSearchCount = ++searchCountRef.current;
			const results = await search(debouncedSearchInput);

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

	return (
		<Flex w='100%' h='100%' direction='column'>
			<Navbar searchInput={searchInput} setSearchInput={setSearchInput} />
			{isSearchLoading ? (
				<Center w='100%' h='100%'>
					<Spinner size='xl' />
				</Center>
			) : gridItems && gridItems.length > 0 ? (
				<SimpleGrid w='100%' p='20px' minChildWidth='250px' gap='20px'>
					{gridItems.map(({ id, title, album, artist, cover }, i) => (
						<SlideFade in delay={i * 0.02} key={id}>
							<SongCard id={id} title={title} album={album} artist={artist} cover={cover} />
						</SlideFade>
					))}
				</SimpleGrid>
			) : (
				<Center w='100%' h='100%'>
					<Heading>Sorry, no results found.</Heading>
				</Center>
			)}
			<Spacer />
			<Controls />
		</Flex>
	);
}
