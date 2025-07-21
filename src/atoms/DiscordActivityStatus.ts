import { atom } from 'jotai';
import type { DiscordActivityStatus } from '../types/DiscordActivityStatus';

export const discordActivityStatusAtom = atom<DiscordActivityStatus>({
	isActivity: false,
	isOverlay: false
});

