# Node definitions for the flow editor
from typing import Dict, Any
from pydantic import BaseModel


class NodeDefinition(BaseModel):
    type: str
    category: str
    title: str
    description: str
    inputs: Dict[str, Any]
    outputs: Dict[str, Any]
    config: Dict[str, Any]


NODE_DEFINITIONS = {
    "python": NodeDefinition(
        type="python",
        category="Code",
        title="Python Code",
        description="Execute Python code with input data",
        inputs={"data": {"type": "any", "description": "Input data to process"}},
        outputs={"result": {"type": "any", "description": "Output from Python code"}},
        config={"code": {"type": "code", "language": "python", "default": "output = inputs.get('data')"}},
    ),
    "http": NodeDefinition(
        type="http",
        category="Network",
        title="HTTP Request",
        description="Make HTTP requests to external services",
        inputs={
            "url": {"type": "string", "description": "URL to request"},
            "method": {"type": "string", "description": "HTTP method", "enum": ["GET", "POST", "PUT", "DELETE"]},
            "headers": {"type": "object", "description": "Request headers"},
            "body": {"type": "any", "description": "Request body"},
        },
        outputs={
            "response": {"type": "object", "description": "HTTP response data"},
            "status": {"type": "number", "description": "HTTP status code"},
        },
        config={},
    ),
    "gemini": NodeDefinition(
        type="gemini",
        category="AI",
        title="Google Gemini",
        description="Generate content using Google Gemini AI",
        inputs={
            "prompt": {"type": "string", "description": "Prompt for Gemini"},
            "model": {"type": "string", "description": "Model name", "default": "gemini-pro"},
        },
        outputs={"response": {"type": "string", "description": "AI generated response"}},
        config={"api_key": {"type": "string", "description": "Gemini API Key"}},
    ),
    "openai": NodeDefinition(
        type="openai",
        category="AI",
        title="OpenAI ChatGPT",
        description="Generate content using OpenAI ChatGPT",
        inputs={
            "prompt": {"type": "string", "description": "Prompt for ChatGPT"},
            "model": {"type": "string", "description": "Model name", "default": "gpt-3.5-turbo"},
        },
        outputs={"response": {"type": "string", "description": "AI generated response"}},
        config={"api_key": {"type": "string", "description": "OpenAI API Key"}},
    ),
    "discord": NodeDefinition(
        type="discord",
        category="Communication",
        title="Discord Webhook",
        description="Send messages to Discord via webhook",
        inputs={
            "content": {"type": "string", "description": "Message content"},
            "username": {"type": "string", "description": "Bot username"},
            "avatar_url": {"type": "string", "description": "Bot avatar URL"},
        },
        outputs={"success": {"type": "boolean", "description": "Message sent successfully"}},
        config={"webhook_url": {"type": "string", "description": "Discord Webhook URL"}},
    ),
    "database": NodeDefinition(
        type="database",
        category="Data",
        title="Database Query",
        description="Query PostgreSQL database",
        inputs={
            "query": {"type": "string", "description": "SQL query"},
            "params": {"type": "array", "description": "Query parameters"},
        },
        outputs={"result": {"type": "array", "description": "Query results"}},
        config={"connection_string": {"type": "string", "description": "Database connection string"}},
    ),
    "user_data": NodeDefinition(
        type="user_data",
        category="Data",
        title="User Data",
        description="Fetch user data from database",
        inputs={"user_id": {"type": "string", "description": "User ID"}},
        outputs={"user": {"type": "object", "description": "User data"}},
        config={},
    ),
    "filter": NodeDefinition(
        type="filter",
        category="Logic",
        title="Filter Data",
        description="Filter data based on conditions",
        inputs={
            "data": {"type": "array", "description": "Input data array"},
            "condition": {"type": "string", "description": "Filter condition"},
        },
        outputs={"filtered": {"type": "array", "description": "Filtered data"}},
        config={},
    ),
    "transform": NodeDefinition(
        type="transform",
        category="Data",
        title="Data Transform",
        description="Transform data using templates",
        inputs={"data": {"type": "any", "description": "Input data to transform"}},
        outputs={"result": {"type": "any", "description": "Transformed data"}},
        config={"template": {"type": "string", "description": "Template for transformation"}},
    ),
}