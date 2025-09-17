'use server';
/**
 * @fileOverview Identifies a movie from a YouTube clip link.
 *
 * - identifyMovieFromYoutubeClip - A function that takes a YouTube clip link and identifies the movie.
 * - IdentifyMovieInput - The input type for the identifyMovieFromYoutubeClip function.
 * - IdentifyMovieOutput - The return type for the identifyMovieFromYoutubeClip function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyMovieInputSchema = z.object({
  youtubeClipLink: z.string().describe('The YouTube clip link to identify the movie from.'),
});
export type IdentifyMovieInput = z.infer<typeof IdentifyMovieInputSchema>;

const IdentifyMovieOutputSchema = z.object({
  movieFound: z.boolean().describe('Whether a movie was successfully identified from the clip.'),
  movieTitle: z.string().describe('The title of the identified movie. If not found, this will be an empty string.'),
  movieDetails: z.string().describe('Additional details about the identified movie (e.g., release year). If not found, this will be an empty string.'),
  moviePosterUrl: z.string().describe('A URL for the movie poster image. If not found, this will be an empty string.'),
});
export type IdentifyMovieOutput = z.infer<typeof IdentifyMovieOutputSchema>;

export async function identifyMovieFromYoutubeClip(input: IdentifyMovieInput): Promise<IdentifyMovieOutput> {
  return identifyMovieFlow(input);
}

const identifyMoviePrompt = ai.definePrompt({
  name: 'identifyMoviePrompt',
  input: {schema: IdentifyMovieInputSchema},
  output: {schema: IdentifyMovieOutputSchema},
  prompt: `You are an expert movie identifier. You will be given a YouTube clip link.
Your task is to accurately identify the movie from the clip. To do this, you must analyze the video content, the video's title, description, and comments.

- If you can confidently identify the movie, set 'movieFound' to true.
- Provide the 'movieTitle' and 'movieDetails' (including the release year).
- You MUST find and provide a URL for the movie's poster image in 'moviePosterUrl'.
- If the link is invalid, not a movie clip, or you cannot confidently identify the movie, set 'movieFound' to false and return empty strings for the other fields.

YouTube Clip Link: {{{youtubeClipLink}}}`,
});

const identifyMovieFlow = ai.defineFlow(
  {
    name: 'identifyMovieFlow',
    inputSchema: IdentifyMovieInputSchema,
    outputSchema: IdentifyMovieOutputSchema,
  },
  async input => {
    const {output} = await identifyMoviePrompt(input);
    return output!;
  }
);
