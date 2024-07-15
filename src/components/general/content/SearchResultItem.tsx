import { Flex, Heading, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { SearchResult } from '../../../types/SearchResult';
import { ContentType } from '../../../types/content/ContentType';

export default function SearchResultItem({ item }: Readonly<{ item: SearchResult }>) {
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
			<Flex>
				<Heading size='sm'>{item.name}</Heading>
				<Text></Text>
			</Flex>
		</Flex>
	);
}
