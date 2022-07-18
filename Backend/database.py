from model import CompletedForecast, Data, Name
import datetime

from sklearn.linear_model import LinearRegression
from sklearn.svm import SVR
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.neighbors import KNeighborsRegressor
from sklearn.tree import DecisionTreeRegressor

from neural import nn_predictions
from helpers import make_predictions

#MongoDB driver
import motor.motor_asyncio

client = motor.motor_asyncio.AsyncIOMotorClient("mongodb+srv://admin:6CCrTY1wieX7DLAD@cluster0.yimtz.mongodb.net/test")
database = client.Project

CompletedForecasts = database.Completed_Forecasts
TimeseriesData = database.Timeseries

data = {
  "time":'2022-04-04 18:00',
  "project_name":"A random name",
  "window": 0,
  "horizon":0,
  "predictions_A":[],
  "predictions_B":[],
  "predictions_C":[],
  "algorithms":{
        'nn':{
          'name':'Custom Neural Network',
          'used':False,
          'performance':{'pwrA':0.0,'pwrB':0.0,'pwrC':0.0},
          "parameters":{"hidden_layers": 0, "hidden_size": [], "activation_hidden": [], "epochs": 0, "learning_rate":0, "batch_size": 0, "technique":"-"},
        },
        'rf':{
          'name':'Random Forest',
          'used':False,
          'performance':{'pwrA':0.0,'pwrB':0.0,'pwrC':0.0},
          "params_A":{"n_estimators":0, "max_depth":"0", "max_samples":0.0, "bootstrap":False, "max_features":"0", "technique":"-"},
          "params_B":{"n_estimators":0, "max_depth":"0", "max_samples":0.0, "bootstrap":False, "max_features":"0", "technique":"-"},
          "params_C":{"n_estimators":0, "max_depth":"0", "max_samples":0.0, "bootstrap":False, "max_features":"0", "technique":"-"}
        },
        'knn':{
          'name':'K-Nearest Neighbors',
          'used':False,
          'performance':{'pwrA':0.0,'pwrB':0.0,'pwrC':0.0},
          "params_A":{"n_neighbors":0, "algorithm":"-", "leaf_size":0, "weights":"-", "metric":"-","p":3, "technique":"-"},
          "params_B":{"n_neighbors":0, "algorithm":"-", "leaf_size":0, "weights":"-", "metric":"-","p":3, "technique":"-"},
          "params_C":{"n_neighbors":0, "algorithm":"-", "leaf_size":0, "weights":"-", "metric":"-","p":3, "technique":"-"}
        },
        'grb':{
          'name':'Gradient Boosting',
          'used':False,
          'performance':{'pwrA':0.0,'pwrB':0.0,'pwrC':0.0},
          "params_A":{"loss":"-", "learning_rate":0.0, "n_estimators":0, "max_depth":0, "min_samples_split":0, "technique":"-"},
          "params_B":{"loss":"-", "learning_rate":0.0, "n_estimators":0, "max_depth":0, "min_samples_split":0, "technique":"-"},
          "params_C":{"loss":"-", "learning_rate":0.0, "n_estimators":0, "max_depth":0, "min_samples_split":0, "technique":"-"}
        },
        'svr':{
          'name':'SVR',
          'used':False,
          'performance':{'pwrA':0.0,'pwrB':0.0,'pwrC':0.0},
          "params_A":{"kernel":"-","C":0,"degree":0,"coef0":0.0,"gamma":"-", 'epsilon':0.0, "technique":"-"},
          "params_B":{"kernel":"-","C":0,"degree":0,"coef0":0.0,"gamma":"-", 'epsilon':0.0, "technique":"-"},
          "params_C":{"kernel":"-","C":0,"degree":0,"coef0":0.0,"gamma":"-", 'epsilon':0.0, "technique":"-"}
        },
        'lr':{
          'name':'Linear Regressor',
          'used':False,
          'performance':{'pwrA':0.0,'pwrB':0.0,'pwrC':0.0},
          "params_A":{"fit_intercept":True, "technique":"-"},
          "params_B":{"fit_intercept":True, "technique":"-"},
          "params_C":{"fit_intercept":True, "technique":"-"}
        },
        'dt':{
          'name':'Decision Tree',
          'used':False,
          'performance':{'pwrA':0.0,'pwrB':0.0,'pwrC':0.0},
          "params_A":{"criterion":'-', "max_depth":'-', 'min_samples_split':0, 'min_samples_leaf':0, 'ccp_alpha':0.0,"technique":"-"},
          "params_B":{"criterion":'-', "max_depth":'-', 'min_samples_split':0, 'min_samples_leaf':0, 'ccp_alpha':0.0,"technique":"-"},
          "params_C":{"criterion":'-', "max_depth":'-', 'min_samples_split':0, 'min_samples_leaf':0, 'ccp_alpha':0.0,"technique":"-"}
        }
      }
}

