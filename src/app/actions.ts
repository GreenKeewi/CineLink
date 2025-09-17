'use server';

import {
  identifyMovie,
  type IdentifyMovieInput,
  type IdentifyMovieOutput,
} from '@/ai/flows/identify-movie-from-youtube-clip';
import { z } from 'zod';

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
    return {
      success: false,
      error: 'AI analysis failed. Please check your input or try again later.',
    };
  }
}
