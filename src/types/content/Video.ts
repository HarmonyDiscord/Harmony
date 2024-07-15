import type { ContentType } from './ContentType';

export type Video = {
	type: ContentType.Video;
	id: string;
	title: string;
	artist: string;
	album?: string;
	cover?: string;
	duration: number;
};
