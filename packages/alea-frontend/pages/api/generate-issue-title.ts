import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('Missing OPENAI_API_KEY');
}

const openai = new OpenAI({ apiKey });

export interface IssueClassification {
  title: string;
  category: 'CONTENT' | 'DISPLAY';
  type: 'ERROR' | 'SUGGESTION';
  isTypo: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { description, selectedText, context } = req.body;
  
  if (!description || !selectedText) {
    return res.status(400).send('Missing required fields');
  }

  const prompt = `
You are an assistant that analyzes user reports and generates issue classifications.
Your task is to:
1. Generate a concise issue title
2. Classify the issue category (CONTENT or DISPLAY)
3. Classify the issue type (ERROR or SUGGESTION)
4. Determine if it's a typo/spelling error

Context:
- Selected Text: ${selectedText}
- Description: ${description}
- Fragment context: ${JSON.stringify(context)}

Classification Guidelines:
- CONTENT: Issues related to information accuracy, missing content, typos, spelling errors, factual problems
- DISPLAY: Issues related to visual presentation, formatting, layout, rendering problems
- ERROR: Something is wrong/broken that needs to be fixed
- SUGGESTION: An improvement or enhancement recommendation
- isTypo: true if the issue is specifically about spelling, grammar, or typographical errors

Respond with a valid JSON object in this exact format:
{
  "title": "Brief descriptive title (max 60 characters)",
  "category": "CONTENT" or "DISPLAY",
  "type": "ERROR" or "SUGGESTION", 
  "isTypo": true or false
}

Keep the title neutral, readable by educators and developers, and don't repeat the user's words verbatim.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 150,
      response_format: { type: "json_object" }
    });
    const content = response.choices[0].message.content?.trim();
    if (!content) {
      throw new Error('No response content');
    }

    const classification: IssueClassification = JSON.parse(content);
    
    // Validate the response structure
    if (!classification.title || !classification.category || !classification.type) {
      throw new Error('Invalid classification response');
    }

    // Ensure valid enum values
    if (!['CONTENT', 'DISPLAY'].includes(classification.category)) {
      classification.category = 'CONTENT';
    }
    if (!['ERROR', 'SUGGESTION'].includes(classification.type)) {
      classification.type = 'ERROR';
    }

    // Clean up title
    classification.title = classification.title.replace(/^["']|["']$/g, '').substring(0, 60);

    res.status(200).json(classification);
  } catch (err) {
    console.error('Issue classification error:', err);
    res.status(500).json({ 
      title: 'Issue Classification Failed',
      category: 'CONTENT',
      type: 'ERROR',
      isTypo: false
    });
  }
}