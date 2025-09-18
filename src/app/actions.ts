'use server';

import { identifyMovieFromDescription } from '@/ai/flows/identify-movie-from-description';
import { identifyMovieFromYouTubeClip } from '@/ai/flows/identify-movie-from-youtube-clip';
import { z } from 'zod';

const IdentifyMovieOutputSchema = z.object({
  movieFound: z.boolean(),
  movieTitle: z.string(),
  movieDetails: z.string(),
  moviePosterUrl: z.string(),
});
export type IdentifyMovieOutput = z.infer<typeof IdentifyMovieOutputSchema>;


type ActionResponse =
  | { success: true; data: IdentifyMovieOutput }
  | { success: false; error: string };

const sharedValidation = {
  movieFound: z.boolean(),
  movieTitle: z.string(),
  movieDetails: z.string(),
  moviePosterUrl: z.string(),
}

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

    let aiResult: IdentifyMovieOutput;

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
    
    // Ensure the poster URL is a valid http(s) URL before returning.
    if (aiResult.moviePosterUrl && !aiResult.moviePosterUrl.startsWith('http')) {
      aiResult.moviePosterUrl = '';
    }
    
    return { success: true, data: aiResult };
  } catch (error) {
    console.error('Error identifying movie:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      success: false,
      error: `AI analysis failed: ${errorMessage}`,
    };
  }
}
