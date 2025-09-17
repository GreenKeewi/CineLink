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
  movieTitle: z.string().describe('The title of the identified movie.'),
  movieDetails: z.string().describe('Additional details about the identified movie.'),
});
export type IdentifyMovieOutput = z.infer<typeof IdentifyMovieOutputSchema>;

export async function identifyMovieFromYoutubeClip(input: IdentifyMovieInput): Promise<IdentifyMovieOutput> {
  return identifyMovieFlow(input);
}

const identifyMoviePrompt = ai.definePrompt({
  name: 'identifyMoviePrompt',
  input: {schema: IdentifyMovieInputSchema},
  output: {schema: IdentifyMovieOutputSchema},
  prompt: `You are an expert movie identifier. You will identify the movie from the given YouTube clip link.

YouTube Clip Link: {{{youtubeClipLink}}}

Identify the movie and provide its title and details.`,
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
