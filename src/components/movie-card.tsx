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

  if (isFeatured) {
    return (
      <Card className="grid md:grid-cols-2 gap-8 items-start bg-card p-6 md:p-8 rounded-xl border-2 border-primary/20">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
          {hasPoster ? (
            <Image
              src={imageUrl}
              alt={`Poster for ${movie.movieTitle}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/50">
              <Clapperboard className="h-24 w-24 text-muted-foreground/50" />
            </div>
          )}
        </div>
        <div className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="font-headline tracking-tight text-3xl">
              {movie.movieTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow pt-0">
            <CardDescription className="leading-relaxed text-base text-foreground/80">
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
                    <Button
                      key={link.service}
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ShoppingCart className="mr-2" />
                        {link.service}
                      </a>
                    </Button>
                  ))}
                </div>
              </CardFooter>
            </>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'group flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 bg-card rounded-xl border-2 border-transparent'
      )}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={`Poster for ${movie.movieTitle}`}
          fill
          className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          data-ai-hint={hasPoster ? undefined : placeholderImage.imageHint}
        />
        {!hasPoster && (
           <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-muted/50">
            <Clapperboard className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}
      </div>
      <CardHeader className="p-4">
        <CardTitle className={cn('font-headline tracking-tight text-lg')}>
          {movie.movieTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <CardDescription
          className={cn('leading-relaxed text-xs text-muted-foreground line-clamp-3')}
        >
          {movie.movieDetails}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
