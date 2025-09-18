'use server';
/**
 * @fileOverview Identifies a movie from a YouTube video clip.
 *
 * - identifyMovieFromYouTubeClip - A function that takes a YouTube URL and identifies the movie.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyMovieFromYouTubeInputSchema = z.object({
  youtubeUrl: z.string().url().describe('The URL of a YouTube video clip.'),
});

const IdentifyMovieFromYouTubeOutputSchema = z.object({
  movieFound: z.boolean().describe('Whether a movie was successfully identified from the video.'),
  movieTitle: z.string().describe('The title of the identified movie. If not found, this will be an empty string.'),
  movieDetails: z.string().describe('Additional details about the identified movie (e.g., release year, a brief plot summary). If not found, this will be an empty string.'),
  moviePosterUrl: z.string().describe("A URL for the movie poster image. Use a public, directly accessible URL from a reliable source like IMDb. If not found, this will be an empty string."),
  purchaseLinks: z.array(z.object({
    service: z.string().describe("The name of the service, e.g., 'Amazon Prime', 'Apple TV'."),
    url: z.string().url().describe("The URL to rent or buy the movie on that service. Use a search URL if a direct affiliate link isn't possible.")
  })).describe("A list of links to buy or rent the movie. Provide at least two if possible.")
});


export async function identifyMovieFromYouTubeClip(
  input: z.infer<typeof IdentifyMovieFromYouTubeInputSchema>
): Promise<z.infer<typeof IdentifyMovieFromYouTubeOutputSchema>> {
  return identifyMovieFromYouTubeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyMovieFromYouTubePrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: IdentifyMovieFromYouTubeInputSchema},
  output: {schema: IdentifyMovieFromYouTubeOutputSchema},
  prompt: `You are an expert movie identifier. You will be given a YouTube video.
Your task is to analyze the video content to accurately identify the movie it is from.

- Analyze the video for scenes, characters, dialogue, and any other identifying details.
- If you can confidently identify the movie, set 'movieFound' to true.
- Provide the 'movieTitle'.
- Provide 'movieDetails', including the release year and a brief, one-sentence plot summary.
- You MUST find and provide a valid, public URL for the movie's poster image in 'moviePosterUrl'. Prioritize getting the image from IMDb (Internet Movie Database).
- Find and provide 'purchaseLinks' for at least two major platforms (like Amazon Prime Video, Apple TV, Google Play) where the user can rent or buy the movie. Use search URLs if direct affiliate links cannot be found.
- If you cannot confidently identify the movie, set 'movieFound' to false and return empty strings and empty arrays for the other fields.

Video: {{media url=youtubeUrl contentType="video/mp4"}}
`,
});

const identifyMovieFromYouTubeFlow = ai.defineFlow(
  {
    name: 'identifyMovieFromYouTubeFlow',
    inputSchema: IdentifyMovieFromYouTubeInputSchema,
    outputSchema: IdentifyMovieFromYouTubeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
