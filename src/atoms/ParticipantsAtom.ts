import { atom } from 'jotai';

export const participantsAtom = atom<{ id: string; name: string; avatarURL?: string }[]>([]);
