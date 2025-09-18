'use client';

import { useState } from 'react';
import { identifyMovieAction } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Film, Loader2, History, SearchX, Quote } from 'lucide-react';
import MovieCard from './movie-card';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';

type Movie = {
  movieTitle: string;
  movieDetails: string;
  moviePosterUrl: string;
};

export default function CineLinkMain() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [movieNotFound, setMovieNotFound] = useState(false);
  const [history, setHistory] = useState<Movie[]>([]);

  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setCurrentMovie(null);
    setMovieNotFound(false);

    const formData = new FormData(event.currentTarget);
    const result = await identifyMovieAction(formData);

    if (result.success && result.data) {
      if (result.data.movieFound && result.data.movieTitle) {
        const newMovie: Movie = {
          movieTitle: result.data.movieTitle,
          movieDetails: result.data.movieDetails,
          moviePosterUrl: result.data.moviePosterUrl,
        };
        setCurrentMovie(newMovie);
        // Add to history only if it's a new movie
        if (!history.some(m => m.movieTitle === newMovie.movieTitle)) {
           setHistory((prevHistory) => [newMovie, ...prevHistory]);
        }
      } else {
        setMovieNotFound(true);
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'An unknown error occurred. Please try again.',
      });
    }

    setIsLoading(false);
    (event.target as HTMLFormElement).reset();
  };

  return (
    <div className="w-full max-w-3xl">
      <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-4">
        <div className="relative w-full">
          <Quote className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
          <Textarea
            name="description"
            placeholder="Describe the movie... e.g., 'A young boy finds an alien in his shed...'"
            className="h-24 pl-10 text-base resize-none"
            disabled={isLoading}
            required
            minLength={10}
            aria-label="Movie description"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          size="lg"
          className="h-12 w-full md:w-48"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Film />}
          <span className="ml-2">Identify Movie</span>
        </Button>
      </form>

      <div className="mt-8 min-h-[200px]">
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Analyzing... this may take a moment.
            </p>
          </div>
        )}
        {currentMovie && (
          <div
            className="animate-in fade-in-0 zoom-in-95 duration-500"
            key={currentMovie.movieTitle}
          >
            <MovieCard movie={currentMovie} isFeatured={true} />
          </div>
        )}
        {movieNotFound && (
          <div className="flex flex-col items-center justify-center gap-4 text-center animate-in fade-in-0 duration-500">
            <SearchX className="h-10 w-10 text-destructive" />
            <p className="text-muted-foreground">
              Could not identify a movie from your description. Please try being
              more specific.
            </p>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="mt-16">
          <div className="mb-6 flex items-center gap-3">
            <History className="h-6 w-6 text-primary" />
            <h2 className="font-headline text-3xl font-semibold tracking-tight">
              Your History
            </h2>
          </div>
          <Separator className="mb-8 bg-border/50" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((movie, index) => (
              <MovieCard key={`${movie.movieTitle}-${index}`} movie={movie} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
