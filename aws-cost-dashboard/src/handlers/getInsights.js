const { getCostsByService } = require("../lib/costExplorer");
const { getInsightsFromGemini } = require("../lib/gemini");
const { cacheReport, getCachedReport } = require("../lib/dynamo");

exports.handler = async (event) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const cacheKey = `insights-${today}`;

    // Check cache first
    const cached = await getCachedReport(cacheKey);
    if (cached) {
      console.log("Returning cached insights");
      return response(200, { source: "cache", insight: cached });
    }

    // Fetch REAL cost data from Cost Explorer
    console.log("Fetching real cost data for AI analysis...");
    const services = await getCostsByService();

    if (!services || services.length === 0) {
      return response(200, {
        insight: "No cost data available yet. Cost Explorer may still be activating on your account (takes up to 24hrs)."
      });
    }

    // Send to Gemini for analysis
    console.log("Sending to Gemini for insights...");
    const insight = await getInsightsFromGemini(services);

    // Cache for 24hrs
    await cacheReport(cacheKey, insight);

    return response(200, { source: "live", insight });

  } catch (err) {
    console.error("getInsights error:", err);

    // If Cost Explorer not ready yet, return helpful message
    if (err.message?.includes("time period")) {
      return response(200, {
        source: "error",
        insight: "Cost Explorer data is not available yet. Your account is new — data should appear within 24 hours."
      });
    }

    return response(500, { message: err.message });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
    },
    body: JSON.stringify(body),
  };
}