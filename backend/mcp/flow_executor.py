from modal import Image, Stub, method, web_endpoint
from fastapi import FastAPI, HTTPException
import json
from typing import Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel


def create_app():
    app = FastAPI()
    return app


class Node(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, any]


class Edge(BaseModel):
    id: str
    source: str
    target: str


class FlowScript(BaseModel):
    id: str
    nodes: List[Node]
    edges: List[Edge]


class FlowExecution(BaseModel):
    id: int
    flow_id: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    error: Optional[str] = None
    logs: Optional[str] = None


# Create a Modal image with our dependencies
image = Image.debian_slim().pip_install(
    "fastapi",
    "pydantic",
)

# Create a Stub for our app
stub = Stub("flow-executor")


@stub.cls(image=image)
class FlowExecutor:
    def __init__(self):
        self.app = create_app()
        self._setup_routes()

    def _setup_routes(self):
        @self.app.post("/execute/{flow_id}")
        async def execute_flow(flow_id: str, flow: FlowScript):
            try:
                # Execute the flow
                # TODO: Implement actual flow execution logic
                result = {
                    "status": "completed",
                    "output": "Flow executed successfully",
                }
                return result
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

    @method()
    @web_endpoint(method="POST")
    async def execute(self, flow_id: str, flow: FlowScript):
        """Execute a flow script."""
        try:
            # Process nodes in topological order
            visited = set()
            output = {}

            def process_node(node_id: str):
                if node_id in visited:
                    return output[node_id]

                node = next(n for n in flow.nodes if n.id == node_id)
                visited.add(node_id)

                # Get input values from parent nodes
                inputs = {}
                for edge in flow.edges:
                    if edge.target == node_id:
                        source_output = process_node(edge.source)
                        inputs[edge.id] = source_output

                # Execute node based on type
                result = self._execute_node(node, inputs)
                output[node_id] = result
                return result

            # Process all nodes
            for node in flow.nodes:
                if node.id not in visited:
                    process_node(node.id)

            return {
                "status": "completed",
                "output": output,
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
            }

    def _execute_node(self, node: Node, inputs: Dict[str, any]) -> any:
        """Execute a single node based on its type."""
        # TODO: Implement node type handlers
        if node.type == "python":
            # Execute Python code
            code = node.data.get("code", "")
            local_vars = {"inputs": inputs}
            exec(code, {}, local_vars)
            return local_vars.get("output")
        elif node.type == "http":
            # Make HTTP request
            # TODO: Implement HTTP node
            pass
        elif node.type == "transform":
            # Transform data
            # TODO: Implement data transformation
            pass
        else:
            raise ValueError(f"Unsupported node type: {node.type}")


@stub.local_entrypoint()
def main():
    """Local development entrypoint."""
    print("Starting flow executor in development mode...")