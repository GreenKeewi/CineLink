'use server';

import { identifyMovie } from '@/ai/flows/identify-movie-from-youtube-clip';
import { z } from 'zod';

// Define the input and output types here, based on the AI flow's schemas.
// This keeps the "use server" file clean of non-function exports.
const IdentifyMovieInputSchema = z.object({
  youtubeUrl: z.string(),
});
export type IdentifyMovieInput = z.infer<typeof IdentifyMovieInputSchema>;

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

export async function identifyMovieAction(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const youtubeUrl = formData.get('youtubeUrl');
    const result = z.string().url().safeParse(youtubeUrl);
    
    if (!result.success) {
      return { success: false, error: 'Please enter a valid YouTube URL.' };
    }

    const input: IdentifyMovieInput = { youtubeUrl: result.data };
    const aiResult = await identifyMovie(input);

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
