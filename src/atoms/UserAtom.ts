import { atom } from 'jotai';

export const userAtom = atom<{ name: string; avatarURL?: string } | null>(null);
