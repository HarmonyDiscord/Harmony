import type { ContentType } from './ContentType';

export type Playlist = {
    type: ContentType.Playlist;
    id: string;
    title: string;
    artist: string;
    album?: string;
    cover?: string;
    duration: number;
};
