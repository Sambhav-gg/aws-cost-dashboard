// const { getCostsByService } = require("../lib/costExplorer");
// const { getInsightsFromGemini } = require("../lib/gemini");
const { cacheReport } = require("../lib/dynamo");

const MOCK_DATA = [
    { service: "AWS Lambda", cost: "12.4500", unit: "USD" },
    { service: "Amazon DynamoDB", cost: "8.2300", unit: "USD" },
    { service: "Amazon S3", cost: "5.1200", unit: "USD" },
    { service: "Amazon API Gateway", cost: "3.8900", unit: "USD" },
    { service: "Amazon EC2", cost: "45.2100", unit: "USD" },
    { service: "Amazon RDS", cost: "22.7800", unit: "USD" },
    { service: "AWS CloudFront", cost: "2.3400", unit: "USD" },
    { service: "Amazon Bedrock", cost: "1.1200", unit: "USD" },
];

const MOCK_INSIGHT = `## AWS Cost Summary

Your total AWS spend this month is **$101.13** across 8 services.

### Top 3 Cost Drivers
1. **Amazon EC2 ($45.21)** — Likely from running instances 24/7.
2. **Amazon RDS ($22.78)** — Database costs can be optimized by right-sizing.
3. **AWS Lambda ($12.45)** — Review function memory allocation.

### Recommendations
1. Enable EC2 Auto Scaling to match demand.
2. Use S3 Intelligent-Tiering for infrequently accessed data.
3. Review API Gateway caching to reduce Lambda invocations.`;

exports.handler = async () => {
    try {
        const today = new Date().toISOString().split("T")[0];

        console.log("Scheduled refresh started:", today);

        // Fetch fresh cost data
        console.log("Fetching cost data...");
        // const services = await getCostsByService();
        const services = MOCK_DATA;

        if (!services || services.length === 0) {
            console.log("No cost data found, skipping refresh");
            return { status: "skipped", reason: "no data" };
        }

        // Cache fresh cost data
        await cacheReport(`costs-current-current`, services);
        console.log("Cost data cached successfully");

        // Generate fresh AI insights
        console.log("Generating AI insights...");
        // const insight = await getInsightsFromGemini(services);
        const insight = MOCK_INSIGHT;

        // Cache fresh insights
        await cacheReport(`insights-${today}`, insight);
        console.log("Insights cached successfully");

        console.log("Scheduled refresh completed successfully");
        return { status: "success", date: today };

    } catch (err) {
        console.error("Scheduled refresh error:", err);
        return { status: "error", message: err.message };
    }
};