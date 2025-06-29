import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('Missing OPENAI_API_KEY');
}

const openai = new OpenAI({ apiKey });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { description, selectedText, category, context } = req.body;

  const prompt = `
You are an assistant that writes concise GitHub issue titles.

Context:
- Category: ${category}
- Selected Text: ${selectedText}
- Description: ${description}
- Fragment context: ${JSON.stringify(context)}

Write a 1-line GitHub issue title describing the core issue or suggestion.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const title = response.choices[0].message.content?.trim().replace(/^["']|["']$/g, '') || 'Untitled Issue';
    res.status(200).json({ title });
  } catch (err) {
    console.error(err);
    res.status(500).json({ title: 'Title Generation Failed' });
  }
}
