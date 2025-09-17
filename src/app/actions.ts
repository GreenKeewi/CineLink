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
  const sourceType = formData.get('sourceType');

  let input: IdentifyMovieInput = {};

  try {
    if (sourceType === 'url') {
      const youtubeUrl = formData.get('youtubeUrl');
      const result = z.string().url().safeParse(youtubeUrl);
      if (!result.success) {
        return { success: false, error: 'Please enter a valid YouTube URL.' };
      }
      input = { youtubeUrl: result.data };
    } else if (sourceType === 'video') {
      const videoDataUri = formData.get('videoDataUri') as string | null;

      if (!videoDataUri || !videoDataUri.startsWith('data:video')) {
         return { success: false, error: 'Invalid video file format or file is missing.' };
      }
      input = { videoDataUri: videoDataUri };
    } else {
      return { success: false, error: 'Invalid source type specified.' };
    }

    const result = await identifyMovie(input);
    // Ensure the poster URL is a valid http(s) URL before returning.
    if (result.moviePosterUrl && !result.moviePosterUrl.startsWith('http')) {
      result.moviePosterUrl = '';
    }
    return { success: true, data: result };
  } catch (error) {
    console.error('Error identifying movie:', error);
    return {
      success: false,
      error: 'AI analysis failed. Please check your input or try again later.',
    };
  }
}
