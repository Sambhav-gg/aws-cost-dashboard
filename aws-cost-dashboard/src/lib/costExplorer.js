const { CostExplorerClient, GetCostAndUsageCommand } = require("@aws-sdk/client-cost-explorer");

const client = new CostExplorerClient({ region: "us-east-1" });

function getTodayDate() {
    return new Date().toISOString().split("T")[0];
}

function getFirstDayOfMonth() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

async function getCostsByService(startDate, endDate) {
    const params = {
        TimePeriod: {
            Start: startDate || getFirstDayOfMonth(),
            End: endDate || getTodayDate(),
        },
        Granularity: "MONTHLY",
        GroupBy: [{ Type: "DIMENSION", Key: "SERVICE" }],
        Metrics: ["BlendedCost"],
    };

    const data = await client.send(new GetCostAndUsageCommand(params));

    // Flatten into a clean array
    const services = [];
    for (const result of data.ResultsByTime) {
        for (const group of result.Groups) {
            services.push({
                service: group.Keys[0],
                cost: parseFloat(group.Metrics.BlendedCost.Amount).toFixed(4),
                unit: group.Metrics.BlendedCost.Unit,
                period: result.TimePeriod,
            });
        }
    }

    // Sort by cost descending
    return services.sort((a, b) => b.cost - a.cost);
}

module.exports = { getCostsByService };