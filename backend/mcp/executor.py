from typing import Dict, Any
import httpx


async def execute_node(node_type: str, data: Dict[str, Any], config: Dict[str, Any]) -> Any:
    """Execute a node based on its type."""
    if node_type == "python":
        return execute_python_node(data, config)
    elif node_type == "http":
        return await execute_http_node(data, config)
    elif node_type == "transform":
        return execute_transform_node(data, config)
    else:
        raise ValueError(f"Unsupported node type: {node_type}")


def execute_python_node(data: Dict[str, Any], config: Dict[str, Any]) -> Any:
    """Execute a Python code node."""
    code = config.get("code", "")
    local_vars = {"data": data, "output": None}
    exec(code, {}, local_vars)
    return local_vars.get("output")


async def execute_http_node(data: Dict[str, Any], config: Dict[str, Any]) -> Any:
    """Execute an HTTP request node."""
    url = data.get("url")
    method = data.get("method", "GET")
    headers = data.get("headers", {})
    body = data.get("body")

    async with httpx.AsyncClient() as client:
        response = await client.request(
            method,
            url,
            headers=headers,
            json=body if method in ["POST", "PUT"] else None,
        )
        return {
            "status": response.status_code,
            "response": response.json(),
        }


def execute_transform_node(data: Dict[str, Any], config: Dict[str, Any]) -> Any:
    """Execute a data transformation node."""
    template = config.get("template", "{data}")
    # TODO: Implement template-based transformation
    return data