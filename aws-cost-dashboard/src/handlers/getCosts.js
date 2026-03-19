const { getCostsByService } = require("../lib/costExplorer");
const { cacheReport, getCachedReport } = require("../lib/dynamo");

exports.handler = async (event) => {
  try {
    const params = event.queryStringParameters || {};
    const { startDate, endDate } = params;

    // Use today's date as cache key
    const cacheKey = `costs-${startDate || "current"}-${endDate || "current"}`;

    // Check cache first
    const cached = await getCachedReport(cacheKey);
    if (cached) {
      console.log("Returning cached cost data");
      return response(200, { source: "cache", data: cached });
    }

    // Fetch fresh data from Cost Explorer
    console.log("Fetching fresh cost data from Cost Explorer");
    const services = await getCostsByService(startDate, endDate);

    // Cache the result
    await cacheReport(cacheKey, services);

    return response(200, { source: "live", data: services });

  } catch (err) {
    console.error("getCosts error:", err);
    return response(500, { message: err.message });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}
// const { cacheReport, getCachedReport } = require("../lib/dynamo");

// const MOCK_DATA = [
//   { service: "AWS Lambda", cost: "12.4500", unit: "USD" },
//   { service: "Amazon DynamoDB", cost: "8.2300", unit: "USD" },
//   { service: "Amazon S3", cost: "5.1200", unit: "USD" },
//   { service: "Amazon API Gateway", cost: "3.8900", unit: "USD" },
//   { service: "Amazon EC2", cost: "45.2100", unit: "USD" },
//   { service: "Amazon RDS", cost: "22.7800", unit: "USD" },
//   { service: "AWS CloudFront", cost: "2.3400", unit: "USD" },
//   { service: "Amazon Bedrock", cost: "1.1200", unit: "USD" },
// ];

// exports.handler = async (event) => {
//   try {
//     const params = event.queryStringParameters || {};
//     const { startDate, endDate } = params;

//     const cacheKey = `costs-${startDate || "current"}-${endDate || "current"}`;

//     const cached = await getCachedReport(cacheKey);
//     if (cached) {
//       console.log("Returning cached cost data");
//       return response(200, { source: "cache", data: cached });
//     }

//     // Using mock data until Cost Explorer is active
//     const services = MOCK_DATA;

//     await cacheReport(cacheKey, services);

//     return response(200, { source: "mock", data: services });

//   } catch (err) {
//     console.error("getCosts error:", err);
//     return response(500, { message: err.message });
//   }
// };

// function response(statusCode, body) {
//   return {
//     statusCode,
//     headers: {
//       "Content-Type": "application/json",
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Headers": "Content-Type",
//       "Access-Control-Allow-Methods": "GET,OPTIONS",
//     },
//     body: JSON.stringify(body),
//   };
// }