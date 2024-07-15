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
	SlideFade,
	Spacer
} from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { MdMenu, MdMusicNote, MdSearch } from 'react-icons/md';
import { currentSongAtom } from '../../atoms/CurrentSongAtom';
import { defaultSongControls, songControlsAtom } from '../../atoms/SongControlsAtom';
import { userAtom } from '../../atoms/UserAtom';

export default function Navbar({ searchInput, setSearchInput }: any) {
	const [user] = useAtom(userAtom);
	const [songControls, setSongControls] = useAtom(songControlsAtom);
	const [currentSong] = useAtom(currentSongAtom);

	return (
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
				<Flex gap='10px' cursor='pointer' onClick={() => location.reload()}>
					<Box minW='36px'>
						<MdMusicNote fontSize='36px' color='#FFFFFF' />
					</Box>
					<Heading size='md' fontWeight='bold'>
						Harmony
					</Heading>
				</Flex>
				<Spacer />
				<InputGroup w='400px'>
					<InputLeftElement pointerEvents='none'>
						<MdSearch fontSize='22px' />
					</InputLeftElement>
					<Input
						variant='filled'
						focusBorderColor='#FFFFFF30'
						placeholder='Search for a song...'
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
				{currentSong && songControls?.isSidePanelClosed && (
					<IconButton
						icon={<MdMenu />}
						aria-label='Open menu'
						onClick={() =>
							setSongControls({
								...(songControls ?? defaultSongControls),
								isSidePanelClosed: false
							})
						}
					/>
				)}
			</Flex>
		</Box>
	);
}