def transfer_values(a,b,algo):
    for key in b.keys():
        if ((key == 'max_depth' and algo == 'rf') or (key == 'max_features' and algo == 'rf') or (key == 'max_depth' and algo == 'dt')):
          a[key] = str(b[key])
        else:
          a[key] = b[key]
    return a

async def fetch_completed():
    rslt = []
    cursor =  CompletedForecasts.find({})
    async for document in cursor:
        rslt.append(CompletedForecast(**document))
    return rslt

async def fetch_completed_names():
    rslt = []
    cursor =  CompletedForecasts.find({},{'project_name':1})
    async for document in cursor:
        rslt.append(Name(**document))
    return rslt

async def fetch_data(last=0):
    rslt = []
    cursor =  TimeseriesData.find({})
    if (last != 0):
      cursor.sort("Time",1).skip(673-last)
    else:
      cursor.sort("Time",1)  
    async for document in cursor:
      document['Time'] =  document['Time'] + datetime.timedelta(hours=2)
      rslt.append(Data(**document))
    return rslt

async def fetch_num_completed():
    rslt = {"number":0}
    cursor = await CompletedForecasts.count_documents({})
    rslt["number"] = cursor
    return rslt  

#forecast with machine learning algorithms 
async def create_forecast(forecast):
    data["project_name"] = forecast["project_name"]
    data["window"] = forecast["window_size"]
    data["horizon"] = forecast["horizon"]
    t = datetime.datetime.now()
    data["time"] = t.strftime("%d-%m-%Y %H:%M")

    models = {
    "rf":RandomForestRegressor,
    "knn":KNeighborsRegressor,
    "grb":GradientBoostingRegressor,
    "dt":DecisionTreeRegressor,
    "svr":SVR,
    "lr":LinearRegression
    }

    predictions = {
      "rf":[],
      "knn":[],
      "grb":[],
      "dt":[],
      "svr":[],
      "lr":[]
    }

    #initializations
    for pwr in ['pwrA','pwrB','pwrC']:
      data["predictions_"+pwr[-1]] = []
      data["algorithms"]['nn']["used"] = False
      data["algorithms"]['nn']["performance"][pwr] = 0.0 
    #deactivate ml algorithms
    for algo in ["rf", "knn", "grb", "dt", "svr", "lr"]:
      data["algorithms"][algo]["used"] = False
      for pwr in ['pwrA','pwrB','pwrC']:
        data["algorithms"][algo]["performance"][pwr] = 0.0

    best_algo = ''
    best_score = 50000000

    for pwr in ['pwrA','pwrB','pwrC']:
      if (forecast[pwr]):
        for algo in ["rf", "knn", "grb", "dt", "svr", "lr"]:
          if (forecast[algo]):
            data["algorithms"][algo]["used"] = True
            if (algo == 'lr'):
              preds, score, params = make_predictions(forecast["horizon"],forecast["window_size"],pwr,models[algo],algo,forecast['lr_tech'],'g',1)
            else:  
              preds, score, params = make_predictions(forecast["horizon"],forecast["window_size"],pwr,models[algo],algo,forecast[algo+'_tech'],forecast[algo+'_ho'],forecast[algo+'_iter'])
            predictions[algo] = list(map(lambda num: float(num), preds))
            if (score < best_score):
              best_score = score
              best_algo = algo
            data["algorithms"][algo]["performance"][pwr] = round(score,4)
            data["algorithms"][algo]["params_"+pwr[-1]]['technique'] = forecast[algo+'_tech']  
            transfer_values(data["algorithms"][algo]["params_"+pwr[-1]], params, algo) 
        data['predictions_'+pwr[-1]] = predictions[best_algo]
      #re-initialization
      for algo in ["rf", "knn", "grb", "dt", "svr", "lr"]:
        predictions[algo] = [] 
      best_algo = ''
      best_score = 50000000

    document = data.copy()
    result = await CompletedForecasts.insert_one(document)
    return {"data":"OK"}  

