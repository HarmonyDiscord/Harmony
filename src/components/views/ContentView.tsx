import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import Image from 'next/image';
import { MdArrowBack } from 'react-icons/md';
import { currentContentAtom } from '../../atoms/CurrentContentAtom';
import { discordActivityStatusAtom } from '../../atoms/DiscordActivityStatus';
import { ContentType } from '../../types/content/ContentType';
import type { Song } from '../../types/content/Song';
import formatDuration from '../../util/formatDuration';
import ContentList from '../layout/ContentList';

export default function ContentView() {
	const [currentContent, setCurrentContent] = useAtom(currentContentAtom);
	const [discordActivityStatus] = useAtom(discordActivityStatusAtom);

	if (!currentContent) return null;

	const { name, thumbnail } = currentContent;
	const artist = 'artist' in currentContent ? currentContent.artist : { name: '' };
	const songs = 'songs' in currentContent ? currentContent.songs : [];
	const year = currentContent.type === ContentType.Album ? currentContent.year : null;

	const totalDuration = songs.reduce((acc: number, song: any) => {
		if (song.type === ContentType.Song) {
			return acc + song.duration;
		}
		return acc;
	}, 0);

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
			gap='20px'
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
			<Flex gap='20px' direction={{ base: 'column', md: 'row' }}>
				{thumbnail && (
					<Box position='relative' minW='300px' minH='300px' borderRadius='10px' overflow='hidden'>
						<Image
							src={thumbnail}
							alt=' '
							fill
							style={{
								objectFit: 'cover'
							}}
							unoptimized={!discordActivityStatus.isActivity}
						/>
					</Box>
				)}
				<Flex direction='column' justify='end' gap='10px'>
					<Heading size='2xl'>{name}</Heading>
					<Text fontSize='xl'>{artist.name}</Text>
					{year && <Text color='whiteAlpha.700'>{year}</Text>}
					<Text color='whiteAlpha.700'>
						{songs.length} songs
						{totalDuration > 0 && ` • ${formatDuration(totalDuration)}`}
					</Text>
				</Flex>
			</Flex>
			<ContentList items={songs} />
		</Flex>
	);
}
