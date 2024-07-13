'use client';

import { Card, CardBody, Flex, Heading, SimpleGrid, Spacer } from '@chakra-ui/react';
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
				{feed?.map(({ id, title, cover }) => (
					<Card
						maxW='sm'
						key={id}
						height='250px'
						width='250px'
						bg='#FFFFFF10'
						p='0px'
						gap='5px'
						zIndex={2}
						alignItems='center'
						backdropFilter='blur(5px)'
					>
						{cover && (
							<Image
								src={cover}
								alt='Song cover'
								width={250}
								height={250}
								unoptimized
								style={{
									position: 'absolute',
									opacity: 0.7,
									zIndex: -1,
									objectFit: 'cover',
									borderRadius: '10px'
								}}
							/>
						)}
						<CardBody p='20px'>
							<Heading size='md'>{title}</Heading>
						</CardBody>
					</Card>
				))}
			</SimpleGrid>
			<Spacer />
			<Controls />
		</Flex>
	);
}
