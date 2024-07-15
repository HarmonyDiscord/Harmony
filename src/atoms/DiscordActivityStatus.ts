import { atom } from 'jotai';
import type { DiscordActivityStatus } from '../types/DiscordActivityStatus';

export const discordActivityStatusAtom = atom<DiscordActivityStatus | null>(null);


export const defaultDiscordActivityStatus: DiscordActivityStatus = {
    isActivity: false,
    isOverlay: false
};
