'use client';

import { useState } from 'react';
import { identifyMovieAction, IdentifyMovieOutput } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Film, Loader2, History, SearchX, Quote, Youtube } from 'lucide-react';
import MovieCard from './movie-card';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from './ui/input';

export default function CineLinkMain() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentMovie, setCurrentMovie] = useState<IdentifyMovieOutput | null>(
    null
  );
  const [movieNotFound, setMovieNotFound] = useState(false);
  const [history, setHistory] = useState<IdentifyMovieOutput[]>([]);
  const [activeTab, setActiveTab] = useState('youtube');

  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setCurrentMovie(null);
    setMovieNotFound(false);

    const formData = new FormData(event.currentTarget);
    formData.append('inputType', activeTab);

    const result = await identifyMovieAction(formData);

    if (result.success && result.data) {
      if (result.data.movieFound && result.data.movieTitle) {
        const newMovie = result.data;
        setCurrentMovie(newMovie);
        // Add to history only if it's a new movie
        if (!history.some((m) => m.movieTitle === newMovie.movieTitle)) {
          setHistory((prevHistory) => [newMovie, ...prevHistory]);
        }
      } else {
        setMovieNotFound(true);
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          result.error || 'An unknown error occurred. Please try again.',
      });
    }

    setIsLoading(false);
    (event.target as HTMLFormElement).reset();
  };

  return (
    <div className="w-full max-w-3xl">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mb-6"
      >
        <TabsList className="grid w-full grid-cols-2 bg-card border">
          <TabsTrigger value="youtube">
            <Youtube className="mr-2" /> YouTube Link
          </TabsTrigger>
          <TabsTrigger value="description">
            <Quote className="mr-2" /> Describe
          </TabsTrigger>
        </TabsList>
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col items-center gap-4 mt-6"
        >
          <TabsContent value="description" className="w-full mt-0">
            <div className="relative w-full">
              <Textarea
                name="description"
                placeholder="e.g., 'A young boy finds an alien in his shed...'"
                className="h-28 resize-none rounded-xl border-2 bg-card p-4 text-base focus:bg-background"
                disabled={isLoading}
                required={activeTab === 'description'}
                minLength={10}
                aria-label="Movie description"
              />
            </div>
          </TabsContent>
          <TabsContent value="youtube" className="w-full mt-0">
            <div className="relative w-full">
              <Input
                name="youtubeUrl"
                type="url"
                placeholder="Paste a YouTube link here..."
                className="h-14 rounded-xl border-2 bg-card p-4 text-base focus:bg-background"
                disabled={isLoading}
                required={activeTab === 'youtube'}
                aria-label="YouTube URL"
              />
            </div>
          </TabsContent>
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="h-14 w-full md:w-56 text-base font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Film />}
            <span>Identify Movie</span>
          </Button>
        </form>
      </Tabs>

      <div className="mt-12 min-h-[450px]">
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
              Could not identify a movie. Please try being more specific or use a
              different clip.
            </p>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="mt-24">
          <div className="mb-6 flex items-center gap-3">
            <History className="h-6 w-6 text-primary" />
            <h2 className="font-headline text-3xl font-semibold tracking-tight">
              Your History
            </h2>
          </div>
          <Separator className="mb-8 bg-border/50" />
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((movie, index) => (
              <MovieCard key={`${movie.movieTitle}-${index}`} movie={movie} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
