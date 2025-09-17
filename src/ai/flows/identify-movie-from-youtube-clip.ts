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
  movieTitle: z.string().optional().describe('The title of the identified movie. Only present if movieFound is true.'),
  movieDetails: z.string().optional().describe('Additional details about the identified movie. Only present if movieFound is true.'),
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
Your task is to identify the movie from the clip.

- If you can confidently identify the movie, set 'movieFound' to true and provide the 'movieTitle' and 'movieDetails'.
- If the link is invalid, not a movie clip, or you cannot identify the movie, set 'movieFound' to false and omit the other fields. Do not guess.

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
