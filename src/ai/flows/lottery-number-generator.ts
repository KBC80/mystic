// Lottery number generator flow.

'use server';

/**
 * @fileOverview Generates a set of lucky lottery numbers.
 *
 * - generateLotteryNumbers - A function that generates lucky lottery numbers.
 * - GenerateLotteryNumbersInput - The input type for the generateLotteryNumbers function.
 * - GenerateLotteryNumbersOutput - The return type for the generateLotteryNumbers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLotteryNumbersInputSchema = z.object({
  method: z
    .enum(['numerology', 'aiDriven', 'random'])
    .describe('The method to use for generating the lottery numbers.'),
  numberOfNumbers: z.number().min(1).max(10).describe('The number of lottery numbers to generate.'),
  maxNumber: z.number().min(1).max(99).describe('The maximum possible lottery number.'),
});
export type GenerateLotteryNumbersInput = z.infer<typeof GenerateLotteryNumbersInputSchema>;

const GenerateLotteryNumbersOutputSchema = z.object({
  numbers: z.array(z.number()).describe('The generated lottery numbers.'),
});
export type GenerateLotteryNumbersOutput = z.infer<typeof GenerateLotteryNumbersOutputSchema>;

export async function generateLotteryNumbers(input: GenerateLotteryNumbersInput): Promise<GenerateLotteryNumbersOutput> {
  return generateLotteryNumbersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'lotteryNumberGeneratorPrompt',
  input: {schema: GenerateLotteryNumbersInputSchema},
  output: {schema: GenerateLotteryNumbersOutputSchema},
  prompt: `You are a lottery number expert. You will generate {{numberOfNumbers}} lucky lottery numbers, between 1 and {{maxNumber}}, using the {{method}} method.\n\nNumbers: `,
});

const generateLotteryNumbersFlow = ai.defineFlow(
  {
    name: 'generateLotteryNumbersFlow',
    inputSchema: GenerateLotteryNumbersInputSchema,
    outputSchema: GenerateLotteryNumbersOutputSchema,
  },
  async input => {
    if (input.method === 'random') {
      const numbers: number[] = [];
      for (let i = 0; i < input.numberOfNumbers; i++) {
        numbers.push(Math.floor(Math.random() * input.maxNumber) + 1);
      }
      return {numbers};
    } else {
      const {output} = await prompt(input);
      return output!;
    }
  }
);
