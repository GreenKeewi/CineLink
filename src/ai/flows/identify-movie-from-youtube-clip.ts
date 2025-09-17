'use server';
/**
 * @fileOverview Identifies a movie from a YouTube clip link.
 *
 * - identifyMovie - A function that takes a YouTube link and identifies the movie.
 * - IdentifyMovieInput - The input type for the identifyMovie function.
 * - IdentifyMovieOutput - The return type for the identifyMovie function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyMovieInputSchema = z.object({
  youtubeUrl: z.string().describe('The YouTube clip link to identify the movie from.'),
});
export type IdentifyMovieInput = z.infer<typeof IdentifyMovieInputSchema>;

const IdentifyMovieOutputSchema = z.object({
  movieFound: z.boolean().describe('Whether a movie was successfully identified from the source.'),
  movieTitle: z.string().describe('The title of the identified movie. If not found, this will be an empty string.'),
  movieDetails: z.string().describe('Additional details about the identified movie (e.g., release year, a brief plot summary). If not found, this will be an empty string.'),
  moviePosterUrl: z.string().describe("A URL for the movie poster image. Use a public, directly accessible URL. If not found, this will be an empty string."),
});
export type IdentifyMovieOutput = z.infer<typeof IdentifyMovieOutputSchema>;


export async function identifyMovie(
  input: IdentifyMovieInput
): Promise<IdentifyMovieOutput> {
  return identifyMovieFlow(input);
}


const prompt = ai.definePrompt({
  name: 'identifyMoviePrompt',
  input: {schema: IdentifyMovieInputSchema},
  output: {schema: IdentifyMovieOutputSchema},
  prompt: `You are an expert movie identifier. You will be given a YouTube clip URL.
Your task is to accurately identify the movie from the provided source.

- To do this, you must analyze the video's title, description, and comments, in addition to the video content if possible from the URL.
- If you can confidently identify the movie, set 'movieFound' to true.
- Provide the 'movieTitle'.
- Provide 'movieDetails', including the release year and a brief, one-sentence plot summary.
- You MUST find and provide a valid, public URL for the movie's poster image in 'moviePosterUrl'.
- If the source is invalid, not a movie clip, or you cannot confidently identify the movie, set 'movieFound' to false and return empty strings for the other fields.

Source: YouTube Clip Link: {{{youtubeUrl}}}
`,
});


const identifyMovieFlow = ai.defineFlow(
  {
    name: 'identifyMovieFlow',
    inputSchema: IdentifyMovieInputSchema,
    outputSchema: IdentifyMovieOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
