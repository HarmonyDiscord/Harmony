import { Box, Button, Divider, Flex, Heading } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import Image from 'next/image';
import React from 'react';
import { currentContentAtom } from '../../atoms/CurrentContentAtom';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { mediaControlsAtom } from '../../atoms/MediaControlAtom';
import { ContentType } from '../../types/content/ContentType';
import ContentList from '../layout/ContentList';
import { MdArrowBack } from 'react-icons/md';
import { discordActivityStatusAtom } from '../../atoms/DiscordActivityStatus';

export default function ArtistView() {
	const [currentContent, setCurrentContent] = useAtom(currentContentAtom);
	const [currentMedia] = useAtom(currentMediaAtom);
	const [mediaControls] = useAtom(mediaControlsAtom);
	const [discordActivityStatus] = useAtom(discordActivityStatusAtom);

	const isSidePanelOpen = currentMedia && !mediaControls?.isSidePanelClosed;

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
			overflowY='auto'
			style={{
				mask: 'linear-gradient(to top, transparent 0%, #000000 5%, #000000 95%, transparent 100%)',
				maskMode: 'alpha'
			}}
		>
			{thumbnail && (
				<Box position='relative' w='100%' h='500px' flexShrink={0}>
					<Box
						position='absolute'
						top={0}
						left={0}
						w='100%'
						h='650px'
						style={{
							mask: isSidePanelOpen
								? 'linear-gradient(to right,#000000 0%, #000000 75%, transparent 100%)'
								: undefined
						}}
					>
						<Image
							src={thumbnail}
							alt=' '
							fill
							style={{
								objectFit: 'cover',
								opacity: 0.7,
								mask: 'linear-gradient(to bottom, #000000 5%, #000000 25%, transparent 100%)'
							}}
							unoptimized={!discordActivityStatus.isActivity}
						/>
					</Box>
					<Flex
						position='absolute'
						top={0}
						left={0}
						w='100%'
						h='100%'
						direction='column'
						justifyContent='space-between'
						px='20px'
						pt='40px'
					>
						<Box>
							<Button onClick={() => setCurrentContent(null)} size='md' leftIcon={<MdArrowBack />}>
								Back
							</Button>
						</Box>
						<Heading size='3xl' textShadow='0 2px 10px rgba(0,0,0,0.8)' fontWeight='bold'>
							{name}
						</Heading>
					</Flex>
				</Box>
			)}

			<Flex direction='column' p='20px' gap='32px'>
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
		</Flex>
	);
}
