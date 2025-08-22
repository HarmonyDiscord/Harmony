import { Center, Fade, Flex, Heading, IconButton, Spacer, Spinner, Text } from '@chakra-ui/react';
import { useBreakpointValue } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import Image from 'next/image';
import { useState } from 'react';
import { MdDelete, MdPauseCircle, MdPlayCircle, MdPlaylistAdd, MdPlaylistAddCheck } from 'react-icons/md';
import { currentContentAtom } from '../../../atoms/CurrentContentAtom';
import { currentMediaAtom } from '../../../atoms/CurrentMediaAtom';
import { currentPlaylistAtom } from '../../../atoms/CurrentPlaylistAtom';
import { discordActivityStatusAtom } from '../../../atoms/DiscordActivityStatus';
import { defaultMediaControls, mediaControlsAtom } from '../../../atoms/MediaControlAtom';
import type { SearchResult } from '../../../types/SearchResult';
import { ContentType } from '../../../types/content/ContentType';
import type { Media } from '../../../types/content/Media';
import { api } from '../../../util/api';
import formatDuration from '../../../util/formatDuration';
import { normalizeAlbum, normalizeArtist, normalizePlaylist } from '../../../util/normalizeContent';
import { isHostAtom, socket } from '../AppFlow';

export default function ContentItem({ item }: Readonly<{ item: SearchResult }>) {
	const [isHovering, setIsHovering] = useState(false);
	const isMobile = useBreakpointValue({ base: true, md: false });
	const [discordActivityStatus] = useAtom(discordActivityStatusAtom);
	const [currentPlaylist, setCurrentPlaylist] = useAtom(currentPlaylistAtom);
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);
	const [currentMedia, setCurrentMedia] = useAtom(currentMediaAtom);
	const [, setCurrentContent] = useAtom(currentContentAtom);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isHost] = useAtom(isHostAtom);

	const isCurrentMedia = currentMedia?.id === item.id;
	const isOnCurrentPlaylist = !!currentPlaylist[item.id];

	let specificDetails = null;

	switch (item.type) {
		case ContentType.Song:
			specificDetails = (
				<Text fontSize='sm'>
					{item.artist.name} {item.album?.name && `- ${item.album.name}`}
				</Text>
			);
			break;
		case ContentType.Video:
			specificDetails = (
				<Text fontSize='sm'>
					{item.artist.name} {item.duration > 0 && `- ${formatDuration(item.duration)}`}
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

	const handleClick = async () => {
		if (isProcessing) return;
		setIsProcessing(true);
		try {
			switch (item.type) {
				case ContentType.Song:
				case ContentType.Video: {
					let playItem = item;
					if (!playItem.duration || playItem.duration === 0) {
						if (item.type === ContentType.Song) {
							const details = await api.content.song(item.videoId);
							if (details && typeof details.duration === 'number') {
								playItem = { ...playItem, duration: details.duration };
							}
						} else if (item.type === ContentType.Video) {
							const details = await api.content.video(item.id);
							if (details && typeof details.duration === 'number') {
								playItem = { ...playItem, duration: details.duration };
							}
						}
					}
					if (isCurrentMedia) {
						if (isHost) {
							setMediaControls({
								...(mediaControls ?? defaultMediaControls),
								isPlaying: !mediaControls?.isPlaying
							});
						}
						break;
					}
					if (isHost) {
						setMediaControls({
							...(mediaControls ?? defaultMediaControls),
							isLoading: true,
							isPlaying: false
						});
					}
					setCurrentPlaylist({ ...currentPlaylist, [playItem.id]: playItem });
					if (isHost && (!currentMedia || currentMedia.id !== playItem.id)) {
						setCurrentMedia(playItem);
					}
					break;
				}
				case ContentType.Album:
					const albumData = await api.content.album(item.id);
					if (albumData) {
						setCurrentContent(normalizeAlbum(albumData));
					}
					break;
				case ContentType.Playlist:
					const playlistData = await api.content.playlist(item.id);
					if (playlistData) {
						const normalized = normalizePlaylist({ ...playlistData, songs: playlistData.videos ?? [] });
						setCurrentContent(normalized);
					}
					break;
				case ContentType.Artist:
					const artistData = await api.content.artist(item.id);
					if (artistData) {
						setCurrentContent(normalizeArtist(artistData));
					}
					break;
			}
		} finally {
			setIsProcessing(false);
		}
	};

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
			onClick={handleClick}
		>
			<Center>
				{item.thumbnail && (
					<Image
						src={item.thumbnail}
						alt=' '
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
						unoptimized={!discordActivityStatus.isActivity}
						quality={100}
						referrerPolicy='no-referrer'
					/>
				)}
				<AnimatePresence>
					{(isHovering || isMobile) && (
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
								(isHost ? (
									mediaControls?.isPlaying && isCurrentMedia ? (
										<MdPauseCircle fontSize='30px' />
									) : mediaControls?.isLoading && isCurrentMedia ? (
										<Spinner size='md' />
									) : (
										<MdPlayCircle fontSize='30px' />
									)
								) : isOnCurrentPlaylist ? (
									<MdPlaylistAddCheck fontSize='30px' />
								) : (
									<MdPlaylistAdd fontSize='30px' />
								))}
							{item.type !== ContentType.Artist &&
								![ContentType.Song, ContentType.Video].includes(item.type) && (
									<MdPlayCircle fontSize='30px' />
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
				<Fade
					in={(isHovering || isMobile) && (item.type === ContentType.Song || item.type === ContentType.Video)}
				>
					{isHost ? (
						<IconButton
							size='sm'
							isDisabled={false}
							icon={
								isOnCurrentPlaylist ? <MdDelete fontSize='20px' /> : <MdPlaylistAdd fontSize='20px' />
							}
							aria-label={isOnCurrentPlaylist ? 'Remove from playlist' : 'Add to playlist'}
							onClick={(e) => {
								e.stopPropagation();
								if (isOnCurrentPlaylist) {
									const { [item.id]: _, ...rest } = currentPlaylist;
									const filtered = Object.fromEntries(
										Object.entries(rest).filter(([_, v]) => v && (v as Media).id)
									) as Record<string, Media>;
									setCurrentPlaylist(filtered);
								} else {
									setCurrentPlaylist({ ...currentPlaylist, [item.id]: item } as Record<
										string,
										Media
									>);
									setMediaControls({
										...(mediaControls ?? defaultMediaControls),
										isSidePanelClosed: false
									});
								}
							}}
						/>
					) : (
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
									socket?.emit('addMediaToPlaylist', item);
								}
							}}
						/>
					)}
				</Fade>
			</Flex>
		</Flex>
	);
}
