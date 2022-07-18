from dask.distributed import Client
#connect with cluster scheduler
client = Client("tcp://192.168.1.166:8786")

import warnings

warnings.filterwarnings('ignore')

import numpy as np
import pandas as pd
import seaborn as sns
import datetime as dt

from sklearn.neighbors import KNeighborsRegressor

from sklearn.multioutput import MultiOutputRegressor
from sklearn.multioutput import RegressorChain
from sklearn.metrics import mean_absolute_percentage_error, r2_score
from sklearn.model_selection import RandomizedSearchCV, GridSearchCV , TimeSeriesSplit

import dask_ml.model_selection as dcv

from sklearn.metrics import make_scorer
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from keras.callbacks import EarlyStopping
import tensorflow as tf

np.random.seed(15)
tf.random.set_seed(15)

grid_parameters = {
    'rf':{
        "n_estimators": [i for i in range(10,250,10)],
        "max_features":[0.3, 0.4, 0.5, 0.6, 0.9,'sqrt','auto','log2'],
        "max_depth": [2,5,10,40,None],
        "max_samples": [0.3, 0.5, 0.6, 0.8, 0.9],
        "bootstrap": [True]
    },
    'dt':{
        'criterion': ['squared_error', 'absolute_error'],
        'max_depth': [2,5,10,40,None],
        'min_samples_split': [i for i in range(2,30,2)],
        'min_samples_leaf': [i for i in range(1,30,2)],
        'ccp_alpha': [0.0, 0.1]
    },
    'knn':{
        "n_neighbors": [i for i in range(2,100,5)],
        "algorithm": ['auto', 'ball_tree', 'kd_tree', 'brute'],
        "leaf_size": [i for i in range(10,200,20)],
        "weights": ['uniform', 'distance'],
        "metric":['minkowski','chebyshev', 'manhattan', 'euclidean'],
        "p":[3]
    },
    'lr':{
        'fit_intercept':[True,False]
    },
    'svr':{
        'kernel' : ['linear', 'poly', 'rbf', 'sigmoid'],
        'C' : [i for i in range(1,80,20)],
        'degree' : [i for i in range(2,6)],
        'coef0' : [0.01, 0.10, 0.5, 0.8],
        'gamma' : ['auto','scale'],
        'epsilon': [i/100 for i in range(1,81,8)]
    },
    'grb':{
        "loss": ['squared_error', 'absolute_error'],
        "learning_rate": [0.05, 0.10, 0.25, 0.3, 0.5],
        "n_estimators": [i for i in range(10,250,10)],
        "max_depth": [3,5,10,20],
        "min_samples_split": [i for i in range(2,50,10)],
    }
}

rand_parameters = {
    'rf':{
        "n_estimators": [i for i in range(10,300,5)],
        "max_features":[0.3, 0.35, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,'sqrt','auto','log2'],
        "max_depth": [2,5,10,20,40,100,None],
        "max_samples": [i/10 for i in range(1,11,1)],
        "bootstrap": [True]
    },
    'dt':{
        'criterion': ['squared_error', 'absolute_error'],
        'max_depth': [2,3,5,8,10,15,20,40,100,None],
        'min_samples_split': [i for i in range(2,40,1)],
        'min_samples_leaf': [i for i in range(1,40,1)],
        'ccp_alpha': [0.0, 0.1]
    },
    'knn':{
        "n_neighbors": [i for i in range(2,100)],
        "algorithm": ['auto', 'ball_tree', 'kd_tree', 'brute'],
        "leaf_size": [i for i in range(10,250,10)],
        "weights": ['uniform', 'distance'],
        "metric":['minkowski','chebyshev', 'manhattan', 'euclidean'],
        "p":[3]
    },
    'lr':{
        'fit_intercept':[True,False]
    },
    'svr':{
        'kernel' : ['linear', 'poly', 'rbf', 'sigmoid'],
        'C' : [i for i in range(1,100,10)],
        'degree' : [i for i in range(2,9)],
        'coef0' : [0.01, 0.10, 0.3, 0.5, 0.8],
        'gamma' : ['auto','scale'],
        'epsilon': [i/100 for i in range(1,81,2)]
    },
    'grb':{
        "loss": ['squared_error', 'absolute_error'],
        "learning_rate": [0.05, 0.10, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 0.75],
        "n_estimators": [i for i in range(10,300,10)],
        "max_depth": [3,4,5,6,10,20],
        "min_samples_split": [i for i in range(2,50,5)],
    }
}

