import { Box, Button, Divider, Flex, Heading, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import Image from 'next/image';
import React from 'react';
import { currentContentAtom } from '../../atoms/CurrentContentAtom';
import { ContentType } from '../../types/content/ContentType';
import ContentList from '../layout/ContentList';
import { MdArrowBack } from 'react-icons/md';

export default function ArtistView() {
	const [currentContent, setCurrentContent] = useAtom(currentContentAtom);

	if (!currentContent || currentContent.type !== ContentType.Artist) return null;

	const {
		name,
		thumbnail,
		topSongs = [],
		topAlbums = [],
		topVideos = [],
		topSingles = [],
		featuredOn = [],
		similarArtists = []
	} = currentContent;

	const contentSections = [
		{ title: 'Top Songs', items: topSongs },
		{ title: 'Top Albums', items: topAlbums },
		{ title: 'Top Videos', items: topVideos },
		{ title: 'Top Singles', items: topSingles },
		{ title: 'Featured On', items: featuredOn },
		{ title: 'Similar Artists', items: similarArtists }
	].filter((section) => section.items.length > 0);

	return (
		<Flex
			as={motion.div}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			direction='column'
			w='100%'
			h='100%'
			p='20px'
			gap='32px'
			overflowY='auto'
			style={{
				mask: 'linear-gradient(to top, transparent 0%, #000000 5%, #000000 95%, transparent 100%)',
				maskMode: 'alpha'
			}}
		>
			<Box>
				<Button onClick={() => setCurrentContent(null)} size='md' leftIcon={<MdArrowBack />}>
					Back
				</Button>
			</Box>
			<Flex gap='32px' direction={{ base: 'column', md: 'row' }} align='center'>
				{thumbnail && (
					<Box position='relative' minW='200px' minH='200px' borderRadius='50%' overflow='hidden'>
						<Image src={thumbnail} alt={name} fill style={{ objectFit: 'cover' }} unoptimized />
					</Box>
				)}
				<Flex direction='column' justify='center' gap='10px'>
					<Heading size='2xl'>{name}</Heading>
				</Flex>
			</Flex>

			{contentSections.map((section, index) => (
				<React.Fragment key={section.title}>
					<Box>
						<Heading size='lg' mb='2'>
							{section.title}
						</Heading>
						<ContentList hideHeadings items={section.items} />
					</Box>
					{index < contentSections.length - 1 && <Divider />}
				</React.Fragment>
			))}
		</Flex>
	);
}
