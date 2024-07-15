import type { ContentType } from './ContentType';

export type Song = {
	type: ContentType.Song;
	id: string;
	name: string;
	artist: {
		id: string | null;
		name: string;
	};
	album: {
		id: string;
		name: string;
	} | null;
	duration: number;
	thumbnail: string | null;
};