def get_samples(s,window_size,horizon,technique):
    series = s.to_numpy()
    Tx = window_size
    Ty = 1 if technique == 'multistep' else horizon 
    X = []
    Y = []
    for t in range(len(series) - Tx - Ty + 1):
        x = series[t:t+Tx]
        X.append(x)
        y = series[t+Tx:t+Tx+Ty]
        Y.append(y)
    X = np.array(X).reshape(-1,Tx)
    Y = np.array(Y) if technique == 'multistep' else np.array(Y).reshape(-1,Ty)
    return (X,Y)

def mape(actual, predict):
    return 100*mean_absolute_percentage_error(actual,predict)

def randomized_optimization(algorithm,model,Xtrain,Ytrain,technique,iterations):
    my_score = make_scorer(mape, greater_is_better = False)
    tscv = TimeSeriesSplit(n_splits=4)
    rs = dcv.RandomizedSearchCV(
      estimator=model,
      n_iter=iterations,
      param_distributions=rand_parameters[algorithm],
      cv=tscv,
      n_jobs=-1,
      random_state=42,
      return_train_score=False)  
      
    if (technique == 'multistep'):
        rs.fit(Xtrain, Ytrain.ravel())
        return rs.best_params_
    elif (technique == 'multimodel'):
        res = MultiOutputRegressor(rs).fit(Xtrain,Ytrain)
        return res
    else:
        res = RegressorChain(rs).fit(Xtrain,Ytrain)
        return res

def grid_optimization(algorithm,model,Xtrain,Ytrain,technique):
  my_score = make_scorer(mape, greater_is_better = False)
  tscv = TimeSeriesSplit(n_splits=4)
  if (algorithm == 'lr'):
    gs = GridSearchCV(estimator=model,
                    scoring=my_score,
                    param_grid=grid_parameters['lr'],
                    cv=tscv,
                    n_jobs=-1,
                    return_train_score=True) 
  else: 
      gs = dcv.GridSearchCV(estimator=model,
                        scoring=my_score,
                        param_grid=grid_parameters[algorithm],
                        cv=tscv,
                        n_jobs=-1,
                        return_train_score=True)
  if (technique == 'multimodel'):
    res = MultiOutputRegressor(gs).fit(Xtrain,Ytrain)
    return res
  elif (technique == 'chained-multimodel'):
    res = RegressorChain(gs).fit(Xtrain,Ytrain)
    return res  
  else:
    gs.fit(Xtrain,Ytrain)
    return gs.best_params_

def make_predictions(horizon,window,power,model,algorithm,technique,opt,iters):
    best_p = {}
    resampled, actual = pd.read_csv('complete_data_utc.csv', header=0), pd.read_csv('actual_data_utc.csv', header=0)
    X,Y = get_samples(resampled['diff_log_'+power].iloc[1:],window,horizon,technique) #first value is nan due to diff
    
    limit = -horizon 
    Xtrain, Ytrain = X[:limit],Y[:limit]
    Xtest, Ytest = X[limit:],Y[limit:]
    last_train = list(resampled['log_'+power])[-horizon-1]
    
    if (technique == 'multistep'):
        params = randomized_optimization(algorithm,model(),Xtrain,Ytrain,technique,iters) if opt=='rs' else grid_optimization(algorithm,model(),Xtrain,Ytrain,technique)
        best_p = params
        model = model(**params)
        model.fit(Xtrain,Ytrain)
        multistep_predictions = []
        last_x = Xtest[0]
        while len(multistep_predictions) < horizon:
            p = model.predict(last_x.reshape(1, -1))[0]
            multistep_predictions.append(p)
            last_x = np.roll(last_x, -1)
            last_x[-1] = p
        multistep_predictions = last_train + np.cumsum(multistep_predictions)
        preds = np.exp(multistep_predictions)
    elif (technique == 'multimodel'):
        res = randomized_optimization(algorithm,model(),Xtrain,Ytrain,technique,iters) if opt=='rs' else grid_optimization(algorithm,model(),Xtrain,Ytrain,technique)
        predictions = res.predict(Xtest[-1].reshape(1, -1)).flatten()
        predictions = last_train + np.cumsum(predictions)
        preds = np.exp(predictions)
    else:
        res = randomized_optimization(algorithm,model(),Xtrain,Ytrain,technique,iters) if opt=='rs' else grid_optimization(algorithm,model(),Xtrain,Ytrain,technique)
        predictions = res.predict(Xtest[-1].reshape(1, -1)).flatten() 
        predictions = last_train + np.cumsum(predictions)
        preds = np.exp(predictions)
    return preds, mape(list(actual[power])[-horizon:],preds), best_p

