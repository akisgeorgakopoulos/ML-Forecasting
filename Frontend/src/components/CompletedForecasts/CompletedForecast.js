import React from "react";
import classes from './CompletedForecast.module.css';

const CompletedForecast = props =>{

    let best_scores = {
        'pwrA':{"algo":"-","mape":0,"params":{},"name":"","predictions":[]},
        'pwrB':{"algo":"-","mape":0,"params":{},"name":"","predictions":[]},
        'pwrC':{"algo":"-","mape":0,"params":{},"name":"","predictions":[]}
    }

    const powers = ['pwrA','pwrB','pwrC'];
    
    const selectParams = phase =>{
        if (phase === 'pwrA') return("params_A")
        if (phase === 'pwrB') return("params_B")
        if (phase === 'pwrC') return("params_C")
    }

    const selectPredictions = phase =>{
        if (phase === 'pwrA') return("predictions_A")
        if (phase === 'pwrB') return("predictions_B")
        if (phase === 'pwrC') return("predictions_C")
    }

    powers.forEach(phase => {
        if (props.algorithms['nn']["used"]){
            if(props.algorithms['nn'].performance[phase] !== 0){
                best_scores[phase].algo = 'nn';
                best_scores[phase].name = props.algorithms['nn'].name;
                best_scores[phase].mape = props.algorithms['nn'].performance[phase];
                best_scores[phase].params = props.algorithms['nn']["parameters"];
                best_scores[phase].predictions = props[selectPredictions(phase)];
            }
        }
        else{
            let classical_keys = Object.keys(props.algorithms).filter(algo => props.algorithms[algo]["used"])
            
            let min_key = classical_keys[0];
            let min_params = props.algorithms[min_key][selectParams(phase)];
            let min = props.algorithms[min_key].performance[phase];
            let min_name = props.algorithms[min_key].name;
            let min_predictions = props[selectPredictions(phase)];

            if (min !== 0){
                classical_keys.forEach(algo =>{
                    if (props.algorithms[algo].performance[phase] < min){
                        min_key = algo;
                        min_name = props.algorithms[min_key].name;
                        min = props.algorithms[min_key].performance[phase];
                        min_params = props.algorithms[min_key][selectParams(phase)];
                    }
                })
                best_scores[phase].algo = min_key;
                best_scores[phase].name = min_name;
                best_scores[phase].mape = min;
                best_scores[phase].params = min_params;
                best_scores[phase].predictions = min_predictions;
            }
        }
    })

    const clickHandler = () => {
        props.more({...props , "best_scores":best_scores})
    }
        
    return(
            <li className={classes['info-container']}>
                <h2>{props.project_name}</h2>
                <ul className={classes["info-list"]}>
                    <li>
                        <p>Χρόνος Υποβολής</p>
                        <p>{props.time}</p>
                    </li>
                    <li>
                        <p>Φάση A</p>
                        <p>{best_scores['pwrA']['mape'] !== 0 ? best_scores['pwrA']['mape'] : "-"}</p>
                        <p>{best_scores['pwrA']['algo']}</p>
                    </li>
                    <li>
                        <p>Φάση B</p>
                        <p>{best_scores['pwrB']['mape'] !== 0 ? best_scores['pwrB']['mape'] : "-"}</p>
                        <p>{best_scores['pwrB']['algo']}</p>
                    </li>
                    <li>
                        <p>Φάση C</p>
                        <p>{best_scores['pwrC']['mape'] !== 0 ? best_scores['pwrC']['mape'] : "-"}</p>
                        <p>{best_scores['pwrC']['algo']}</p>
                    </li>
                    <li className={classes["button-container"]}>
                        <button className={classes["more-button"]} onClick={clickHandler}>Ανάλυση</button>
                    </li>
                </ul>
            </li>      
    )
}


export default CompletedForecast;