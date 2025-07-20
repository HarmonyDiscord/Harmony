import { Center, Fade, Flex, Heading, IconButton, Spacer, Spinner, Text } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import Image from 'next/image';
import { useState } from 'react';
import { MdPauseCircle, MdPlayCircle, MdPlaylistAdd, MdPlaylistAddCheck } from 'react-icons/md';
import { currentMediaAtom } from '../../../atoms/CurrentMediaAtom';
import { currentPlaylistAtom } from '../../../atoms/CurrentPlaylistAtom';
import { discordActivityStatusAtom } from '../../../atoms/DiscordActivityStatus';
import { defaultMediaControls, mediaControlsAtom } from '../../../atoms/MediaControlAtom';
import type { SearchResult } from '../../../types/SearchResult';
import { ContentType } from '../../../types/content/ContentType';
import formatDuration from '../../../util/formatDuration';

export default function ContentItem({ item }: Readonly<{ item: SearchResult }>) {
	const [isHovering, setIsHovering] = useState(false);
	const [discordActivityStatus] = useAtom(discordActivityStatusAtom);
	const [currentPlaylist, setCurrentPlaylist] = useAtom(currentPlaylistAtom);
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);
	const [currentMedia, setCurrentMedia] = useAtom(currentMediaAtom);

	const isCurrentMedia = currentMedia?.id === item.id;
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
						if (isCurrentMedia)
							return setMediaControls({
								...(mediaControls ?? defaultMediaControls),
								isPlaying: !mediaControls?.isPlaying
							});

						setCurrentMedia(item);
						setCurrentPlaylist({ ...currentPlaylist, [item.id]: item });

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
						style={{
							height: '60px',
							minHeight: '60px',
							width: '60px',
							minWidth: '60px',
							objectPosition: 'center center',
							objectFit: 'cover',
							borderRadius: item.type === ContentType.Artist ? '50%' : '5px'
						}}
						unoptimized={!discordActivityStatus?.isActivity}
						quality={100}
						referrerPolicy='no-referrer'
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
							{(item.type === ContentType.Song || item.type === ContentType.Video) &&
							mediaControls?.isPlaying &&
							isCurrentMedia ? (
								<MdPauseCircle fontSize='30px' />
							) : mediaControls?.isLoading && isCurrentMedia ? (
								<Spinner size='md' />
							) : (
								item.type !== ContentType.Artist && <MdPlayCircle fontSize='30px' />
							)}
						</Center>
					)}
				</AnimatePresence>
			</Center>
			<Flex direction='row' w='100%'>
				<Flex direction='column'>
					<Heading size='sm'>
						{item.name}
						{isCurrentMedia && ' - Now playing'}
					</Heading>
					{specificDetails}
				</Flex>
				<Spacer />
				<Fade in={isHovering && (item.type === ContentType.Song || item.type === ContentType.Video)}>
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
							if (item.type === ContentType.Song || item.type === ContentType.Video) {
								e.stopPropagation();
								setCurrentPlaylist({ ...currentPlaylist, [item.id]: item });
							}
						}}
					/>
				</Fade>
			</Flex>
		</Flex>
	);
}
