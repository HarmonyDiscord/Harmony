import { Card, CardBody, Center, Flex, Heading, Spacer, Text } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { MdPlayCircle } from 'react-icons/md';
import { useDebounce } from '../../hooks/useDebounce';
import type { Song } from '../../types/Song';
import { currentSongAtom } from '../../atoms/CurrentSongAtom';
import { useAtom } from 'jotai';

export default function SongCard(song: Readonly<Song>) {
	const [isHovering, setIsHovering] = useState(false);
	const debouncedIsHovering = useDebounce(isHovering, 100);
	const [_currentSong, setCurrentSong] = useAtom(currentSongAtom);

	const { title, album, artist, cover, duration } = song;

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
			onClick={() => setCurrentSong(song)}
		>
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
						width: '100%',
						opacity: 0.8,
						objectPosition: 'center top',
						position: 'absolute',
						objectFit: 'cover',
						borderRadius: '10px'
					}}
				/>
			)}
			<CardBody
				as={motion.div}
				p='20px'
				zIndex={1}
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
							<Heading
								size='md'
								overflow='hidden'
								whiteSpace='nowrap'
								textOverflow='ellipsis'
								as={motion.div}
								initial={{ y: -10, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ y: -10, opacity: 0 }}
							>
								{title}
							</Heading>
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
								<MdPlayCircle fontSize='60px' />
							</Center>
						)}
					</AnimatePresence>
					<Spacer />
					<AnimatePresence mode='popLayout'>
						{!debouncedIsHovering ? (
							<Heading
								key='song-title'
								size='md'
								overflow='hidden'
								whiteSpace='nowrap'
								textOverflow='ellipsis'
								as={motion.div}
								initial={{ y: -10, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ y: -10, opacity: 0 }}
							>
								{title}
							</Heading>
						) : (
							<Heading
								key='song-details'
								size='md'
								overflow='hidden'
								whiteSpace='nowrap'
								textOverflow='ellipsis'
								as={motion.div}
								initial={{ y: 10, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ y: 10, opacity: 0 }}
							>
								Play - {duration}
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
