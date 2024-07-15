import { Center, Flex, Heading, IconButton, Spacer, Text } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { MdPlayCircle, MdPlaylistAdd, MdPlaylistAddCheck } from 'react-icons/md';
import type { SearchResult } from '../../../types/SearchResult';
import { ContentType } from '../../../types/content/ContentType';
import formatDuration from '../../../util/formatDuration';
import { useAtom } from 'jotai';
import { currentPlaylistAtom } from '../../../atoms/CurrentPlaylistAtom';

export default function ContentItem({ item }: Readonly<{ item: SearchResult }>) {
	const [isHovering, setIsHovering] = useState(false);
	const [currentPlaylist, setCurrentPlaylist] = useAtom(currentPlaylistAtom);

	const isOnCurrentPlaylist = !!currentPlaylist[item.id];

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
			whileHover={{
				backgroundColor: '#FFFFFF20'
			}}
			borderRadius='10px'
			zIndex={2}
			alignItems='center'
			backdropFilter='blur(5px)'
			p='10px'
			gap='20px'
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => setIsHovering(false)}
			cursor='pointer'
			onClick={() => {
				switch (item.type) {
					case ContentType.Song:
					case ContentType.Video:
						break;
					case ContentType.Album:
						break;
					case ContentType.Playlist:
						break;
					case ContentType.Artist:
						break;
				}
			}}
		>
			<Center>
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
							minHeight: '60px',
							width: '60px',
							minWidth: '60px',
							objectPosition: 'center center',
							objectFit: 'cover',
							borderRadius: item.type === ContentType.Artist ? '50%' : '5px'
						}}
						quality={100}
					/>
				)}
				<AnimatePresence>
					{isHovering && (
						<Center
							as={motion.div}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							width='60px'
							height='60px'
							borderRadius={item.type === ContentType.Artist ? '50%' : '5px'}
							backdropFilter={item.type !== ContentType.Artist ? 'blur(2px)' : undefined}
							bg={item.type !== ContentType.Artist ? '#00000050' : '#FFFFFF20'}
							position='absolute'
						>
							{item.type !== ContentType.Artist && <MdPlayCircle fontSize='30px' />}
						</Center>
					)}
				</AnimatePresence>
			</Center>
			<Flex direction='row' w='100%'>
				<Flex direction='column'>
					<Heading size='sm'>{item.name}</Heading>
					{specificDetails}
				</Flex>
				<Spacer />
				{isHovering && (item.type === ContentType.Song || item.type === ContentType.Video) && (
					<IconButton
						size='sm'
						isDisabled={isOnCurrentPlaylist}
						icon={
							isOnCurrentPlaylist ? (
								<MdPlaylistAddCheck fontSize='20px' />
							) : (
								<MdPlaylistAdd fontSize='20px' />
							)
						}
						aria-label='Add to playlist'
						onClick={(e) => {
							e.stopPropagation();
							setCurrentPlaylist({ ...currentPlaylist, [item.id]: item });
						}}
					/>
				)}
			</Flex>
		</Flex>
	);
}
