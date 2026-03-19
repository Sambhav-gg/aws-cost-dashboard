# AWS Cost Dashboard

A production-grade serverless application that monitors your AWS spending in real time, visualizes cost breakdowns by service, and delivers AI-powered optimization recommendations using Groq's Llama 3.3 model.

![Stack](https://img.shields.io/badge/AWS-Serverless-orange) ![AI](https://img.shields.io/badge/AI-Groq%20Llama%203.3-blue) ![IaC](https://img.shields.io/badge/IaC-AWS%20SAM-yellow) ![License](https://img.shields.io/badge/license-MIT-green)

---

## What It Does

- Pulls your real AWS billing data from Cost Explorer and breaks it down by service
- Sends that data to Groq's Llama 3.3 model which returns a plain-English cost analysis with specific recommendations
- Caches everything in DynamoDB so the AI is called at most once per day
- Refreshes the cache automatically every morning at 6AM UTC via an EventBridge scheduler
- Displays everything on a clean React dashboard with charts, a cost table, and the AI insight panel

---

## Tech Stack

### Backend

| Service | Role |
|---|---|
| AWS Lambda | Three serverless functions — getCosts, getInsights, scheduledRefresh |
| API Gateway | REST API entry point with CORS — exposes /costs and /insights |
| DynamoDB | 24-hour cache for cost data and AI insights |
| Cost Explorer API | AWS native billing data API — grouped by service |
| EventBridge | Daily cron trigger at 6AM UTC to pre-warm cache |
| IAM | Least-privilege role per Lambda function |
| CloudWatch | Execution logs and monitoring |
| AWS SAM | Infrastructure as Code — full stack in one `template.yaml` |

### Frontend

| Tech | Role |
|---|---|
| React | UI |
| Recharts | Bar chart for cost by service |
| Axios | HTTP calls to API Gateway |
| ReactMarkdown | Renders AI response markdown |

### AI

| Service | Role |
|---|---|
| Groq API | Fast LLM inference |
| Llama 3.3 70B Versatile | Cost analysis and optimization recommendations |

---

## Architecture

```
Browser
   ↓
React (localhost dev / S3 + CloudFront prod)
   ↓
API Gateway  ──────────────────────────────┐
   ↓                                       ↓
getCosts Lambda                    getInsights Lambda
   ↓              ↓                        ↓              ↓
Cost Explorer   DynamoDB            Groq Llama 3.3    DynamoDB
API             (read/write cache)  (AI analysis)     (read/write cache)

EventBridge (6AM UTC daily)
   → scheduledRefresh Lambda
   → Cost Explorer → DynamoDB
   → Groq → DynamoDB
```

---

## Project Structure

```
aws-cost-dashboard/
├── src/
│   ├── handlers/
│   │   ├── getCosts.js           # Fetches and caches billing data
│   │   ├── getInsights.js        # Generates and caches AI analysis
│   │   └── scheduledRefresh.js   # Daily pre-warm of both caches
│   └── lib/
│       ├── costExplorer.js       # AWS Cost Explorer wrapper
│       ├── gemini.js             # Groq AI wrapper (Llama 3.3)
│       └── dynamo.js             # DynamoDB read/write helpers
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   └── components/
│   │       ├── CostChart.jsx     # Recharts bar chart
│   │       ├── InsightPanel.jsx  # AI insight panel
│   │       └── ServiceTable.jsx  # Cost breakdown table
│   ├── .env                      # API URL (not committed)
│   └── .env.example              # Template
├── template.yaml                 # SAM infrastructure definition
├── samconfig.toml                # SAM deploy config
└── .gitignore
```

---

## Prerequisites

- Node.js 20+
- AWS CLI — [install](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) + run `aws configure`
- AWS SAM CLI — [install](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- Groq API key — free at [console.groq.com](https://console.groq.com)
- AWS account with Cost Explorer activated

---

## Setup

### 1. Clone

```bash
git clone <your-repo-url>
cd aws-cost-dashboard
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Deploy to AWS

```bash
sam build
sam deploy --guided
```

Enter when prompted:

| Prompt | Value |
|---|---|
| Stack name | `aws-cost-dashboard` |
| Region | `us-east-1` (or your preferred region) |
| GeminiApiKey | Your Groq API key (`gsk_...`) |
| Confirm changes | `y` |
| Allow IAM role creation | `y` |
| Save to samconfig.toml | `y` |

Copy the `ApiEndpoint` URL from the deploy output.

### 4. Configure the frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Paste your API endpoint into `.env`:

```
REACT_APP_API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/Prod
```

### 5. Run

```bash
npm start
```

Opens at `http://localhost:3000`

---

## API Reference

### GET /costs

Returns current month's AWS spend grouped by service, sorted by cost descending.

**Response**
```json
{
  "source": "live",
  "data": [
    { "service": "Amazon EC2", "cost": "45.21", "unit": "USD" },
    { "service": "Amazon RDS", "cost": "22.78", "unit": "USD" },
    { "service": "AWS Lambda", "cost": "12.45", "unit": "USD" }
  ]
}
```

`source` is either `live` (fresh from Cost Explorer) or `cache` (served from DynamoDB).

### GET /insights

Returns an AI-generated cost analysis for the current month. Cached per day.

**Response**
```json
{
  "source": "live",
  "insight": "## AWS Cost Summary\n\nYour total spend this month is $101.13..."
}
```

---

## Environment Variables

### Frontend — `frontend/.env`

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | API Gateway endpoint from SAM deploy output |

### Backend — managed by SAM

| Variable | Description |
|---|---|
| `REPORTS_TABLE` | DynamoDB table name (injected automatically by SAM) |
| `GEMINI_API_KEY` | Groq API key (passed as encrypted SAM parameter) |

---

## Caching

| Data | Cache key | TTL |
|---|---|---|
| Cost breakdown | `costs-current-current` | 24 hours |
| AI insights | `insights-YYYY-MM-DD` | 24 hours |

The EventBridge scheduler runs `scheduledRefresh` at 6AM UTC every day, fetching fresh data and pre-generating the day's AI insight so the first user request of the day is instant.

---

## Useful Commands

```bash
# Redeploy after changes
sam build && sam deploy

# Redeploy with a new Groq API key
sam deploy --parameter-overrides GeminiApiKey=YOUR_NEW_KEY

# Stream live Lambda logs
sam logs -n GetCostsFunction --stack-name aws-cost-dashboard --tail
sam logs -n GetInsightsFunction --stack-name aws-cost-dashboard --tail

# Run Lambda functions locally (requires Docker)
sam local start-api

# Tear down the entire stack
sam delete --stack-name aws-cost-dashboard
```

---

## Running Cost Estimate

| Service | Monthly cost |
|---|---|
| Lambda | $0 — free tier covers 1M requests |
| API Gateway | $0 — free tier covers 1M requests |
| DynamoDB | $0 — free tier covers 25GB |
| Cost Explorer API | $0.01 per API request |
| EventBridge | $0 — free tier covers 14M events |
| Groq API | $0 — free tier |

**Total: under $1/month**

---

## Contributing

1. Fork the repo
2. Create a branch — `git checkout -b feature/your-feature`
3. Commit — `git commit -m "add your feature"`
4. Push — `git push origin feature/your-feature`
5. Open a pull request

---

## License

MIT
