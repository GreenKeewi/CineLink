'use server';
/**
 * @fileOverview Identifies a movie from a YouTube clip link or an uploaded video file.
 *
 * - identifyMovie - A function that takes a YouTube link or video data and identifies the movie.
 * - IdentifyMovieInput - The input type for the identifyMovie function.
 * - IdentifyMovieOutput - The return type for the identifyMovie function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyMovieInputSchema = z.object({
  source: z.union([
    z.object({
      type: z.literal('url'),
      url: z.string().describe('The YouTube clip link to identify the movie from.'),
    }),
    z.object({
      type: z.literal('video'),
      videoDataUri: z
        .string()
        .describe(
          "A video file of a movie clip, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  ]),
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
  prompt: `You are an expert movie identifier. You will be given a source which is either a YouTube clip or a direct video upload.
Your task is to accurately identify the movie from the provided source.

- To do this, you must analyze the video content itself, and if available, the video's title, description, and comments.
- If you can confidently identify the movie, set 'movieFound' to true.
- Provide the 'movieTitle'.
- Provide 'movieDetails', including the release year and a brief, one-sentence plot summary.
- You MUST find and provide a valid, public URL for the movie's poster image in 'moviePosterUrl'.
- If the source is invalid, not a movie clip, or you cannot confidently identify the movie, set 'movieFound' to false and return empty strings for the other fields.

{{#if (eq source.type "url")}}
YouTube Clip Link: {{{source.url}}}
{{/if}}
{{#if (eq source.type "video")}}
Video Content: {{media url=source.videoDataUri}}
{{/if}}
`,
});


const identifyMovieFlow = ai.defineFlow(
  {
    name: 'identifyMovieFlow',
    inputSchema: IdentifyMovieInputSchema,
    outputSchema: IdentifyMovieOutputSchema,
  },
  async input => {
    const {output} = await prompt({source: input.source});
    return output!;
  }
);
