// src/ai/flows/personalized-horoscopes.ts
'use server';
/**
 * @fileOverview A personalized horoscope AI agent.
 *
 * - personalizedHoroscope - A function that generates a personalized horoscope.
 * - PersonalizedHoroscopeInput - The input type for the personalizedHoroscope function.
 * - PersonalizedHoroscopeOutput - The return type for the personalizedHoroscope function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedHoroscopeInputSchema = z.object({
  birthDate: z
    .string()
    .describe('The birth date of the user in ISO format (YYYY-MM-DD).'),
  zodiacSign: z.string().describe('The zodiac sign of the user.'),
});
export type PersonalizedHoroscopeInput = z.infer<
  typeof PersonalizedHoroscopeInputSchema
>;

const PersonalizedHoroscopeOutputSchema = z.object({
  horoscope: z.string().describe('The personalized horoscope for the user.'),
});
export type PersonalizedHoroscopeOutput = z.infer<
  typeof PersonalizedHoroscopeOutputSchema
>;

export async function personalizedHoroscope(
  input: PersonalizedHoroscopeInput
): Promise<PersonalizedHoroscopeOutput> {
  return personalizedHoroscopeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedHoroscopePrompt',
  input: {schema: PersonalizedHoroscopeInputSchema},
  output: {schema: PersonalizedHoroscopeOutputSchema},
  prompt: `You are an astrologer providing personalized horoscopes. Generate a horoscope for the user with the following information:

Birth Date: {{{birthDate}}}
Zodiac Sign: {{{zodiacSign}}}

Horoscope:`,
});

const personalizedHoroscopeFlow = ai.defineFlow(
  {
    name: 'personalizedHoroscopeFlow',
    inputSchema: PersonalizedHoroscopeInputSchema,
    outputSchema: PersonalizedHoroscopeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
