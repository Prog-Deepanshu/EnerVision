import { GoogleGenerativeAI } from '@google/generative-ai';
import { BillAnalysisResult } from '../types/bill';

export async function analyzeBill(file: File): Promise<BillAnalysisResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'AIzaSyDpL6AGWvhpJyEkoDreRJ-rQ6iGgfcfZyg') {
    throw new Error('Please configure your Gemini API key in the .env file');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-exp' });

  const fileBytes = await file.arrayBuffer();
  const base64Data = arrayBufferToBase64(fileBytes);

  let mimeType = file.type;
  if (!mimeType || (!mimeType.startsWith('image/') && mimeType !== 'application/pdf')) {
    throw new Error('Invalid file type. Please upload an image or PDF.');
  }

  const prompt = `You are an expert energy analyst. Analyze this electricity bill and extract the following information in JSON format:

{
  "billInfo": {
    "billingPeriod": "<start date> to <end date>",
    "unitsConsumed": <number in kWh>,
    "totalAmount": <number>,
    "currency": "<currency symbol or code>",
    "tariffType": "<residential/commercial/etc>"
  },
  "analysis": {
    "averageDailyUsage": <units consumed / days in billing period>,
    "comparisonWithPrevious": {
      "change": <percentage change, positive or negative>,
      "trend": "<increase/decrease/stable>"
    },
    "yearlyProjection": {
      "units": <estimated annual consumption>,
      "cost": <estimated annual cost>
    }
  },
  "solarSuggestion": {
    "recommendedSystemSize": <kW capacity based on consumption>,
    "estimatedPanels": <number of 400W panels needed>,
    "estimatedCost": <system cost in local currency>,
    "paybackPeriod": <years to break even>
  },
  "recommendations": [
    "<personalized recommendation 1 based on usage pattern>",
    "<personalized recommendation 2>",
    "<personalized recommendation 3>",
    "<personalized recommendation 4>"
  ],
  "savingsWithSolar": {
    "monthlyBillWithoutSolar": <current monthly bill>,
    "monthlyBillWithSolar": <projected bill with solar, typically 20-30% of current>,
    "monthlySavings": <difference>,
    "annualSavings": <monthly savings * 12>
  }
}

IMPORTANT:
- Extract actual data from the bill
- Make recommendations specific to this user's consumption pattern (not generic advice)
- Calculate solar system size based on their actual usage
- If comparison data is not available in the bill, omit the comparisonWithPrevious field
- Ensure all numbers are realistic and based on the bill data
- Return ONLY valid JSON, no markdown formatting or code blocks`;

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    },
    prompt,
  ]);

  const response = result.response;
  const text = response.text();

  let jsonText = text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
  }

  const analysisResult = JSON.parse(jsonText);
  return analysisResult;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;

  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}
