'use server';
/**
 * @fileOverview Identifies a movie from a user-provided YouTube clip.
 *
 * - identifyMovieFromYouTubeClip - A function that takes a YouTube URL and identifies the movie.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyMovieFromYouTubeClipInputSchema = z.object({
  youtubeUrl: z.string().url().describe('A URL to a YouTube clip of a movie.'),
});

const IdentifyMovieOutputSchema = z.object({
  movieFound: z.boolean().describe('Whether a movie was successfully identified from the clip.'),
  movieTitle: z.string().describe('The title of the identified movie. If not found, this will be an empty string.'),
  movieDetails: z.string().describe('Additional details about the identified movie (e.g., release year, a brief plot summary). If not found, this will be an empty string.'),
  tmdbPosterPath: z.string().describe("The poster path from The Movie Database (TMDb) for the identified movie (e.g., '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg'). If not found, this will be an empty string."),
  purchaseLinks: z.array(z.object({
    service: z.string().describe("The name of the service, e.g., 'Amazon Prime', 'Apple TV'."),
    url: z.string().url().describe("The URL to rent or buy the movie on that service. Use a search URL if a direct affiliate link isn't possible.")
  })).describe("A list of links to buy or rent the movie. Provide at least two if possible.")
});

export async function identifyMovieFromYouTubeClip(
  input: z.infer<typeof IdentifyMovieFromYouTubeClipInputSchema>
): Promise<z.infer<typeof IdentifyMovieOutputSchema>> {
  return identifyMovieFromYouTubeClipFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyMovieFromYouTubeClipPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: IdentifyMovieFromYouTubeClipInputSchema},
  output: {schema: IdentifyMovieOutputSchema},
  prompt: `You are an expert movie identifier. You will be given a YouTube video clip.
Your task is to accurately identify the movie from the provided clip.

- Analyze the video content for scenes, dialogue, characters, actors, and any other identifying details.
- If you can confidently identify the movie, set 'movieFound' to true.
- Provide the 'movieTitle'.
- Provide 'movieDetails', including the release year and a brief, one-sentence plot summary.
- You MUST find the movie on The Movie Database (TMDb) and provide its 'tmdbPosterPath'. This is the path to the poster image, not the full URL. For example: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg'.
- Find and provide 'purchaseLinks' for at least two major platforms (like Amazon Prime Video, Apple TV, Google Play) where the user can rent or buy the movie. Use search URLs if direct affiliate links cannot be found.
- If you cannot confidently identify the movie, set 'movieFound' to false and return empty strings and empty arrays for the other fields.

YouTube Clip: {{media url=youtubeUrl contentType='video/mp4'}}
`,
});

const identifyMovieFromYouTubeClipFlow = ai.defineFlow(
  {
    name: 'identifyMovieFromYouTubeClipFlow',
    inputSchema: IdentifyMovieFromYouTubeClipInputSchema,
    outputSchema: IdentifyMovieOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
