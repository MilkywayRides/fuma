# AI Widgets & Live Data Processing Guide

## Overview

The flow scripts system now includes powerful AI widgets and live data processing capabilities, similar to n8n. You can build complex workflows that integrate AI models, databases, and external services.

## Available Widgets

### 🤖 AI Widgets

#### 1. Google Gemini
- **Purpose**: Generate content using Google's Gemini AI
- **Inputs**: 
  - `prompt`: Text prompt for the AI
  - `model`: Model name (default: gemini-pro)
- **Configuration**:
  - `api_key`: Your Gemini API key (or set `GEMINI_API_KEY` env var)
- **Output**: AI-generated text response

**Example Use Case**: Content generation, text analysis, Q&A

#### 2. OpenAI ChatGPT
- **Purpose**: Generate content using OpenAI's ChatGPT
- **Inputs**:
  - `prompt`: Text prompt for ChatGPT
  - `model`: Model name (default: gpt-3.5-turbo)
- **Configuration**:
  - `api_key`: Your OpenAI API key (or set `OPENAI_API_KEY` env var)
- **Output**: AI-generated text response

**Example Use Case**: Conversational AI, content creation, code generation

### 💬 Communication Widgets

#### 3. Discord Webhook
- **Purpose**: Send messages to Discord channels
- **Inputs**:
  - `content`: Message text
  - `username`: Bot display name
  - `avatar_url`: Bot avatar image URL
- **Configuration**:
  - `webhook_url`: Discord webhook URL
- **Output**: Success status

**Example Use Case**: Notifications, alerts, bot messages

### 💾 Data Widgets

#### 4. User Data
- **Purpose**: Fetch user information from your database
- **Inputs**:
  - `user_id`: User ID to fetch
- **Output**: User object with id, name, email

**Example Use Case**: User profile retrieval, personalization

#### 5. Database Query
- **Purpose**: Execute SQL queries on PostgreSQL
- **Inputs**:
  - `query`: SQL query string
  - `params`: Query parameters (array)
- **Configuration**:
  - `connection_string`: Database URL (or uses `DATABASE_URL` env var)
- **Output**: Query results array

**Example Use Case**: Custom data retrieval, analytics, reporting

#### 6. Filter Data
- **Purpose**: Filter arrays based on conditions
- **Inputs**:
  - `data`: Array of items to filter
  - `condition`: Python expression (e.g., `item['age'] > 18`)
- **Output**: Filtered array

**Example Use Case**: Data filtering, conditional processing

## Setup

### 1. Environment Variables

Add to your `.env` file:

```env
# AI APIs
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Database (already configured)
DATABASE_URL=your_database_url
```

### 2. Deploy Backend

```bash
cd backend/mcp
pip install -r requirements.txt
modal deploy server.py
```

The backend now includes:
- `google-generativeai` for Gemini
- `openai` for ChatGPT
- `psycopg2-binary` for PostgreSQL
- `httpx` for HTTP requests

## Example Workflows

### Example 1: AI Content Generator with Discord Notification

**Flow**: Input → Gemini → Discord

1. **Input Node**: Receives topic
2. **Gemini Node**: 
   - Prompt: "Write a blog post about {topic}"
   - Generates content
3. **Discord Node**:
   - Sends generated content to Discord channel

**Use Case**: Automated content creation and distribution

---

### Example 2: User Data Processing with AI

**Flow**: User Data → Filter → ChatGPT → Database

1. **User Data Node**: Fetch user by ID
2. **Filter Node**: Filter active users
3. **ChatGPT Node**: Generate personalized message
4. **Database Node**: Store result

**Use Case**: Personalized user engagement

---

### Example 3: AI-Powered Data Analysis

**Flow**: Database → Filter → Gemini → Discord

1. **Database Node**: 
   - Query: `SELECT * FROM posts WHERE created_at > NOW() - INTERVAL '7 days'`
2. **Filter Node**: Filter by engagement
3. **Gemini Node**: Analyze trends and generate insights
4. **Discord Node**: Send report to team channel

