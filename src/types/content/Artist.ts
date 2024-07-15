import type { ContentType } from './ContentType';

export type Artist = {
	type: ContentType.Artist;
	id: string;
	name: string;
	thumbnail: string | null;
};
