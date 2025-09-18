'use server';

import { identifyMovieFromDescription } from '@/ai/flows/identify-movie-from-description';
import { identifyMovieFromYouTubeClip } from '@/ai/flows/identify-movie-from-youtube-clip';
import { z } from 'zod';

const IdentifyMovieOutputSchema = z.object({
  movieFound: z.boolean(),
  movieTitle: z.string(),
  movieDetails: z.string(),
  moviePosterUrl: z.string(),
  purchaseLinks: z.array(z.object({
    service: z.string(),
    url: z.string().url(),
  })).optional(),
});
export type IdentifyMovieOutput = z.infer<typeof IdentifyMovieOutputSchema>;


type ActionResponse =
  | { success: true; data: IdentifyMovieOutput }
  | { success: false; error: string };


const DescriptionInputSchema = z.object({
  description: z.string().min(10, { message: "Please provide a more detailed description." }),
});

const YouTubeInputSchema = z.object({
  youtubeUrl: z.string().url({ message: "Please provide a valid YouTube URL." }),
});


export async function identifyMovieAction(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const inputType = formData.get('inputType');

    let aiResult;

    if (inputType === 'description') {
      const description = formData.get('description');
      const result = DescriptionInputSchema.safeParse({ description });
      if (!result.success) {
        return { success: false, error: result.error.errors[0].message };
      }
      aiResult = await identifyMovieFromDescription({ description: result.data.description });
    } else if (inputType === 'youtube') {
      const youtubeUrl = formData.get('youtubeUrl');
      const result = YouTubeInputSchema.safeParse({ youtubeUrl });
       if (!result.success) {
        return { success: false, error: result.error.errors[0].message };
      }
      aiResult = await identifyMovieFromYouTubeClip({ youtubeUrl: result.data.youtubeUrl });
    } else {
       return { success: false, error: 'Invalid input type.' };
    }
    
    // Construct the poster URL from the TMDb path
    let moviePosterUrl = '';
    if (aiResult.tmdbPosterPath) {
        moviePosterUrl = `https://image.tmdb.org/t/p/w500${aiResult.tmdbPosterPath}`;
    }

    const responseData: IdentifyMovieOutput = {
        movieFound: aiResult.movieFound,
        movieTitle: aiResult.movieTitle,
        movieDetails: aiResult.movieDetails,
        moviePosterUrl: moviePosterUrl,
        purchaseLinks: aiResult.purchaseLinks
    }
    
    return { success: true, data: responseData };
  } catch (error) {
    console.error('Error identifying movie:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      success: false,
      error: `AI analysis failed: ${errorMessage}`,
    };
  }
}
