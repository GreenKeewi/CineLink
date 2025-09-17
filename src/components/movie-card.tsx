import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Clapperboard } from 'lucide-react';

type Movie = {
  movieTitle: string;
  movieDetails: string;
  moviePosterUrl: string;
};

type MovieCardProps = {
  movie: Movie;
  isFeatured?: boolean;
};

export default function MovieCard({
  movie,
  isFeatured = false,
}: MovieCardProps) {
  const placeholderImage =
    PlaceHolderImages.find((p) => p.id === 'movie-placeholder') ||
    PlaceHolderImages[0];

  const hasPoster = movie.moviePosterUrl && movie.moviePosterUrl.startsWith('http');
  const imageUrl = hasPoster ? movie.moviePosterUrl : placeholderImage.imageUrl;

  return (
    <Card
      className={cn(
        'group flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10',
        isFeatured
          ? 'border-primary/30'
          : 'bg-card'
      )}
    >
       <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
         {hasPoster ? (
            <Image
              src={imageUrl}
              alt={`Poster for ${movie.movieTitle}`}
              fill
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Clapperboard className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
      </div>
      <CardHeader>
        <CardTitle
          className={cn(
            'font-headline tracking-tight',
            isFeatured ? 'text-3xl' : 'text-xl'
          )}
        >
          {movie.movieTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pt-0">
        <CardDescription
          className={cn(
            'leading-relaxed',
            isFeatured
              ? 'text-base text-foreground/80'
              : 'text-sm text-muted-foreground'
          )}
        >
          {movie.movieDetails}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
