import {
	Avatar,
	Box,
	CloseButton,
	Flex,
	Heading,
	IconButton,
	Input,
	InputGroup,
	InputLeftElement,
	InputRightElement,
	Show,
	SlideFade,
	Spacer
} from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { MdMenu, MdMusicNote, MdSearch } from 'react-icons/md';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import { userAtom } from '../../atoms/UserAtom';
import { discordActivityStatusAtom } from '../../atoms/DiscordActivityStatus';

export default function Navbar({ searchInput, setSearchInput }: any) {
	const [user] = useAtom(userAtom);
	const [mediaControls, setMediaControls] = useAtom(mediaControlsAtom);
	const [discordActivityStatus] = useAtom(discordActivityStatusAtom);
	const [currentMedia] = useAtom(currentMediaAtom);
	return (
		!discordActivityStatus?.isOverlay && (
			<Box w='100%' p='20px' pb='0px'>
				<Flex
					w='100%'
					bg='#FFFFFF10'
					borderRadius='10px'
					p='20px'
					gap='10px'
					zIndex={2}
					alignItems='center'
					backdropFilter='blur(5px)'
				>
					<Flex gap='10px' cursor='pointer' onClick={() => location.reload()} alignItems='center'>
						<Box minW='36px'>
							<MdMusicNote fontSize='36px' color='#FFFFFF' />
						</Box>
						<Show above='sm'>
							<Heading size='md' fontWeight='bold'>
								Harmony
							</Heading>
						</Show>
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
