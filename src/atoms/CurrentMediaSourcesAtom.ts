import { atom } from 'jotai';
import type { CurrentMediaSources } from 'src/types/CurrentMediaSources';

export const currentMediaSourcesAtom = atom<CurrentMediaSources | null>(null);

export const defaultCurrentMediaSources: CurrentMediaSources = {
    currentId: undefined,
    songURL: undefined,
    videoURL: undefined
};
