import os
import sys

# Ensure the parent directory is in sys.path so 'webui' package can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import time
import subprocess
import uvicorn
from fastapi import FastAPI, Depends, HTTPException, Header, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict

from webui.backend.account_manager import account_manager, DATA_DIR
from webui.backend.scheduler import scheduler, LOGS_DIR

app = FastAPI(title="March7th Assistant WebUI")

# 解决跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TOKEN = os.environ.get("WEBUI_TOKEN", "12345678")

def verify_token(authorization: Optional[str] = Header(None)):
    if not TOKEN:
        return True
    if authorization != f"Bearer {TOKEN}":
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

# --- API 路由 ---

@app.get("/api/status", dependencies=[Depends(verify_token)])
def get_status():
    return {
        "running": scheduler.running,
        "current_account_id": scheduler.current_account_id,
        "current_account_name": scheduler.current_account_name
    }

@app.get("/api/settings", dependencies=[Depends(verify_token)])
def get_settings():
    return scheduler.get_settings()

@app.post("/api/settings", dependencies=[Depends(verify_token)])
def update_settings(settings: dict):
    scheduler.update_settings(settings)
    return {"success": True}

@app.get("/api/accounts", dependencies=[Depends(verify_token)])
def get_accounts():
    return account_manager.get_accounts()

class AccountCreate(BaseModel):
    name: str

@app.post("/api/accounts", dependencies=[Depends(verify_token)])
def add_account(data: AccountCreate):
    return account_manager.add_account(data.name)

@app.put("/api/accounts/{account_id}", dependencies=[Depends(verify_token)])
def update_account(account_id: str, data: dict):
    acc = account_manager.update_account(account_id, data)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    return acc

@app.delete("/api/accounts/{account_id}", dependencies=[Depends(verify_token)])
def delete_account(account_id: str):
    success = account_manager.delete_account(account_id)
    return {"success": success}

class AccountReorder(BaseModel):
    account_ids: List[str]

@app.post("/api/accounts/reorder", dependencies=[Depends(verify_token)])
def reorder_accounts(data: AccountReorder):
    account_manager.reorder_accounts(data.account_ids)
    return {"success": True}

@app.get("/api/config", dependencies=[Depends(verify_token)])
def get_global_config():
    config_path = os.path.join(DATA_DIR, 'config.yaml')
    if not os.path.exists(config_path):
        # 回退读取根目录原版的 config.example.yaml
        fallback_path = os.path.join(os.getcwd(), 'assets', 'config', 'config.example.yaml')
        if os.path.exists(fallback_path):
            with open(fallback_path, 'r', encoding='utf-8') as f:
                return {"content": f.read()}
        return {"content": ""}
    with open(config_path, 'r', encoding='utf-8') as f:
        return {"content": f.read()}

class ConfigData(BaseModel):
    content: str

@app.post("/api/config", dependencies=[Depends(verify_token)])
def save_global_config(data: ConfigData):
    config_path = os.path.join(DATA_DIR, 'config.yaml')
    with open(config_path, 'w', encoding='utf-8') as f:
        f.write(data.content)
    return {"success": True}

@app.get("/api/history", dependencies=[Depends(verify_token)])
def get_history():
    return scheduler.run_history

@app.get("/api/logs/{log_file}", dependencies=[Depends(verify_token)])
def get_log(log_file: str):
    log_path = os.path.join(LOGS_DIR, log_file)
    if not os.path.exists(log_path):
        return {"content": "Log file not found."}
    try:
        with open(log_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        return {"content": content}
    except Exception as e:
        return {"content": f"Failed to read log: {str(e)}"}

@app.post("/api/run/start", dependencies=[Depends(verify_token)])
def start_run():
    if scheduler.start_run():
        return {"success": True, "message": "Run started"}
    return {"success": False, "message": "Already running"}

@app.post("/api/run/stop", dependencies=[Depends(verify_token)])
def stop_run():
    if scheduler.stop_run():
        return {"success": True, "message": "Run stopped"}
    return {"success": False, "message": "Not running"}

qr_login_processes = {}

@app.post("/api/qr_login/start/{account_id}", dependencies=[Depends(verify_token)])
def start_qr_login(account_id: str):
    if account_id in qr_login_processes and qr_login_processes[account_id].poll() is None:
        return {"success": False, "message": "扫码登录流程已在进行中"}

    account_profile_dir = os.path.join(DATA_DIR, "profiles", account_id)
    os.makedirs(account_profile_dir, exist_ok=True)
    
    # 临时覆盖全局环境变量，指定浏览器与接管标志
    env = os.environ.copy()
    env["MARCH7TH_USER_PROFILE_DIR"] = account_profile_dir
    env["MARCH7TH_DOCKER_STARTED"] = "true"
    env["MARCH7TH_GUI_STARTED"] = "true"

    script_path = os.path.join(os.path.dirname(__file__), "backend", "qr_login_runner.py")
    proc = subprocess.Popen(
        [sys.executable, script_path, account_id],
        cwd=os.path.join(os.path.dirname(__file__), ".."),
        env=env
    )
    qr_login_processes[account_id] = proc
    return {"success": True, "message": "扫码登录已启动"}

@app.get("/api/qr_login/status/{account_id}", dependencies=[Depends(verify_token)])
def check_qr_login_status(account_id: str):
    qr_path = os.path.join(DATA_DIR, f"qr_{account_id}.png")
    qr_ready = os.path.exists(qr_path)
    
    proc = qr_login_processes.get(account_id)
    if proc:
        ret_code = proc.poll()
        if ret_code is not None:
            # Process finished
            del qr_login_processes[account_id]
            if ret_code == 0:
                return {"status": "success"}
            else:
                return {"status": "failed"}
        else:
            return {
                "status": "running",
                "qr_ready": qr_ready,
                "qr_url": f"/api/qr_login/image/{account_id}?t={time.time()}" if qr_ready else None
            }
    return {"status": "idle"}

@app.get("/api/qr_login/image/{account_id}")
def get_qr_image(account_id: str):
    # This route returns the QR image directly.
    qr_path = os.path.join(DATA_DIR, f"qr_{account_id}.png")
    if os.path.exists(qr_path):
        return FileResponse(qr_path, media_type="image/png")
    raise HTTPException(status_code=404, detail="QR image not found")

# --- 静态文件和前端 ---
STATIC_DIR = os.path.join(os.path.dirname(__file__), 'static')

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/{catchall:path}")
def serve_frontend(request: Request, catchall: str):
    # Serve index.html for all other routes to support Vue Router
    index_path = os.path.join(STATIC_DIR, 'index.html')
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"error": "Frontend not found"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
