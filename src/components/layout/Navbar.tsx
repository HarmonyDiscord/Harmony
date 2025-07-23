import {
	Avatar,
	AvatarGroup,
	Box,
	CloseButton,
	Flex,
	Hide,
	IconButton,
	Input,
	InputGroup,
	InputLeftElement,
	InputRightElement,
	Show,
	SlideFade,
	Spacer,
	useBreakpointValue
} from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { MdMenu, MdSearch } from 'react-icons/md';
import { currentContentAtom } from '../../atoms/CurrentContentAtom';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { currentPlaylistAtom } from '../../atoms/CurrentPlaylistAtom';
import { discordActivityStatusAtom } from '../../atoms/DiscordActivityStatus';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import { participantsAtom } from '../../atoms/ParticipantsAtom';
import FullLogoIcon from '../icons/FullLogoIcon';
import LogoIcon from '../icons/LogoIcon';

export default function Navbar({ searchInput, setSearchInput }: any) {
	const [participants] = useAtom(participantsAtom);
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);
	const [discordActivityStatus] = useAtom(discordActivityStatusAtom);
	const [currentMedia] = useAtom(currentMediaAtom);
	const [, setCurrentContent] = useAtom(currentContentAtom);
	const [currentPlaylist] = useAtom(currentPlaylistAtom);
	const isLg = useBreakpointValue([false, false, false, true]);

	const handleLogoClick = () => {
		setSearchInput('');
		setCurrentContent(null);
		if (!isLg) {
			setMediaControls({
				...(mediaControls ?? defaultMediaControls),
				isSidePanelClosed: true
			});
		}
	};

	return (
		!discordActivityStatus.isOverlay && (
			<Box w='100%' p='20px' pb='0px'>
				<Flex
					w='100%'
					bg='#FFFFFF10'
					borderRadius='10px'
					px='15px'
					py='10px'
					gap='10px'
					zIndex={2}
					alignItems='center'
					backdropFilter='blur(5px)'
				>
					<Flex gap='10px' cursor='pointer' onClick={handleLogoClick} alignItems='center'>
						<Box pl='5px' minW='max-content'>
							<Hide above='sm'>
								<LogoIcon width='auto' height='28' color='#FFFFFF' />
							</Hide>
							<Show above='sm'>
								<FullLogoIcon width='auto' height='25' color='#FFFFFF' />
							</Show>
						</Box>
					</Flex>
					<Spacer />
					<InputGroup w='400px'>
						<InputLeftElement pointerEvents='none'>
							<MdSearch fontSize='22px' />
						</InputLeftElement>
						<Input
							variant='filled'
							focusBorderColor='#FFFFFF30'
							placeholder='Search anything...'
							pr='40px'
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
						/>
						<SlideFade in={!!searchInput} offsetX={8} offsetY={0} unmountOnExit>
							<InputRightElement>
								<CloseButton size='sm' onClick={() => setSearchInput('')} />
							</InputRightElement>
						</SlideFade>
					</InputGroup>
					{participants.length ? (
						<AvatarGroup size='md' max={2}>
							{participants.map((p) => (
								<Avatar width='40px' height='40px' key={p.id} src={p?.avatarURL} name={p.name} />
							))}
						</AvatarGroup>
					) : null}
					{(Object.keys(currentPlaylist).length > 0 || currentMedia) && mediaControls?.isSidePanelClosed && (
						<IconButton
							icon={<MdMenu />}
							aria-label='Open menu'
							onClick={() =>
								setMediaControls({
									...(mediaControls ?? defaultMediaControls),
									isSidePanelClosed: false
								})
							}
						/>
					)}
				</Flex>
			</Box>
		)
	);
}
