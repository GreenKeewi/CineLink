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
      <CardContent className="flex flex-col-reverse justify-between flex-grow sm:flex-col">
        <CardDescription
          className={cn(
            'leading-relaxed mt-4 sm:mt-0',
            isFeatured
              ? 'text-base text-foreground/80'
              : 'text-sm text-muted-foreground'
          )}
        >
          {movie.movieDetails}
        </CardDescription>
        {(isFeatured || hasPoster) && (
          <div className="mb-4 aspect-video overflow-hidden rounded-md relative sm:order-first bg-muted flex items-center justify-center">
            {hasPoster ? (
              <Image
                src={imageUrl}
                alt={`Poster for ${movie.movieTitle}`}
                fill
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
                isFeatured && (
                    <div className="mb-4 aspect-video overflow-hidden rounded-md relative sm:order-first bg-muted flex items-center justify-center w-full h-full">
                        <Clapperboard className="w-16 h-16 text-muted-foreground" />
                    </div>
                )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
