import { Card, CardBody, Center, Flex, Heading, IconButton, Spacer, Spinner, Text } from '@chakra-ui/react';
import { useBreakpointValue } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { MdPauseCircle, MdPlayCircle, MdPlaylistAdd, MdPlaylistAddCheck } from 'react-icons/md';
import { getImageUrl } from 'src/util/api';
import { currentMediaAtom } from '../../../atoms/CurrentMediaAtom';
import { currentPlaylistAtom } from '../../../atoms/CurrentPlaylistAtom';
import { discordActivityStatusAtom } from '../../../atoms/DiscordActivityStatus';
import { defaultMediaControls, mediaControlsAtom } from '../../../atoms/MediaControlAtom';
import { useDebounce } from '../../../hooks/useDebounce';
import type { Media } from '../../../types/content/Media';
import formatDuration from '../../../util/formatDuration';
import { isHostAtom } from '../AppFlow';
import { socket } from '../AppFlow';
import { participantsAtom } from 'src/atoms/ParticipantsAtom';

export default function MediaCard(media: Readonly<Media>) {
	const [isHovering, setIsHovering] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const isMobile = useBreakpointValue({ base: true, md: false });
	const debouncedIsHovering = useDebounce(isHovering || (isMobile && isMounted), 100);
	const [currentMedia, setCurrentMedia] = useAtom(currentMediaAtom);
	const [currentPlaylist, setCurrentPlaylist] = useAtom(currentPlaylistAtom);
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isHost] = useAtom(isHostAtom);
	const [participants] = useAtom(participantsAtom);

	const { id, name, album, artist, thumbnail, duration } = media;

	const isCurrentMedia = currentMedia?.id === id;
	const isOnCurrentPlaylist = !!currentPlaylist[media.id];
	const shouldAddToPlaylist = isHost && participants.length > 1;

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const handleMainClick = async () => {
		if (isProcessing) return;
		setIsProcessing(true);

		if (isCurrentMedia) {
			if (isHost) {
				setMediaControls({
					...(mediaControls ?? defaultMediaControls),
					isPlaying: !mediaControls?.isPlaying
				});
			}
			setIsProcessing(false);
			return;
		}

		if (shouldAddToPlaylist) {
			setCurrentPlaylist({ ...currentPlaylist, [media.id]: media });
			socket?.emit('addMediaToPlaylist', media);
		} else {
			if (isHost) {
				setCurrentMedia(media);
			}
			setCurrentPlaylist({ ...currentPlaylist, [media.id]: media });
			socket?.emit('addMediaToPlaylist', media);
		}

		setTimeout(() => setIsProcessing(false), 500);
	};

	const handleDirectPlay = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isProcessing) return;
		setIsProcessing(true);

		if (isHost) {
			setCurrentMedia(media);
		}
		setCurrentPlaylist({ ...currentPlaylist, [media.id]: media });
		socket?.emit('addMediaToPlaylist', media);

		setTimeout(() => setIsProcessing(false), 500);
	};

	const handleAddToPlaylist = (e: React.MouseEvent) => {
		e.stopPropagation();
		setCurrentPlaylist({ ...currentPlaylist, [media.id]: media });
		socket?.emit('addMediaToPlaylist', media);
		setMediaControls({
			...(mediaControls ?? defaultMediaControls),
			isSidePanelClosed: false
		});
	};

	return (
		<Card
			as={motion.div}
			whileHover={{
				scale: 1.02
			}}
			whileTap={{
				scale: 0.98
			}}
			bg='#00000010'
			height='200px'
			p='0px'
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => setIsHovering(false)}
			onClick={handleMainClick}
		>
			{thumbnail && (
				<Image
					src={getImageUrl(thumbnail)}
					alt=' '
					width={250}
					height={200}
					priority
					style={{
						height: '200px',
						width: '100%',
						zIndex: 2,
						opacity: 0.85,
						objectPosition: 'center top',
						position: 'absolute',
						objectFit: 'cover',
						borderRadius: '10px'
					}}
					referrerPolicy='no-referrer'
					quality={100}
					unoptimized
				/>
			)}
			<CardBody
				as={motion.div}
				p='20px'
				zIndex={2}
				cursor='pointer'
				borderRadius='8px'
				bg='linear-gradient(to top, #111111, transparent)'
				animate={{
					backdropFilter: debouncedIsHovering ? 'blur(5px) brightness(70%)' : 'blur(0px) brightness(100%)'
				}}
				h='100%'
			>
				<Flex direction='column' h='100%'>
					<AnimatePresence mode='popLayout'>
						{debouncedIsHovering && (
							<Flex
								as={motion.div}
								initial={{ y: -10, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ y: -10, opacity: 0 }}
							>
								<Heading size='md' overflow='hidden' whiteSpace='nowrap' textOverflow='ellipsis'>
									{name}
								</Heading>
								<Spacer />
								{shouldAddToPlaylist ? (
									<IconButton
										size='sm'
										icon={<MdPlayCircle fontSize='20px' />}
										aria-label='Play now'
										onClick={handleDirectPlay}
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
										onClick={handleAddToPlaylist}
									/>
								)}
							</Flex>
						)}
					</AnimatePresence>
					<Spacer />
					<AnimatePresence mode='popLayout'>
						{debouncedIsHovering && (
							<Center
								as={motion.div}
								initial={{ y: 10, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ y: 10, opacity: 0 }}
							>
								{isHost ? (
									mediaControls?.isPlaying && isCurrentMedia ? (
										<MdPauseCircle fontSize='60px' />
									) : mediaControls?.isLoading && isCurrentMedia ? (
										<Spinner size='xl' thickness='4px' />
									) : shouldAddToPlaylist ? (
										isOnCurrentPlaylist ? (
											<MdPlaylistAddCheck fontSize='60px' />
										) : (
											<MdPlaylistAdd fontSize='60px' />
										)
									) : (
										<MdPlayCircle fontSize='60px' />
									)
								) : isOnCurrentPlaylist ? (
									<MdPlaylistAddCheck fontSize='60px' />
								) : (
									<MdPlaylistAdd fontSize='60px' />
								)}
							</Center>
						)}
					</AnimatePresence>
					<Spacer />
					<AnimatePresence mode='popLayout'>
						{!debouncedIsHovering ? (
							<Heading
								key='media-name'
								size='md'
								overflow='hidden'
								whiteSpace='nowrap'
								textOverflow='ellipsis'
								as={motion.div}
								initial={{ y: -10, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ y: -10, opacity: 0 }}
							>
								{name}
							</Heading>
						) : (
							<Heading
								key='media-details'
								size='md'
								overflow='hidden'
								whiteSpace='nowrap'
								textOverflow='ellipsis'
								as={motion.div}
								initial={{ y: 10, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ y: 10, opacity: 0 }}
							>
								{isCurrentMedia ? 'Now playing' : shouldAddToPlaylist ? 'Add to playlist' : 'Play now'}{' '}
								- {formatDuration(duration)}
							</Heading>
						)}
					</AnimatePresence>
					<Flex
						gap='4px'
						as={motion.div}
						initial={{ y: 10, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: 10, opacity: 0 }}
					>
						<Text overflow='hidden' whiteSpace='nowrap' textOverflow='ellipsis'>
							{album?.name}
						</Text>
						<Text>-</Text>
						<Text whiteSpace='nowrap' textOverflow='ellipsis'>
							{artist.name}
						</Text>
					</Flex>
				</Flex>
			</CardBody>
		</Card>
	);
}