import modal
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime

app = modal.App("flow-executor")

image = modal.Image.debian_slim().pip_install(
    "fastapi",
    "pydantic",
    "httpx",
)

class Node(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any]

class Edge(BaseModel):
    id: str
    source: str
    target: str

class FlowScript(BaseModel):
    flow_id: str
    nodes: List[Node]
    edges: List[Edge]

@app.function(image=image)
@modal.web_endpoint(method="POST")
def execute(flow: FlowScript):
    try:
        visited = set()
        output = {}

        def process_node(node_id: str):
            if node_id in visited:
                return output.get(node_id)

            node = next((n for n in flow.nodes if n.id == node_id), None)
            if not node:
                return None

            visited.add(node_id)

            inputs = {}
            for edge in flow.edges:
                if edge.target == node_id:
                    source_output = process_node(edge.source)
                    inputs[edge.source] = source_output

            result = execute_node(node, inputs)
            output[node_id] = result
            return result

        for node in flow.nodes:
            if node.id not in visited:
                process_node(node.id)

        return {
            "status": "completed",
            "output": output,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat(),
        }

def execute_node(node: Node, inputs: Dict[str, Any]) -> Any:
    if node.type == "python":
        code = node.data.get("code", "")
        local_vars = {"inputs": inputs, "output": None}
        try:
            exec(code, {}, local_vars)
            return local_vars.get("output")
        except Exception as e:
            return {"error": str(e)}
    
    elif node.type == "http":
        import httpx
        url = node.data.get("url", "")
        method = node.data.get("method", "GET")
        headers = node.data.get("headers", {})
        body = node.data.get("body", None)
        
        try:
            response = httpx.request(method, url, headers=headers, json=body)
            return {
                "status": response.status_code,
                "data": response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text,
            }
        except Exception as e:
            return {"error": str(e)}
    
    elif node.type == "transform":
        template = node.data.get("template", "")
        data = inputs.get("data", {})
        try:
            return eval(template, {"data": data})
        except Exception as e:
            return {"error": str(e)}
    
    else:
        return {"error": f"Unsupported node type: {node.type}"}

@app.local_entrypoint()
def main():
    print("Flow executor deployed successfully!")
