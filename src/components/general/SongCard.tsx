import { Card, CardBody, Flex, Heading, Spacer, Text } from '@chakra-ui/react';
import Image from 'next/image';
import type { Song } from '../../types/Song';

export default function SongCard({ title, album, artist, cover }: Readonly<Partial<Song>>) {
	return (
		<Card maxW='sm' bg='#00000010' height='200px' width='250px' p='0px'>
			{cover && (
				<Image
					src={cover}
					alt=' '
					width={250}
					height={200}
					unoptimized
					priority
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
						<Text whiteSpace='nowrap' textOverflow='ellipsis'>
							{artist}
						</Text>
					</Flex>
				</Flex>
			</CardBody>
		</Card>
	);
}
