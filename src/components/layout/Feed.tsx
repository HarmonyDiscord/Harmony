import { SimpleGrid, SlideFade } from '@chakra-ui/react';
import type { Media } from '../../types/content/Media';
import MediaCard from '../general/content/MediaCard';

export default function Feed({ items }: { items: Media[] }) {
	return (
		<SimpleGrid
			w='100%'
			h='fit-content'
			maxH='100%'
			p='20px'
			style={{
				mask: 'linear-gradient(to top, transparent 0%, #000000 5%, #000000 95%, transparent 100%)',
				maskMode: 'alpha'
			}}
			minChildWidth='250px'
			gap='20px'
			overflowY='auto'
			zIndex={1}
		>
			{items.map((item, i) => (
				<SlideFade in delay={i * 0.02} key={item.id}>
					<MediaCard
						id={item.id}
						type={item.type as any}
						name={item.name}
						album={item.album}
						artist={item.artist}
						thumbnail={item.thumbnail}
						duration={item.duration}
						videoId={'videoId' in item ? item.videoId : item.id}
					/>
				</SlideFade>
			))}
		</SimpleGrid>
	);
}
