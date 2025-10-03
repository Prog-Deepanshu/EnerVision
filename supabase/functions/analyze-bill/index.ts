import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const formData = await req.formData();
    const file = formData.get("bill");

    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const fileBytes = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBytes);

    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64Data = btoa(binary);

    let mimeType = file.type;
    if (mimeType === "application/pdf") {
      mimeType = "application/pdf";
    } else if (mimeType.startsWith("image/")) {
      mimeType = file.type;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid file type" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "").replace(/```\n?$/g, "");
    }

    const analysisResult = JSON.parse(jsonText);

    return new Response(JSON.stringify(analysisResult), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error analyzing bill:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to analyze bill",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});