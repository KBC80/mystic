// Dream interpretation flow using Genkit and Gemini.

'use server';

/**
 * @fileOverview Dream interpretation AI agent.
 *
 * - dreamInterpretation - A function that handles the dream interpretation process.
 * - DreamInterpretationInput - The input type for the dreamInterpretation function.
 * - DreamInterpretationOutput - The return type for the dreamInterpretation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DreamInterpretationInputSchema = z.object({
  dreamText: z.string().describe('The text describing the dream to be interpreted.'),
});
export type DreamInterpretationInput = z.infer<typeof DreamInterpretationInputSchema>;

const DreamInterpretationOutputSchema = z.object({
  interpretation: z.string().describe('The interpretation of the dream.'),
});
export type DreamInterpretationOutput = z.infer<typeof DreamInterpretationOutputSchema>;

export async function dreamInterpretation(input: DreamInterpretationInput): Promise<DreamInterpretationOutput> {
  return dreamInterpretationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dreamInterpretationPrompt',
  input: {schema: DreamInterpretationInputSchema},
  output: {schema: DreamInterpretationOutputSchema},
  prompt: `You are a dream interpreter. A user will provide you with a description of their dream, and you will provide an interpretation of the dream.

Dream: {{{dreamText}}}`,
});

const dreamInterpretationFlow = ai.defineFlow(
  {
    name: 'dreamInterpretationFlow',
    inputSchema: DreamInterpretationInputSchema,
    outputSchema: DreamInterpretationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
