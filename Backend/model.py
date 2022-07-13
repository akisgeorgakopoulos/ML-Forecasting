from pydantic import BaseModel
from typing import Optional,Dict
from datetime import datetime, time, timedelta

#Main Models
class PerformanceModel(BaseModel):
    pwrA: float
    pwrB: float
    pwrC: float

#Neural Network Models
class NNParams(BaseModel):
    hidden_layers: int
    hidden_size: list
    activation_hidden: list
    epochs: int
    batch_size: int
    learning_rate: float
    technique: str

class NNInfo(BaseModel):
    name:str
    used:bool
    performance: PerformanceModel
    parameters: NNParams

class NNForecastParameters(BaseModel):
    project_name: str
    pwrA: bool
    pwrB: bool
    pwrC: bool
    horizon: int
    input_size: int
    hidden_layers: int
    hidden_size: list
    activation_hidden: list
    epochs: int
    learning_rate: float
    batch_size: int
    technique: str

#Parameters Models
class LRParams(BaseModel):
    fit_intercept: bool
    technique: str

class RFParams(BaseModel):
    n_estimators: int
    max_features: str
    max_depth: str
    min_samples_split: int
    bootstrap: str
    technique: str

class SVRParams(BaseModel):
    kernel: str
    C: int
    degree: int
    coef0: float
    gamma: str
    epsilon: float
    technique: str

class GRBParams(BaseModel):
    loss: str
    learning_rate: float
    n_estimators: int
    max_depth: int
    min_samples_split: int
    technique: str

class KNNParams(BaseModel):
    n_neighbors: int
    algorithm: str
    leaf_size: int
    weights: str
    metric: str
    p: int
    technique: str

class DTParams(BaseModel):
    criterion: str
    max_depth: str
    min_samples_split: int
    min_samples_leaf: int
    ccp_alpha: float
    technique: str

#Info Models
class LRInfo(BaseModel):
    name:str
    used:bool
    performance: PerformanceModel
    params_A: LRParams
    params_B: LRParams
    params_C: LRParams

class RFInfo(BaseModel):
    name:str
    used:bool
    performance: PerformanceModel
    params_A: RFParams
    params_B: RFParams
    params_C: RFParams

class SVRInfo(BaseModel):
    name:str
    used:bool
    performance: PerformanceModel
    params_A: SVRParams
    params_B: SVRParams
    params_C: SVRParams

class GRBInfo(BaseModel):
    name:str
    used:bool
    performance: PerformanceModel
    params_A: GRBParams
    params_B: GRBParams
    params_C: GRBParams

class KNNInfo(BaseModel):
    name:str
    used:bool
    performance: PerformanceModel
    params_A: KNNParams
    params_B: KNNParams
    params_C: KNNParams

class DTInfo(BaseModel):
    name:str
    used:bool
    performance: PerformanceModel
    params_A: DTParams
    params_B: DTParams
    params_C: DTParams

#Total scores information model
class ScoresModel(BaseModel):
    nn: NNInfo
    lr: LRInfo
    rf: RFInfo
    svr: SVRInfo
    grb: GRBInfo
    knn: KNNInfo
    dt: DTInfo
    
class CompletedForecast(BaseModel):
    time: str
    project_name: str
    horizon: int
    window: int
    predictions_A: list
    predictions_B: list
    predictions_C: list
    algorithms: ScoresModel

class ForecastParameters(BaseModel):
    project_name: str
    pwrA: bool
    pwrB: bool
    pwrC: bool
    horizon: int
    window_size: int
    rf: bool
    rf_ho: str
    rf_iter: int
    rf_tech: str
    knn: bool
    knn_ho: str
    knn_iter: int
    knn_tech: str   
    svr: bool
    svr_ho: str
    svr_iter: int
    svr_tech: str
    grb: bool
    grb_ho: str
    grb_iter: int
    grb_tech: str
    lr: bool
    lr_tech: str
    dt: bool
    dt_ho: str
    dt_iter: int
    dt_tech: str

#data models
class Data(BaseModel):
    Time: datetime
    pwrA:float
    pwrB:float
    pwrC: float    

class Name(BaseModel):
    project_name: str