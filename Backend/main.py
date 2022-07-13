from fastapi import FastAPI, HTTPException
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from model import CompletedForecast, ForecastParameters, NNForecastParameters
from database import (fetch_completed,create_forecast,fetch_num_completed,fetch_data,create_nn_forecast,fetch_completed_names)
import time

app = FastAPI()

#solve cors problem with React JS
origins = ['http://localhost:3000']
app.add_middleware(CORSMiddleware,
                    allow_origins=origins,
                    allow_credentials = True,
                    allow_methods=["*"],
                    allow_headers=["*"])

@app.get('/completed/')
async def get_completed():
    response =  await fetch_completed()
    return response

@app.get('/completed-names/')
async def get_completed_names():
    response =  await fetch_completed_names()
    return response

@app.get('/completed-num/')
async def get_completed_number():
    response =  await fetch_num_completed()
    return response

@app.get('/data/')
async def get_data(last:Optional[int] = 0):
    response =  await fetch_data(last)
    return response

@app.post('/completed/')
async def post_forecast(request: ForecastParameters):
    response = await create_forecast(request.dict())
    if response:
        return response
    else:
        raise HTTPException(400,"Something went wrong with requested predictions!")

@app.post('/completed-nn/')
async def post_nn_forecast(request: NNForecastParameters):
    response = await create_nn_forecast(request.dict())
    if response:
        return response
    else:
        raise HTTPException(400,"Something went wrong with requested nn predictions!")
