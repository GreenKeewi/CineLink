import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Clapperboard, ShoppingCart } from 'lucide-react';
import { IdentifyMovieOutput } from '@/app/actions';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

type MovieCardProps = {
  movie: IdentifyMovieOutput;
  isFeatured?: boolean;
};

export default function MovieCard({
  movie,
  isFeatured = false,
}: MovieCardProps) {
  const placeholderImage =
    PlaceHolderImages.find((p) => p.id === 'movie-placeholder') ||
    PlaceHolderImages[0];

  const hasPoster =
    movie.moviePosterUrl && movie.moviePosterUrl.startsWith('http');
  const imageUrl = hasPoster ? movie.moviePosterUrl : placeholderImage.imageUrl;

  return (
    <Card
      className={cn(
        'group flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 bg-card rounded-xl border-2',
        isFeatured
          ? 'border-primary/20'
          : 'border-transparent'
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden">
        {hasPoster ? (
          <Image
            src={imageUrl}
            alt={`Poster for ${movie.movieTitle}`}
            fill
            className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/50">
            <Clapperboard className="h-16 w-16 text-muted-foreground/50" />
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

      {movie.purchaseLinks && movie.purchaseLinks.length > 0 && (
        <>
          <Separator className="my-4" />
          <CardFooter className="flex-col items-start gap-4">
            <h3 className="text-sm font-semibold text-foreground">
              Where to Watch
            </h3>
            <div className="flex flex-wrap gap-2">
              {movie.purchaseLinks.map((link) => (
                <Button key={link.service} asChild variant="outline" size="sm">
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <ShoppingCart className="mr-2" />
                    {link.service}
                  </a>
                </Button>
              ))}
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
