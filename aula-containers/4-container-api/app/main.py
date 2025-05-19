from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "A aplicação foi alterada outra vez..."}