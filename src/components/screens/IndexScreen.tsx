'use client';

import { Center, Flex, Heading, SimpleGrid, SlideFade, Spacer, Spinner } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import searchSongs from '../../app/actions/searchSongs';
import { feedAtom } from '../../atoms/FeedAtom';
import { useDebounce } from '../../hooks/useDebounce';
import type { Song } from '../../types/Song';
import SongCard from '../general/SongCard';
import Controls from '../layout/Controls';
import Navbar from '../layout/Navbar';
import LeftMenu from '../layout/LeftMenu';
import { motion } from 'framer-motion';

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

	return (
		<Flex w='100%' h='100%' direction='column' overflow='hidden'>
			<Navbar searchInput={searchInput} setSearchInput={setSearchInput} />
			<Flex w='100%' h='100%' maxH='100%' overflow='hidden'>
				{isSearchLoading ? (
					<Center w='100%' h='100%'>
						<Spinner size='xl' thickness='4px' />
					</Center>
				) : gridItems && gridItems.length > 0 ? (
					<SimpleGrid
						as={motion.div}
						w='100%'
						p='20px'
						layout
						layoutId='grid'
						style={{
							mask: 'linear-gradient(to top, transparent 0%, #000000 5%, #000000 95%, transparent 100%)',
							maskMode: 'alpha'
						}}
						minChildWidth='250px'
						gap='20px'
						overflowY='auto'
						maxH='100%'
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
