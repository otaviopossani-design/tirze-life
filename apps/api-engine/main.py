"""Servidor local sem banco, autenticação ou retenção de dados de saúde."""
import os
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from services.real_life_engine import router

app = FastAPI(title="Tirze-Life · Modo Vida Real", version="0.1.0")
origins = os.environ.get(
    "CORS_ORIGINS", "http://localhost:8081,http://127.0.0.1:8081"
).split(",")
app.add_middleware(
    CORSMiddleware, allow_origins=origins, allow_credentials=False,
    allow_methods=["GET", "POST"], allow_headers=["Content-Type"],
)

@app.middleware("http")
async def no_cache(request: Request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    return response

@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError):
    # Não devolver o corpo clínico recebido em mensagens de erro.
    return JSONResponse(status_code=422, content={
        "detail": [{"loc": list(error["loc"]), "msg": error["msg"], "type": error["type"]}
                   for error in exc.errors()]
    })

@app.get("/health")
def health():
    return {"status": "ok", "database": "not-configured", "model": "tirzepatide-project-v1"}

app.include_router(router)
