'use client';

import { Card, Text, CardBody, Flex, Heading, SimpleGrid, Spacer, Center, Spinner } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import Image from 'next/image';
import { feedAtom } from '../../atoms/FeedAtom';
import Controls from '../layout/Controls';
import Navbar from '../layout/Navbar';
import { useEffect, useRef, useState } from 'react';
import search from '../../app/actions/search';
import type { Song } from '../../types/Song';
import { useDebounce } from '../../hooks/useDebounce';

export default function IndexScreen() {
	const [feed] = useAtom(feedAtom);
	const [searchInput, setSearchInput] = useState('');
	const [searchResults, setSearchResults] = useState<Song[] | null>(null);
	const [isSearchLoading, setIsSearchLoading] = useState(false);
	const searchCountRef = useRef(0);

	const debouncedSearchInput = useDebounce(searchInput, 500); // 500ms delay

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
					{gridItems.map(({ id, title, album, artist, cover }) => (
						<Card maxW='sm' bg='#00000010' key={id} height='200px' width='250px' p='0px'>
							{cover && (
								<Image
									src={cover}
									alt=' '
									width={250}
									height={200}
									unoptimized
									objectFit='cover'
									style={{
										height: '200px',
										opacity: 0.8,
										objectPosition: 'center top',
										position: 'absolute',
										objectFit: 'cover',
										borderRadius: '10px'
									}}
								/>
							)}
							<CardBody
								p='20px'
								zIndex={1}
								bg='linear-gradient(to top, #111111, transparent)'
								borderRadius='8px'
								h='100%'
							>
								<Flex direction='column' h='100%'>
									<Spacer />
									<Heading size='md' overflow='hidden' whiteSpace='nowrap' textOverflow='ellipsis'>
										{title}
									</Heading>
									<Flex gap='4px'>
										<Text overflow='hidden' whiteSpace='nowrap' textOverflow='ellipsis'>
											{album}
										</Text>
										<Text>-</Text>
										<Text>{artist}</Text>
									</Flex>
								</Flex>
							</CardBody>
						</Card>
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
