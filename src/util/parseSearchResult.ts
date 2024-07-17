import { SearchResult as YtSearchResult } from 'ytmusic-api';
import type { SearchResult } from '../types/SearchResult';
import { ContentType } from '../types/content/ContentType';

export default function parseSearchResult(result: YtSearchResult): SearchResult {
	switch (result.type) {
		case 'SONG':
			return {
				type: ContentType.Song,
				id: result.videoId,
				name: result.name,
				artist: {
					id: result.artist.artistId,
					name: result.artist.name
				},
				album: result.album
					? {
							id: result.album?.albumId,
							name: result.album?.name
						}
					: null,
				thumbnail: result.thumbnails.at(0)?.url.replace('w60', 'w250').replace('h60', 'h250') ?? null,
				duration: (result.duration ?? 1) - 1
			};

		case 'VIDEO':
			return {
				type: ContentType.Video,
				id: result.videoId,
				name: result.name,
				artist: {
					id: result.artist.artistId,
					name: result.artist.name
				},
				album: null,
				thumbnail: result.thumbnails.at(0)?.url ?? null,
				duration: result.duration ?? 0
			};

		case 'ALBUM':
			return {
				type: ContentType.Album,
				id: result.albumId,
				name: result.name,
				artist: {
					id: result.artist.artistId,
					name: result.artist.name
				},
				thumbnail: result.thumbnails.at(0)?.url ?? null,
				playlistId: result.playlistId,
				year: result.year
			};

		case 'ARTIST':
			return {
				type: ContentType.Artist,
				id: result.artistId,
				name: result.name,
				thumbnail: result.thumbnails.at(0)?.url ?? null
			};

		case 'PLAYLIST':
			return {
				type: ContentType.Playlist,
				id: result.playlistId,
				name: result.name,
				artist: {
					id: result.artist.artistId,
					name: result.artist.name
				},
				thumbnail: result.thumbnails.at(0)?.url ?? null
			};
	}
}
