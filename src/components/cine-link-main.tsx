'use client';

import { useState, useRef } from 'react';
import { identifyMovieAction } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Film, Loader2, Link as LinkIcon, History, SearchX, Upload, Video } from 'lucide-react';
import MovieCard from './movie-card';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from '@/hooks/use-toast';
import { Label } from './ui/label';

type Movie = {
  movieTitle: string;
  movieDetails: string;
  moviePosterUrl: string;
};

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function CineLinkMain() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [movieNotFound, setMovieNotFound] = useState(false);
  const [history, setHistory] = useState<Movie[]>([]);
  const [activeTab, setActiveTab] = useState('url');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: `Please select a file smaller than ${MAX_FILE_SIZE_MB}MB.`,
        });
        setVideoFile(null);
        setVideoPreview(null);
        event.target.value = ''; // Clear the input
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    } else {
      setVideoFile(null);
      setVideoPreview(null);
    }
  };


  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setCurrentMovie(null);
    setMovieNotFound(false);

    const formData = new FormData(event.currentTarget);

    if (activeTab === 'video' && videoFile) {
      try {
        const videoDataUri = await fileToDataUri(videoFile);
        formData.set('sourceType', 'video');
        formData.set('videoDataUri', videoDataUri);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not process video file.' });
        setIsLoading(false);
        return;
      }
    } else {
       formData.set('sourceType', 'url');
    }

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
    // Reset form for next use
    formRef.current?.reset();
    setVideoFile(null);
    setVideoPreview(null);
  };

  return (
    <div className="w-full max-w-3xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url"><LinkIcon className="mr-2" />From URL</TabsTrigger>
          <TabsTrigger value="video"><Upload className="mr-2" />Upload Video</TabsTrigger>
        </TabsList>
        <form ref={formRef} onSubmit={handleSubmit} className="mt-4">
          <TabsContent value="url">
              <div className="relative w-full flex-grow">
                <LinkIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="youtubeUrl"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="h-12 pl-10 text-base"
                  disabled={isLoading}
                  aria-label="YouTube clip URL"
                />
              </div>
          </TabsContent>
          <TabsContent value="video">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="video-file">Video Clip</Label>
              <Input id="video-file" name="videoFile" type="file" accept="video/*" onChange={handleFileChange} disabled={isLoading}/>
            </div>
             {videoPreview && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Video Preview:</p>
                <video src={videoPreview} controls className="w-full max-h-60 rounded-md bg-muted"></video>
              </div>
            )}
          </TabsContent>

          <Button
            type="submit"
            disabled={isLoading || (activeTab === 'video' && !videoFile)}
            size="lg"
            className="h-12 w-full mt-4"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Film />}
            <span className="ml-2">Identify Movie</span>
          </Button>
        </form>
      </Tabs>


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
              Could not identify a movie from the provided source. Please try a
              different one.
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
