'use server';

import {
  identifyMovieFromYoutubeClip,
  IdentifyMovieOutput,
} from '@/ai/flows/identify-movie-from-youtube-clip';
import { z } from 'zod';

const schema = z.object({
  youtubeUrl: z.string().url({ message: 'Please enter a valid YouTube URL.' }),
});

type ActionResponse =
  | { success: true; data: IdentifyMovieOutput }
  | { success: false; error: string };

export async function identifyMovieAction(
  formData: FormData
): Promise<ActionResponse> {
  const youtubeUrl = formData.get('youtubeUrl') as string;

  const validation = schema.safeParse({ youtubeUrl });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  try {
    const result = await identifyMovieFromYoutubeClip({
      youtubeClipLink: validation.data.youtubeUrl,
    });
    // Ensure that if a movie poster is found, it's a valid URL
    if (result.moviePosterUrl && !result.moviePosterUrl.startsWith('http')) {
        result.moviePosterUrl = '';
    }
    return { success: true, data: result };
  } catch (error) {
    console.error('Error identifying movie:', error);
    return {
      success: false,
      error: 'AI analysis failed. Please check the link or try again later.',
    };
  }
}
