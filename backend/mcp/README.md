# Flow Script MCP Backend

This is the Model Control Protocol (MCP) backend for executing flow scripts. It is built using [Modal](https://modal.com) and provides a serverless execution environment for flow scripts.

## Structure

- `flow_executor.py`: Main Modal stub and flow execution logic
- `server.py`: FastAPI server for handling flow execution requests
- `nodes.py`: Node type definitions and configurations
- `executor.py`: Node execution implementations

## Node Types

Currently supported node types:

1. **Python Code**
   - Execute arbitrary Python code
   - Input data available as `inputs` variable
   - Set `output` variable for result

2. **HTTP Request**
   - Make HTTP requests to external services
   - Support for GET, POST, PUT, DELETE methods
   - Configure headers and body

3. **Data Transform**
   - Transform data using templates
   - Support for basic data manipulation

## Usage

1. Install dependencies:
   ```bash
   pip install modal-client fastapi pydantic httpx
   ```

2. Deploy to Modal:
   ```bash
   modal deploy backend/mcp/server.py
   ```

3. Access the MCP server:
   - Endpoint: `https://<your-modal-app>.modal.run/execute`
   - Method: `POST`
   - Body:
     ```json
     {
       "flow_id": "string",
       "nodes": [...],
       "edges": [...]
     }
     ```

## Development

1. Run locally:
   ```bash
   modal serve backend/mcp/server.py
   ```

2. Test flow execution:
   ```bash
   curl -X POST http://localhost:8000/execute \
     -H "Content-Type: application/json" \
     -d '{"flow_id":"test","nodes":[],"edges":[]}'
   ```