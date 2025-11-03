import modal
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
import os

app = modal.App("ai-model-server-v2")

image = modal.Image.debian_slim().pip_install(
    "fastapi",
    "transformers",
    "torch",
    "accelerate",
    "bitsandbytes",
)

AI_API_SECRET = modal.Secret.from_name("ai-api-secret")

web_app = FastAPI()
model_cache = {}

class ChatRequest(BaseModel):
    messages: list[dict]
    max_tokens: int = 1500
    temperature: float = 0.7

class ChatResponse(BaseModel):
    content: str
    model: str
    usage: dict

def verify_api_key(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    
    token = authorization.replace("Bearer ", "")
    expected_token = os.environ.get("AI_API_SECRET")
    
    if token != expected_token:
        raise HTTPException(status_code=403, detail="Invalid API key")

@web_app.post("/v1/chat/completions", response_model=ChatResponse)
async def chat_completions(request: ChatRequest, authorization: str = Header(None)):
    verify_api_key(authorization)
    
    from transformers import AutoTokenizer, AutoModelForCausalLM
    import torch
    
    model_name = "Qwen/Qwen2.5-Coder-1.5B-Instruct"
    
    if "model" not in model_cache:
        model_cache["tokenizer"] = AutoTokenizer.from_pretrained(model_name)
        model_cache["model"] = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16,
            device_map="auto",
        )
    
    tokenizer = model_cache["tokenizer"]
    model = model_cache["model"]
    
    # Format messages using chat template
    prompt = tokenizer.apply_chat_template(
        request.messages,
        tokenize=False,
        add_generation_prompt=True
    )
    
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    outputs = model.generate(
        **inputs,
        max_new_tokens=min(request.max_tokens, 1500),
        temperature=request.temperature,
        do_sample=request.temperature > 0,
        top_p=0.95,
        repetition_penalty=1.1,
        pad_token_id=tokenizer.eos_token_id,
        eos_token_id=tokenizer.eos_token_id
    )
    
    response = tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
    
    return {
        "content": response.strip(),
        "model": model_name,
        "usage": {
            "prompt_tokens": len(inputs.input_ids[0]),
            "completion_tokens": len(outputs[0]) - len(inputs.input_ids[0]),
            "total_tokens": len(outputs[0])
        }
    }

@web_app.get("/health")
async def health():
    return {"status": "healthy", "model": "Qwen2.5-Coder-1.5B-Instruct"}

@app.function(
    image=image,
    gpu="T4",
    secrets=[AI_API_SECRET],
    timeout=600,
    container_idle_timeout=300,
)
@modal.asgi_app()
def fastapi_app():
    return web_app
