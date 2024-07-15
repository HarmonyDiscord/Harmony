import { useBreakpointValue, SimpleGrid, SlideFade } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { currentMediaAtom } from '../../atoms/CurrentMediaAtom';
import { mediaControlsAtom } from '../../atoms/MediaControlAtom';
import MediaCard from '../general/content/MediaCard';
import type { Media } from '../../types/content/Media';

export default function Feed({ items }: { items: Media[] }) {
	const [mediaControls] = useAtom(mediaControlsAtom);
	const [currentMedia] = useAtom(currentMediaAtom);

	const isMd = useBreakpointValue([false, false, true]);

	return (
		(!currentMedia || isMd || mediaControls?.isSidePanelClosed) && (
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
						/>
					</SlideFade>
				))}
			</SimpleGrid>
		)
	);
}
