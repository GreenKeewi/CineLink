'use server';
/**
 * @fileOverview Identifies a movie from a user-provided description.
 *
 * - identifyMovieFromDescription - A function that takes a description and identifies the movie.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyMovieInputSchema = z.object({
  description: z.string().describe('A text description of a movie, including plot points, characters, or scenes.'),
});

const IdentifyMovieOutputSchema = z.object({
  movieFound: z.boolean().describe('Whether a movie was successfully identified from the description.'),
  movieTitle: z.string().describe('The title of the identified movie. If not found, this will be an empty string.'),
  movieDetails: z.string().describe('Additional details about the identified movie (e.g., release year, a brief plot summary). If not found, this will be an empty string.'),
  moviePosterUrl: z.string().describe("A URL for the movie poster image. Use a public, directly accessible URL from a reliable source like IMDb. If not found, this will be an empty string."),
  purchaseLinks: z.array(z.object({
    service: z.string().describe("The name of the service, e.g., 'Amazon Prime', 'Apple TV'."),
    url: z.string().url().describe("The URL to rent or buy the movie on that service. Use a search URL if a direct affiliate link isn't possible.")
  })).describe("A list of links to buy or rent the movie. Provide at least two if possible.")
});

export async function identifyMovieFromDescription(
  input: z.infer<typeof IdentifyMovieInputSchema>
): Promise<z.infer<typeof IdentifyMovieOutputSchema>> {
  return identifyMovieFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyMovieFromDescriptionPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: IdentifyMovieInputSchema},
  output: {schema: IdentifyMovieOutputSchema},
  prompt: `You are an expert movie identifier. You will be given a text description of a movie.
Your task is to accurately identify the movie from the provided description.

- Analyze the user's description for plot points, characters, actors, and any other identifying details.
- If you can confidently identify the movie, set 'movieFound' to true.
- Provide the 'movieTitle'.
- Provide 'movieDetails', including the release year and a brief, one-sentence plot summary.
- You MUST find and provide a valid, public URL for the movie's poster image in 'moviePosterUrl'. Prioritize getting the image from IMDb (Internet Movie Database).
- Find and provide 'purchaseLinks' for at least two major platforms (like Amazon Prime Video, Apple TV, Google Play) where the user can rent or buy the movie. Use search URLs if direct affiliate links cannot be found.
- If you cannot confidently identify the movie, set 'movieFound' to false and return empty strings and empty arrays for the other fields.

Description: {{{description}}}
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
