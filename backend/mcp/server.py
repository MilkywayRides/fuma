import modal
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime
import os

app = modal.App("flow-executor")

# Load secrets from Modal
try:
    secrets = [modal.Secret.from_name("flow-secrets")]
except:
    secrets = []

image = modal.Image.debian_slim().pip_install(
    "fastapi",
    "pydantic",
    "httpx",
    "google-generativeai",
    "openai",
    "psycopg2-binary",
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

@app.function(
    image=image,
    secrets=secrets,
    timeout=300,
)
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
    node_type = node.type
    
    if node_type == "input":
        return node.data
    
    elif node_type == "output":
        return inputs
    
    elif node_type == "default":
        return node.data
    
    elif node_type == "python":
        code = node.data.get("code", "")
        local_vars = {"inputs": inputs, "output": None}
        try:
            exec(code, {}, local_vars)
            return local_vars.get("output")
        except Exception as e:
            return {"error": str(e)}
    
    elif node_type == "http":
        import httpx
        url = node.data.get("url", "")
        method = node.data.get("method", "GET")
        headers = node.data.get("headers", {})
        body = node.data.get("body", None)
        try:
            response = httpx.request(method, url, headers=headers, json=body, timeout=30.0)
            return {
                "status": response.status_code,
                "data": response.json() if "application/json" in response.headers.get("content-type", "") else response.text,
            }
        except Exception as e:
            return {"error": str(e)}
    
    elif node_type == "gemini":
        try:
            import google.generativeai as genai
            api_key = node.data.get("api_key", os.getenv("GEMINI_API_KEY"))
            if not api_key:
                return {"error": "Gemini API key not provided"}
            
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")  # Updated model name
            prompt = inputs.get("prompt", node.data.get("prompt", ""))
            response = model.generate_content(prompt)
            return {"response": response.text}
        except Exception as e:
            return {"error": str(e)}
    
    elif node_type == "openai":
        try:
            from openai import OpenAI
            api_key = node.data.get("api_key", os.getenv("OPENAI_API_KEY"))
            if not api_key:
                return {"error": "OpenAI API key not provided"}
            
            client = OpenAI(api_key=api_key)
            prompt = inputs.get("prompt", node.data.get("prompt", ""))
            model = node.data.get("model", "gpt-3.5-turbo")
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}]
            )
            return {"response": response.choices[0].message.content}
        except Exception as e:
            return {"error": str(e)}
    
    elif node_type == "discord":
        try:
            import httpx
            webhook_url = node.data.get("webhook_url", "")
            if not webhook_url:
                return {"error": "Discord webhook URL not provided"}
            
            content = inputs.get("content", node.data.get("content", ""))
            username = inputs.get("username", node.data.get("username", "Bot"))
            avatar_url = inputs.get("avatar_url", node.data.get("avatar_url", ""))
            
            payload = {"content": content, "username": username}
            if avatar_url:
                payload["avatar_url"] = avatar_url
            
            response = httpx.post(webhook_url, json=payload, timeout=10.0)
            return {"success": response.status_code == 204}
        except Exception as e:
            return {"error": str(e)}
    
    elif node_type == "database":
        try:
            import psycopg2
            conn_string = os.getenv("DATABASE_URL")
            if not conn_string:
                return {"error": "Database connection not configured"}
            
            query = inputs.get("query", node.data.get("query", ""))
            if not query:
                return {"error": "Query not provided"}
            
            # Only allow SELECT for security
            if not query.strip().upper().startswith("SELECT"):
                return {"error": "Only SELECT queries allowed"}
            
            conn = psycopg2.connect(conn_string)
            cursor = conn.cursor()
            cursor.execute(query)
            result = cursor.fetchall()
            cursor.close()
            conn.close()
            
            return {"result": result}
        except Exception as e:
            return {"error": str(e)}
    
    elif node_type == "user_data":
        try:
            import psycopg2
            conn_string = os.getenv("DATABASE_URL")
            if not conn_string:
                return {"error": "Database connection not configured"}
            
            user_id = inputs.get("user_id", node.data.get("user_id", ""))
            if not user_id:
                return {"error": "User ID not provided"}
            
            conn = psycopg2.connect(conn_string)
            cursor = conn.cursor()
            cursor.execute('SELECT id, name, email, role FROM "user" WHERE id = %s', (user_id,))
            result = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if result:
                return {"user": {"id": result[0], "name": result[1], "email": result[2], "role": result[3]}}
            return {"error": "User not found"}
        except Exception as e:
            return {"error": str(e)}
    
    elif node_type == "filter":
        try:
            data = inputs.get("data", node.data.get("data", []))
            condition = node.data.get("condition", "True")
            filtered = [item for item in data if eval(condition, {"item": item})]
            return {"filtered": filtered}
        except Exception as e:
            return {"error": str(e)}
    
    elif node_type == "transform":
        try:
            data = inputs.get("data", node.data.get("data", {}))
            template = node.data.get("template", "data")
            result = eval(template, {"data": data, "inputs": inputs})
            return {"result": result}
        except Exception as e:
            return {"error": str(e)}
    
    else:
        return {"error": f"Unsupported node type: {node_type}"}

@app.local_entrypoint()
def main():
    print("Flow executor deployed successfully!")
