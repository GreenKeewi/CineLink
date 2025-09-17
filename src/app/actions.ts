'use server';

import {
  identifyMovie,
  type IdentifyMovieInput,
  type IdentifyMovieOutput,
} from '@/ai/flows/identify-movie-from-youtube-clip';
import { z } from 'zod';


const urlSchema = z.object({
  sourceType: z.literal('url'),
  youtubeUrl: z.string().url({ message: 'Please enter a valid YouTube URL.' }),
});

const videoSchema = z.object({
  sourceType: z.literal('video'),
  videoDataUri: z.string().startsWith('data:video'),
});

type ActionResponse =
  | { success: true; data: IdentifyMovieOutput }
  | { success: false; error: string };

export async function identifyMovieAction(
  formData: FormData
): Promise<ActionResponse> {
  const sourceType = formData.get('sourceType') as 'url' | 'video';
  
  let input: IdentifyMovieInput;

  if (sourceType === 'url') {
    const youtubeUrl = formData.get('youtubeUrl') as string;
    const validation = urlSchema.safeParse({ sourceType, youtubeUrl });
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map((e) => e.message).join(', ') };
    }
    input = { source: { type: 'url', url: validation.data.youtubeUrl } };
  } else if (sourceType === 'video') {
    const videoDataUri = formData.get('videoDataUri') as string;
    const validation = videoSchema.safeParse({ sourceType, videoDataUri });
     if (!validation.success) {
      return { success: false, error: "Invalid video file provided." };
    }
    input = { source: { type: 'video', videoDataUri: validation.data.videoDataUri } };
  } else {
    return { success: false, error: 'Invalid source type.' };
  }

  try {
    const result = await identifyMovie(input);
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
