import time
import numpy as np
import pandas as pd

from helpers import get_samples, mape
from sklearn.metrics import make_scorer
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from keras.callbacks import EarlyStopping

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.models import Model, Sequential 
from tensorflow.keras.layers import Dense, Input, GlobalMaxPooling1D, Conv1D, MaxPooling1D, LSTM


def nn_predictions(horizon, window, power, technique, hidden, hidden_size, activation_hidden, epochs, learning_rate, batch_size):
    resampled, actual = pd.read_csv('complete_data_utc.csv', header=0), pd.read_csv('actual_data_utc.csv', header=0)
    X,Y = get_samples(resampled[power],window,horizon,technique)
    #scaling data
    x = []
    y = []
    scalers = []
    for i in range(0,X.shape[0]):
      scaler = MinMaxScaler(feature_range = (0, 1))
      x_train = scaler.fit_transform(X[i].reshape(-1,1))
      x.append(x_train.reshape(1,-1).flatten())
      y_train = scaler.transform(Y[i].reshape(-1,1))
      y.append(y_train.flatten())
      scalers.append(scaler)

    x = np.array(x)
    y = np.array(y)
    
    limit = -horizon 
    Xtrain, Ytrain = x[:limit],y[:limit]
    Xtest, Ytest = x[limit:],y[limit:]
    
    opt = keras.optimizers.Adam(learning_rate=learning_rate)
    output_layer_size = horizon if technique == 'multioutput' else 1

    if (technique == 'multimodel'):
      predictions = []
      for k in range(horizon):
        
        i = Input(shape=(window,))
        if (hidden == 0):
          #no hidden layers
          x = Dense(1)(i)
        else:
          #one or more hidden layers
          x = Dense(hidden_size[0], activation=activation_hidden[0])(i)
          for j in range(hidden-1):
            x = Dense(hidden_size[j+1], activation=activation_hidden[j+1])(x)
          x = Dense(1)(x)
        model = Model(i,x)

        model.compile(loss='mape',optimizer=opt)
      
        r = model.fit(
            Xtrain,
            Ytrain[:,k],
            epochs=epochs,batch_size=batch_size,
            validation_split=0.1, shuffle=False,
            callbacks=[EarlyStopping(monitor='val_loss', patience=30, min_delta=0.02, restore_best_weights=True)],
            verbose=0)
        
        p = model.predict(Xtest[-1].reshape(1,-1))
        predictions.append(p)  
      predictions = np.concatenate(predictions, axis=0 )
      preds = list(scalers[-1].inverse_transform(predictions).reshape(1,-1).flatten())

    else:

      i = Input(shape=(window,))
      if (hidden == 0):
        #no hidden layers
        x = Dense(output_layer_size)(i)
      else:
        #one or more hidden layers
        x = Dense(hidden_size[0], activation=activation_hidden[0])(i)
        for j in range(hidden-1):
          x = Dense(hidden_size[j+1], activation=activation_hidden[j+1])(x)
        x = Dense(output_layer_size)(x)
      model = Model(i,x)    
      
      model.compile(loss='mape',optimizer=opt)
      
      r = model.fit(
          Xtrain,
          Ytrain,
          epochs=epochs,batch_size=batch_size,
          validation_split=0.1, shuffle=False,
          callbacks=[EarlyStopping(monitor='val_loss', patience=30, min_delta=0.02, restore_best_weights=True)],
          verbose=0)
      
      if (technique == 'multioutput'):
        predictions = model.predict(Xtest[-1].reshape(1,-1))
        preds = list(scalers[-1].inverse_transform(predictions.reshape(-1,1)).flatten())
      elif (technique == 'multistep'):
        multistep_predictions = []
        last_x = Xtest[0]
        while len(multistep_predictions) < horizon:
            p = model.predict(last_x.reshape(1, -1))[0]
            multistep_predictions.append(p)
            last_x = np.roll(last_x, -1)
            last_x[-1] = p
        multistep_predictions = np.concatenate( multistep_predictions, axis=0 )
        preds = list(scalers[-horizon].inverse_transform(multistep_predictions.reshape(-1,1)).flatten())
    return preds, mape(list(actual[power])[-horizon:], preds)
