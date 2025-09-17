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
  videoDataUri: z
    .string()
    .startsWith('data:video', { message: 'Invalid video file format.' }),
});

// This is a discriminated union. It will validate against one of the schemas based on the 'sourceType' field.
const inputSchema = z.discriminatedUnion('sourceType', [
  urlSchema,
  videoSchema,
]);

type ActionResponse =
  | { success: true; data: IdentifyMovieOutput }
  | { success: false; error: string };

export async function identifyMovieAction(
  formData: FormData
): Promise<ActionResponse> {
  const rawFormData = {
    sourceType: formData.get('sourceType'),
    youtubeUrl: formData.get('youtubeUrl'),
    videoDataUri: formData.get('videoDataUri'),
  };

  const validation = inputSchema.safeParse(rawFormData);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  let input: IdentifyMovieInput;

  if (validation.data.sourceType === 'url') {
    input = { source: { type: 'url', url: validation.data.youtubeUrl } };
  } else {
    input = { source: { type: 'video', videoDataUri: validation.data.videoDataUri } };
  }

  try {
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