**Use Case**: Automated analytics and reporting

---

### Example 4: Chatbot with Database Integration

**Flow**: Input → User Data → ChatGPT → Discord

1. **Input Node**: Receives user question
2. **User Data Node**: Fetch user context
3. **ChatGPT Node**: 
   - Prompt: "Answer this question with user context: {question}"
4. **Discord Node**: Send response

**Use Case**: Context-aware chatbot

---

### Example 5: Content Moderation Pipeline

**Flow**: Input → Gemini → Filter → Database → Discord

1. **Input Node**: Receives user-generated content
2. **Gemini Node**: Analyze content for policy violations
3. **Filter Node**: Filter flagged content
4. **Database Node**: Log violations
5. **Discord Node**: Alert moderators

**Use Case**: Automated content moderation

## Node Configuration

### Double-Click to Edit

All AI and data nodes support double-click editing:
- Click node to select
- Double-click to open editor
- Enter configuration
- Click outside to save

### API Keys

You can provide API keys in two ways:

1. **In Node**: Double-click node and enter API key
2. **Environment Variable**: Set in `.env` file (recommended for security)

### Database Queries

For Database nodes:
- Use parameterized queries for security
- Example: `SELECT * FROM users WHERE id = %s`
- Pass parameters in `params` input

## Live Data Processing

### Real-Time Execution

Flows execute in real-time on Modal's serverless infrastructure:
- Fast cold starts
- Automatic scaling
- Isolated execution

### Data Flow

Data flows between nodes automatically:
- Each node receives inputs from connected nodes
- Outputs are passed to downstream nodes
- Errors are captured and logged

### Monitoring

View execution logs:
```bash
modal app logs flow-executor
```

Check execution history in the dashboard.

## Best Practices

### 1. Security

- Store API keys in environment variables
- Use parameterized database queries
- Validate user inputs
- Limit query results

### 2. Performance

- Cache AI responses when possible
- Use filters early in the pipeline
- Limit database query results
- Set appropriate timeouts

### 3. Error Handling

- Add fallback nodes
- Log errors to database
- Send alerts on failures
- Test flows before publishing

### 4. Cost Optimization

- Use appropriate AI models (gpt-3.5-turbo vs gpt-4)
- Cache repeated queries
- Filter data before AI processing
- Monitor API usage

## API Keys Setup

### Google Gemini

1. Visit https://makersuite.google.com/app/apikey
2. Create API key
3. Add to `.env`: `GEMINI_API_KEY=your_key`

### OpenAI

1. Visit https://platform.openai.com/api-keys
2. Create API key
3. Add to `.env`: `OPENAI_API_KEY=your_key`

### Discord Webhook

1. Go to Discord Server Settings → Integrations → Webhooks
2. Create webhook
3. Copy webhook URL
4. Paste in Discord node configuration

## Troubleshooting

### AI Node Errors

- **"API key not provided"**: Set API key in node or environment
- **"Rate limit exceeded"**: Wait or upgrade API plan
- **"Invalid model"**: Check model name spelling

### Database Errors

- **"Connection failed"**: Check DATABASE_URL
- **"Query error"**: Validate SQL syntax
- **"Permission denied"**: Check database permissions

### Discord Errors

- **"Webhook not found"**: Verify webhook URL
- **"Message too long"**: Limit content length
- **"Rate limited"**: Reduce message frequency

## Advanced Features

### Chaining AI Models

Combine multiple AI models:
```
Input → Gemini (generate) → ChatGPT (refine) → Output
```

### Conditional Logic

Use Filter nodes for branching:
```
Input → Filter (condition) → [Path A | Path B]
```

### Data Aggregation

Combine multiple data sources:
```
[User Data + Database Query] → Transform → AI Analysis
```

## Next Steps

1. Create your first AI-powered flow
2. Experiment with different node combinations
3. Monitor execution logs
4. Optimize for performance and cost
5. Share successful workflows with your team

Happy building! 🚀
