'use client';

import { Card, Text, CardBody, Flex, Heading, SimpleGrid, Spacer } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import Image from 'next/image';
import { feedAtom } from '../../atoms/FeedAtom';
import Controls from '../layout/Controls';
import Navbar from '../layout/Navbar';

export default function IndexScreen() {
	const [feed] = useAtom(feedAtom);

	return (
		<Flex w='100%' h='100%' direction='column'>
			<Navbar />
			<SimpleGrid w='100%' p='20px' minChildWidth='250px' gap='20px'>
				{feed?.map(({ id, title, album, artist, cover }) => (
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
			<Spacer />
			<Controls />
		</Flex>
	);
}
