import { Avatar, Box, Flex, Heading, Input, InputGroup, InputLeftElement, Spacer } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { MdMusicNote, MdSearch } from 'react-icons/md';
import { userAtom } from '../../atoms/UserAtom';

export default function Navbar({ searchInput, setSearchInput }: any) {
	const [user] = useAtom(userAtom);

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
				<MdMusicNote fontSize='36px' color='#FFFFFF' />
				<Heading size='md' fontWeight='bold'>
					Harmony
				</Heading>
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
				</InputGroup>
				{user ? <Avatar width='40px' height='40px' src={user?.avatarURL} /> : null}
			</Flex>
		</Box>
	);
}
