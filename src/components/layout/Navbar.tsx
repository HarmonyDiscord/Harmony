import {
	Avatar,
	AvatarGroup,
	Box,
	Button,
	CloseButton,
	Flex,
	Hide,
	IconButton,
	Input,
	InputGroup,
	InputLeftElement,
	InputRightElement,
	Popover,
	PopoverBody,
	PopoverContent,
	PopoverTrigger,
	Portal,
	Show,
	SlideFade,
	Spacer,
	Text,
	useBreakpointValue
} from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { MdMenu, MdSearch, MdStar } from 'react-icons/md';
import { currentContentAtom } from '../../atoms/CurrentContentAtom';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { currentPlaylistAtom } from '../../atoms/CurrentPlaylistAtom';
import { discordActivityStatusAtom } from '../../atoms/DiscordActivityStatus';
import { hostIDAtom } from '../../atoms/HostIDAtom';
import { defaultMediaControls, mediaControlsAtom } from '../../atoms/MediaControlAtom';
import { participantsAtom } from '../../atoms/ParticipantsAtom';
import { userIDAtom } from '../../atoms/UserIDAtom';
import { isHostAtom } from '../general/AppFlow';
import { socket } from '../general/AppFlow';
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
	const [isHost] = useAtom(isHostAtom);
	const [userID] = useAtom(userIDAtom);
	const [hostID] = useAtom(hostIDAtom);

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

					<Popover placement='bottom-end'>
						<PopoverTrigger>
							<Button variant='ghost' px='5px'>
								<AvatarGroup size='sm' max={2} cursor='pointer'>
									{participants?.map((p) => (
										<Avatar
											size='sm'
											key={p.id}
											src={
												p.avatarURL
													? p.avatarURL
													: `https://api.dicebear.com/9.x/identicon/svg?seed=${p.id}&backgroundColor=111011`
											}
											name={p.name}
										/>
									))}
								</AvatarGroup>
							</Button>
						</PopoverTrigger>
						<Portal>
							<PopoverContent bg='#222' color='#fff' border='none' minW='200px'>
								<PopoverBody>
									{participants?.map((p) => (
										<Flex key={p.id} align='center' gap='2' mb='2'>
											<Avatar
												size='sm'
												src={
													p.avatarURL
														? p.avatarURL
														: `https://api.dicebear.com/9.x/identicon/svg?seed=${p.id}&backgroundColor=111011`
												}
												name={p.name}
											/>
											<Text size='md'>
												{p.name ?? 'Anonymous'}
												{hostID === p.id && (
													<MdStar
														style={{
															display: 'inline',
															marginLeft: 4,
															verticalAlign: 'middle'
														}}
														color='#FFD700'
														size={16}
													/>
												)}
											</Text>
											{isHost && userID !== p.id && (
												<Button
													size='xs'
													ml='2'
													onClick={() => socket?.emit('promoteHost', p.id)}
												>
													Promote
												</Button>
											)}
										</Flex>
									))}
								</PopoverBody>
							</PopoverContent>
						</Portal>
					</Popover>

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
