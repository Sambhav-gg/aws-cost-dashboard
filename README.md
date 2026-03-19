# AWS Cost Dashboard with AI Insights

A serverless AWS cost monitoring dashboard powered by Groq AI (Llama 3.3) that fetches real billing data, generates actionable cost optimization insights, and visualizes spending across AWS services.

---

## Features

- Real-time AWS cost breakdown by service
- AI-generated cost analysis and optimization recommendations (Groq · Llama 3.3)
- Service cost comparison bar chart with color coding
- Cost share progress table with percentage breakdown
- 24-hour DynamoDB caching to minimize API calls and AI costs
- Daily automated cache refresh via EventBridge scheduler

---

## Tech Stack

### Backend (AWS Serverless)

| Service | Purpose |
|---|---|
| AWS Lambda | Serverless compute — getCosts, getInsights, scheduledRefresh |
| API Gateway | REST API with CORS — routes /costs and /insights |
| DynamoDB | Caches cost data and AI insights with 24hr TTL |
| Cost Explorer API | Fetches real AWS billing data grouped by service |
| EventBridge | Cron job — refreshes cache daily at 6AM UTC |
| IAM | Per-Lambda least-privilege roles |
| CloudWatch | Logs and execution monitoring |
| AWS SAM | Infrastructure as Code — one command deployment |

### Frontend

| Tech | Purpose |
|---|---|
| React | UI framework |
| Recharts | Cost visualization bar chart |
| Axios | API calls to Lambda endpoints |
| ReactMarkdown | Renders AI insight markdown response |

### AI

| Service | Purpose |
|---|---|
| Groq API | LLM inference (free tier) |
| Llama 3.3 70B | Cost analysis and recommendations |

---

## Architecture

```
Browser
   ↓
React frontend (localhost / S3 + CloudFront)
   ↓
API Gateway (REST · CORS)
   ↓                    ↓
getCosts Lambda    getInsights Lambda
   ↓                    ↓              ↓
Cost Explorer      Groq API        DynamoDB
API                Llama 3.3       (cache · 24hr TTL)
        ↑
EventBridge (cron · daily 6AM UTC)
→ scheduledRefresh Lambda
→ pre-warms DynamoDB cache
```

---

## Project Structure

```
aws-cost-dashboard/
├── src/
│   ├── handlers/
│   │   ├── getCosts.js           # Fetches AWS billing data
│   │   ├── getInsights.js        # Generates AI cost analysis
│   │   └── scheduledRefresh.js   # Daily cache pre-warm
│   └── lib/
│       ├── costExplorer.js       # Cost Explorer API wrapper
│       ├── gemini.js             # Groq AI wrapper (Llama 3.3)
│       └── dynamo.js             # DynamoDB cache helper
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   └── components/
│   │       ├── CostChart.jsx     # Bar chart by service
│   │       ├── InsightPanel.jsx  # AI insights panel
│   │       └── ServiceTable.jsx  # Cost breakdown table
│   ├── .env                      # Local env vars (not committed)
│   └── .env.example              # Template for contributors
├── template.yaml                 # AWS SAM infrastructure definition
├── samconfig.toml                # SAM deploy configuration
├── .gitignore
└── README.md
```

---

## Prerequisites

- Node.js 20+
- AWS CLI ([install guide](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html))
- AWS SAM CLI ([install guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html))
- Groq API key — free at [console.groq.com](https://console.groq.com)
- AWS account with Cost Explorer enabled

---

## Using This Project in Your Own AWS Account

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd aws-cost-dashboard
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Deploy the backend

```bash
sam build
sam deploy --guided
```

When prompted:
- Stack name: `aws-cost-dashboard`
- Region: your preferred region (e.g. `us-east-1`)
- GeminiApiKey: paste your Groq API key (`gsk_...`)
- Accept all other defaults

### 4. Copy the API endpoint

After deploy completes, copy the `ApiEndpoint` value from the outputs:

```
ApiEndpoint: https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/Prod/
```

### 5. Set up the frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Open `.env` and paste your API endpoint:

```
REACT_APP_API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/Prod
```

### 6. Run locally

```bash
npm start
```

Dashboard opens at `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/costs` | Returns cost breakdown by service for current month |
| GET | `/insights` | Returns AI-generated cost analysis (cached 24hrs) |

### Example — `/costs` response

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

### Example — `/insights` response

```json
{
  "source": "live",
  "insight": "## AWS Cost Summary\n\nYour total spend this month is $101.13 across 8 services..."
}
```

---

## Environment Variables

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Your deployed API Gateway endpoint URL |

### Backend (managed by AWS SAM)

| Variable | Description |
|---|---|
| `REPORTS_TABLE` | DynamoDB table name (auto-set by SAM) |
| `GEMINI_API_KEY` | Groq API key (passed as SAM parameter, stored securely) |

---

## Caching Strategy

To minimize costs and API rate limits:

- Cost data cached in DynamoDB with 24-hour TTL
- AI insights cached per day — one Groq call per day maximum
- EventBridge pre-warms cache every morning at 6AM UTC so dashboard loads instantly
- Cache key format: `costs-current-current`, `insights-YYYY-MM-DD`

---

## Useful Commands

```bash
# Rebuild and redeploy after code changes
sam build && sam deploy

# Deploy with a new Groq API key
sam deploy --parameter-overrides GeminiApiKey=YOUR_NEW_KEY

# View Lambda logs
sam logs -n GetCostsFunction --stack-name aws-cost-dashboard
sam logs -n GetInsightsFunction --stack-name aws-cost-dashboard

# Test locally (requires Docker)
sam local start-api

# Delete the entire stack from AWS
sam delete --stack-name aws-cost-dashboard
```

---

## AWS Cost of Running This Project

| Service | Estimated Cost |
|---|---|
| Lambda | ~$0 (free tier: 1M requests/month) |
| API Gateway | ~$0 (free tier: 1M requests/month) |
| DynamoDB | ~$0 (free tier: 25GB storage) |
| Cost Explorer API | $0.01 per API call |
| EventBridge | ~$0 (free tier: 14M events/month) |
| Groq API | Free tier available |

**Estimated monthly cost: < $1**

---

## Roadmap

- [ ] Cognito authentication + protected routes
- [ ] Natural language chat — ask questions about your spend
- [ ] Cost forecast for next 30 days
- [ ] Budget threshold alerts via SES email
- [ ] S3 + CloudFront frontend deployment
- [ ] GitHub Actions CI/CD pipeline
- [ ] Docker support for local development
- [ ] Cost anomaly detection

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

MIT
