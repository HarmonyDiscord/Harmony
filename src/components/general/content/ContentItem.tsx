import { Flex, Heading, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { SearchResult } from '../../../types/SearchResult';
import { ContentType } from '../../../types/content/ContentType';
import formatDuration from '../../../util/formatDuration';

export default function ContentItem({ item }: Readonly<{ item: SearchResult }>) {
	let specificDetails = null;

	switch (item.type) {
		case ContentType.Song:
			specificDetails = (
				<Text fontSize='sm'>
					{item.artist.name} - {item.album?.name}
				</Text>
			);
			break;
		case ContentType.Video:
			specificDetails = (
				<Text fontSize='sm'>
					{item.artist.name} - {formatDuration(item.duration)}
				</Text>
			);
			break;
		case ContentType.Album:
			specificDetails = (
				<Text fontSize='sm'>
					{item.artist.name} - {item.year}
				</Text>
			);
			break;
		case ContentType.Playlist:
			specificDetails = <Text fontSize='sm'>{item.artist.name}</Text>;
			break;
		case ContentType.Artist:
			specificDetails = <Text fontSize='sm'>@{item.name}</Text>;
			break;
	}

	return (
		<Flex
			as={motion.div}
			bg='#FFFFFF10'
			borderRadius='10px'
			zIndex={2}
			alignItems='center'
			backdropFilter='blur(5px)'
			p='10px'
			gap='20px'
		>
			{item.thumbnail && (
				<Image
					src={item.thumbnail}
					alt={item.name}
					width={60}
					height={60}
					priority
					objectFit='cover'
					style={{
						height: '60px',
						width: '60px',
						objectPosition: 'center center',
						objectFit: 'cover',
						borderRadius: item.type === ContentType.Artist ? '50%' : '5px'
					}}
					quality={100}
				/>
			)}
			<Flex direction='column'>
				<Heading size='sm'>{item.name}</Heading>
				{specificDetails}
			</Flex>
		</Flex>
	);
}
