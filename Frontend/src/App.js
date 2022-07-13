import React,{ useState } from 'react';
import PhasesPlots from './components/DataOverview/PhasesPlots';
import CompletedForecasts from './components/CompletedForecasts/CompletedForecasts';
import ViewForecast from './components/ViewForecast/ViewForecast';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import WelcomePage from './components/WelcomePage/WelcomePage';
import OptionsMenu from './components/OptionsMenu/OptionsMenu';
import NewForeacast from './components/NewForecast/NewForecast';
import NNForeacast from './components/NNForecast/NNForecast';
import HeaderProvider from './store/HeaderProvider';


const data = {
  time:'2020-01-01',
  project_name:"Project1",
  horizon:0,
  input:0,
  predictions_A:[],
  predictions_B:[],
  predictions_C:[],
  algorithms:{
    'nn':{
      'name':'Custom Neural Network',
      'used':false,
      'performance':{'pwrA':0,'pwrB':0,'pwrC':0},
      "parameters":{"hidden_layers": 0, "hidden_size": [], "activation_hidden": [], "epochs": 0, "learning_rate":0, "batch_size": 0, "technique":"-"},
    },
    'rf':{
      'name':'Random Forest',
      'used':false,
      'performance':{'pwrA':0,'pwrB':0,'pwrC':0},
      "params_A":{"n_estimators":0, "max_depth":"0", "min_samples_split":0, "bootstrap":false, "max_features":"0", "technique":"-"},
      "params_B":{"n_estimators":0, "max_depth":"0", "min_samples_split":0, "bootstrap":false, "max_features":"0", "technique":"-"},
      "params_C":{"n_estimators":0, "max_depth":"0", "min_samples_split":0, "bootstrap":false, "max_features":"0", "technique":"-"}
    },
    'knn':{
      'name':'K-Nearest Neighbors',
      'used':false,
      'performance':{'pwrA':0,'pwrB':0,'pwrC':0},
      "params_A":{"n_neighbors":0, "algorithm":"-", "leaf_size":0, "weights":"-", "metric":"-","p":3, "technique":"-"},
      "params_B":{"n_neighbors":0, "algorithm":"-", "leaf_size":0, "weights":"-", "metric":"-","p":3, "technique":"-"},
      "params_C":{"n_neighbors":0, "algorithm":"-", "leaf_size":0, "weights":"-", "metric":"-","p":3, "technique":"-"}
    },
    'grb':{
      'name':'Gradient Boosting',
      'used':false,
      'performance':{'pwrA':0,'pwrB':0,'pwrC':0},
      "params_A":{"loss":"-", "learning_rate":0.0, "n_estimators":0, "max_depth":0, "min_samples_split":0, "technique":"-"},
      "params_B":{"loss":"-", "learning_rate":0.0, "n_estimators":0, "max_depth":0, "min_samples_split":0, "technique":"-"},
      "params_C":{"loss":"-", "learning_rate":0.0, "n_estimators":0, "max_depth":0, "min_samples_split":0, "technique":"-"}
    },
    'svr':{
      'name':'Support Vector Regressor',
      'used':false,
      'performance':{'pwrA':0,'pwrB':0,'pwrC':0},
      "params_A":{"kernel":"-","C":0,"degree":0,"coef0":0.0,"gamma":"-", 'epsilon':0.0, "technique":"-"},
      "params_B":{"kernel":"-","C":0,"degree":0,"coef0":0.0,"gamma":"-", 'epsilon':0.0, "technique":"-"},
      "params_C":{"kernel":"-","C":0,"degree":0,"coef0":0.0,"gamma":"-", 'epsilon':0.0, "technique":"-"}
    },
    'lr':{
      'name':'Linear Regressor',
      'used':false,
      'performance':{'pwrA':0,'pwrB':0,'pwrC':0},
      "params_A":{"fit_intercept":true, "technique":"-"},
      "params_B":{"fit_intercept":true, "technique":"-"},
      "params_C":{"fit_intercept":true, "technique":"-"}
    },
    'dt':{
      'name':'Decision Tree',
      'used':false,
      'performance':{'pwrA':0,'pwrB':0,'pwrC':0},
      "params_A":{"criterion":'-', "max_depth":'-', 'min_samples_split':0, 'min_samples_leaf':0, 'ccp_alpha':0.0,"technique":"-"},
      "params_B":{"criterion":'-', "max_depth":'-', 'min_samples_split':0, 'min_samples_leaf':0, 'ccp_alpha':0.0,"technique":"-"},
      "params_C":{"criterion":'-', "max_depth":'-', 'min_samples_split':0, 'min_samples_leaf':0, 'ccp_alpha':0.0,"technique":"-"}
    }
  }
}


const  App = () => {
  const [globalState,setGlobalState] = useState('Welcome');
  
  const changeGlobalHandler = state =>{
    setGlobalState(state);
  }

  const moreHandler = infos => {
    data.time = infos.time;
    data.project_name = infos.project_name;
    data.algorithms = infos.algorithms;
    data.best_scores = infos.best_scores;
    data.predictions_A = infos.predictions_A;
    data.predictions_B = infos.predictions_B;
    data.predictions_C = infos.predictions_C;
    data.input = infos.input;
    data.horizon = infos.horizon;
    setGlobalState("View Forecast");
  }
    
  return (
    <HeaderProvider>
        <Header />
        <main>
          {globalState ==='New Forecast' && <NewForeacast onBack={changeGlobalHandler}/>}
          {globalState ==='New Neural' && <NNForeacast onBack={changeGlobalHandler}/>}
          {globalState ==='View Forecast' && <ViewForecast {...data}  onBack={changeGlobalHandler} />}
          {globalState ==='Completed Forecasts' && <CompletedForecasts onBack={changeGlobalHandler} onMore={moreHandler}/>}
          {globalState ==='Phases Plots' && <PhasesPlots onBack={changeGlobalHandler}/>}
          {globalState ==='Welcome' && <WelcomePage onShowMenu={changeGlobalHandler}/>}
          {globalState ==='Menu' && <OptionsMenu onChangeState={changeGlobalHandler}/>}
        </main>
        <Footer/>
    </HeaderProvider>
  );
}

export default App;
