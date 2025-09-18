'use server';

import { identifyMovieFromDescription } from '@/ai/flows/identify-movie-from-description';
import { z } from 'zod';

const IdentifyMovieInputSchema = z.object({
  description: z.string().min(10, { message: "Please provide a more detailed description." }),
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
    const description = formData.get('description');
    const result = IdentifyMovieInputSchema.safeParse({ description });
    
    if (!result.success) {
      return { success: false, error: result.error.errors[0].message };
    }

    const input: IdentifyMovieInput = { description: result.data.description };
    const aiResult = await identifyMovieFromDescription(input);

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
