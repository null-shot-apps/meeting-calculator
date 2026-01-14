import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      jobTitle: string;
      location: string;
      experience?: string;
      companySize?: string;
      industry?: string;
    };
    const { jobTitle, location, experience, companySize, industry } = body;

    if (!jobTitle || !location) {
      return NextResponse.json(
        { error: 'Job title and location are required' },
        { status: 400 }
      );
    }

    // Use Anthropic Claude API for salary estimation
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const prompt = `You are a salary data expert. Estimate the median annual salary for the following role:

Job Title: ${jobTitle}
Location: ${location}
${experience ? `Experience Level: ${experience}` : ''}
${companySize ? `Company Size: ${companySize}` : ''}
${industry ? `Industry: ${industry}` : ''}

Provide:
1. Median annual salary (single number in USD)
2. Typical range (25th-75th percentile)
3. Confidence level (high/medium/low) based on how common this role/location combination is

Format response as JSON:
{
  "median_salary": 125000,
  "range_low": 105000,
  "range_high": 145000,
  "confidence": "high",
  "notes": "Based on 2024-2025 market data for tech industry"
}

Be realistic and use actual market data knowledge. If you're uncertain, indicate lower confidence.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get estimation from AI');
    }

    const data = await response.json() as {
      content: Array<{ text: string }>;
    };
    const content = data.content[0].text;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Salary estimation error:', error);
    return NextResponse.json(
      { error: 'Failed to estimate salary' },
      { status: 500 }
    );
  }
}



