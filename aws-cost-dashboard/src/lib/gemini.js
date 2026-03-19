const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GEMINI_API_KEY });

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

async function getInsightsFromGemini(services) {
    const prompt = buildPrompt(services);

    const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        max_tokens: 1024,
    });

    return completion.choices[0].message.content;
}

module.exports = { getInsightsFromGemini };