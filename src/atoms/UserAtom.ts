import { atom } from 'jotai';

export const userAtom = atom<{ id: string; name: string; avatarURL?: string } | null>(null);
