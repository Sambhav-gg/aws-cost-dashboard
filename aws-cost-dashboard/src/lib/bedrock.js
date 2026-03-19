const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({ region: "us-east-1" });

function buildPrompt(services) {
    const top10 = services.slice(0, 10);
    const total = services
        .reduce((sum, s) => sum + parseFloat(s.cost), 0)
        .toFixed(2);

    return `You are an AWS cost optimization expert. Analyze this AWS cost breakdown and provide actionable insights.

Total AWS spend this month: $${total}

Top services by cost:
${top10.map((s, i) => `${i + 1}. ${s.service}: $${s.cost}`).join("\n")}

Please provide:
1. A 2-3 sentence summary of the overall spend
2. Top 3 cost drivers and why they might be high
3. 3 specific actionable recommendations to reduce costs
4. Any unusual patterns or potential waste

Be specific, reference actual service names and dollar amounts. Keep it concise and practical.`;
}

async function getInsightsFromBedrock(services) {
    const prompt = buildPrompt(services);

    const response = await client.send(new InvokeModelCommand({
        modelId: "anthropic.claude-3-7-sonnet-20250219-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
        }),
    }));

    const result = JSON.parse(Buffer.from(response.body).toString());
    return result.content[0].text;
}

module.exports = { getInsightsFromBedrock };