import type { ContentType } from './ContentType';

export type Artist = {
    type: ContentType.Artist;
    id: string;
    title: string;
    artist: {
        artistId: string | null;
        name: string;
    };
    album?: string;
    cover?: string;
    duration: number;
};
