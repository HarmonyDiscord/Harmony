import {
	Avatar,
	Box,
	CloseButton,
	Flex,
	Heading,
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
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { discordActivityStatusAtom } from '../../atoms/DiscordActivityStatus';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import { userAtom } from '../../atoms/UserAtom';
import { currentContentAtom } from '../../atoms/CurrentContentAtom';
import { feedAtom } from '../../atoms/FeedAtom';
import FullLogoIcon from '../icons/FullLogoIcon';
import LogoIcon from '../icons/LogoIcon';

export default function Navbar({ searchInput, setSearchInput }: any) {
	const [user] = useAtom(userAtom);
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);
	const [discordActivityStatus] = useAtom(discordActivityStatusAtom);
	const [currentMedia] = useAtom(currentMediaAtom);
	const [, setCurrentContent] = useAtom(currentContentAtom);
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
					{user ? <Avatar width='40px' height='40px' src={user?.avatarURL} /> : null}
					{currentMedia && mediaControls?.isSidePanelClosed && (
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
