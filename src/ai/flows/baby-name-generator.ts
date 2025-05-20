// src/ai/flows/baby-name-generator.ts
'use server';

/**
 * @fileOverview A baby name generator AI agent.
 *
 * - generateBabyNames - A function that generates a list of baby names with good meanings.
 * - GenerateBabyNamesInput - The input type for the generateBabyNames function.
 * - GenerateBabyNamesOutput - The return type for the generateBabyNames function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBabyNamesInputSchema = z.object({
  gender: z.enum(['male', 'female', 'any']).describe('The gender of the baby.'),
  length: z
    .enum(['short', 'medium', 'long', 'any'])
    .describe('The desired length of the name.'),
  culturalOrigin: z
    .string()
    .describe('The cultural origin of the name (e.g., Japanese, Irish, etc.).'),
  quantity: z
    .number()
    .min(1)
    .max(10)
    .default(3)
    .describe('How many names should be generated?'),
});

export type GenerateBabyNamesInput = z.infer<typeof GenerateBabyNamesInputSchema>;

const GenerateBabyNamesOutputSchema = z.object({
  names: z.array(
    z.object({
      name: z.string().describe('The generated baby name.'),
      meaning: z.string().describe('The meaning of the name.'),
    })
  ).describe('A list of baby names with their meanings.'),
});

export type GenerateBabyNamesOutput = z.infer<typeof GenerateBabyNamesOutputSchema>;

export async function generateBabyNames(input: GenerateBabyNamesInput): Promise<GenerateBabyNamesOutput> {
  return generateBabyNamesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBabyNamesPrompt',
  input: {schema: GenerateBabyNamesInputSchema},
  output: {schema: GenerateBabyNamesOutputSchema},
  prompt: `You are an expert in generating baby names with good meanings based on numerological principles and cultural origins.

  Generate a list of {{quantity}} baby names based on the following criteria:

  Gender: {{gender}}
  Length: {{length}}
  Cultural Origin: {{culturalOrigin}}

  Each name in the list should have a positive and auspicious meaning, reflecting good fortune and positive attributes.
  Return the names as a JSON array of objects.
  `,
});

const generateBabyNamesFlow = ai.defineFlow(
  {
    name: 'generateBabyNamesFlow',
    inputSchema: GenerateBabyNamesInputSchema,
    outputSchema: GenerateBabyNamesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
