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
        inputs={
            "data": {"type": "any", "description": "Input data to process"},
        },
        outputs={
            "result": {"type": "any", "description": "Output from Python code"},
        },
        config={
            "code": {
                "type": "code",
                "language": "python",
                "default": "# Input data is available as 'inputs'\n# Set output variable for the result\noutput = inputs['data']",
            },
        },
    ),
    "http": NodeDefinition(
        type="http",
        category="Network",
        title="HTTP Request",
        description="Make HTTP requests to external services",
        inputs={
            "url": {"type": "string", "description": "URL to request"},
            "method": {
                "type": "string",
                "description": "HTTP method",
                "enum": ["GET", "POST", "PUT", "DELETE"],
            },
            "headers": {"type": "object", "description": "Request headers"},
            "body": {"type": "any", "description": "Request body"},
        },
        outputs={
            "response": {"type": "object", "description": "HTTP response data"},
            "status": {"type": "number", "description": "HTTP status code"},
        },
        config={},
    ),
    "transform": NodeDefinition(
        type="transform",
        category="Data",
        title="Data Transform",
        description="Transform data using JSON path or template",
        inputs={
            "data": {"type": "any", "description": "Input data to transform"},
        },
        outputs={
            "result": {"type": "any", "description": "Transformed data"},
        },
        config={
            "template": {
                "type": "string",
                "description": "Template for data transformation",
            },
        },
    ),
}