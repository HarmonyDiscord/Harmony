import { Card, CardBody, Center, Flex, Heading, IconButton, Spacer, Spinner, Text } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import Image from 'next/image';
import { useState } from 'react';
import { MdPauseCircle, MdPlayCircle, MdPlaylistAdd, MdPlaylistAddCheck } from 'react-icons/md';
import { currentMediaAtom } from '../../../atoms/CurrentMediaAtom';
import { currentPlaylistAtom } from '../../../atoms/CurrentPlaylistAtom';
import { defaultMediaControls, mediaControlsAtom } from '../../../atoms/MediaControlAtom';
import { useDebounce } from '../../../hooks/useDebounce';
import type { Media } from '../../../types/content/Media';
import formatDuration from '../../../util/formatDuration';

export default function MediaCard(media: Readonly<Media>) {
	const [isHovering, setIsHovering] = useState(false);
	const debouncedIsHovering = useDebounce(isHovering, 100);
	const [currentMedia, setCurrentMedia] = useAtom(currentMediaAtom);
	const [currentPlaylist, setCurrentPlaylist] = useAtom(currentPlaylistAtom);
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);

	const { id, name, album, artist, thumbnail, duration } = media;

	const isCurrentMedia = currentMedia?.id === id;

	const isOnCurrentPlaylist = !!currentPlaylist[media.id];

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
			onClick={() => {
				if (isCurrentMedia)
					return setMediaControls({
						...(mediaControls ?? defaultMediaControls),
						isPlaying: !mediaControls?.isPlaying
					});

				setCurrentMedia(media);
				setCurrentPlaylist({ ...currentPlaylist, [media.id]: media });
			}}
		>
			{thumbnail && (
				<Image
					src={thumbnail}
					alt=' '
					width={250}
					height={200}
					priority
					objectFit='cover'
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
										setCurrentPlaylist({ ...currentPlaylist, [media.id]: media });
									}}
								/>
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
								{mediaControls?.isPlaying && isCurrentMedia ? (
									<MdPauseCircle fontSize='60px' />
								) : mediaControls?.isLoading && isCurrentMedia ? (
									<Spinner size='xl' thickness='4px' />
								) : (
									<MdPlayCircle fontSize='60px' />
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
								{isCurrentMedia ? 'Now playing' : 'Play'} - {formatDuration(duration)}
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