#forecast with neural networks
async def create_nn_forecast(forecast):
    
    data["project_name"] = forecast["project_name"]
    data["window"] = forecast["input_size"]
    data["horizon"] = forecast["horizon"]
    t = datetime.datetime.now()
    data["time"] = t.strftime("%d-%m-%Y %H:%M")
    
    #initializations
    for pwr in ['pwrA','pwrB','pwrC']:
      data["predictions_"+pwr[-1]] = []
      data["algorithms"]['nn']["used"] = False
      data["algorithms"]['nn']["performance"][pwr] = 0.0 
    #deactivate ml algorithms
    for algo in ["rf", "knn", "grb", "dt", "svr", "lr"]:
      data["algorithms"][algo]["used"] = False
      for pwr in ['pwrA','pwrB','pwrC']:
        data["algorithms"][algo]["performance"][pwr] = 0.0

    data["algorithms"]["nn"]["used"] = True
    data["algorithms"]["nn"]["parameters"]["hidden_layers"] = forecast["hidden_layers"]
    data["algorithms"]["nn"]["parameters"]["hidden_size"] = forecast["hidden_size"]
    data["algorithms"]["nn"]["parameters"]["activation_hidden"] = forecast["activation_hidden"]
    data["algorithms"]["nn"]["parameters"]["epochs"] = forecast["epochs"]
    data["algorithms"]["nn"]["parameters"]["batch_size"] = forecast["batch_size"]
    data["algorithms"]["nn"]["parameters"]["learning_rate"] = forecast["learning_rate"]
    data["algorithms"]["nn"]["parameters"]["technique"] = forecast["technique"]

    horizon = forecast["horizon"]
    window = forecast["input_size"]
    epochs = forecast["epochs"]
    hidden = forecast["hidden_layers"]
    hidden_size = forecast["hidden_size"]
    batch_size = forecast["batch_size"]
    activation = forecast["activation_hidden"]
    learning_rate = forecast["learning_rate"]
    technique = forecast["technique"]

    if (forecast["pwrA"]):
      preds, score = nn_predictions(horizon, window, 'pwrA',technique, hidden, hidden_size, activation, epochs, learning_rate, batch_size)
      data["predictions_A"] = list(map(lambda num: float(num), preds))
      data["algorithms"]["nn"]["performance"]["pwrA"] = round(score,4)
    if (forecast["pwrB"]):
      preds, score = nn_predictions(horizon, window,'pwrB',technique, hidden, hidden_size, activation, epochs, learning_rate, batch_size)
      data["predictions_B"] = list(map(lambda num: float(num), preds))
      data["algorithms"]["nn"]["performance"]["pwrB"] = round(score,4)
    if (forecast["pwrC"]):
      preds, score = nn_predictions(horizon, window,'pwrC',technique, hidden, hidden_size, activation, epochs, learning_rate, batch_size)
      data["predictions_C"] = list(map(lambda num: float(num), preds))
      data["algorithms"]["nn"]["performance"]["pwrC"] = round(score,4)
        
    document = data.copy()
    result = await CompletedForecasts.insert_one(document)
    return {"data":"OK"}  
