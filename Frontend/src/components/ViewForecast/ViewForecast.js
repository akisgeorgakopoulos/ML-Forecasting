import React, { useEffect, useState } from "react";
import Plot from 'react-plotly.js';
import classes from './ViewForecast.module.css';
import BestAlgoPres from "./BestAlgoPres";
import PerformanceTable from "./PerformanceTable";
  
const ViewForecast = props => {
    
    const selectPwr = phase =>{
        if (phase === 'pwrA') return("ΦΑΣΗ A")
        if (phase === 'pwrB') return("ΦΑΣΗ B")
        if (phase === 'pwrC') return("ΦΑΣΗ C")
    }

    const [isLoading,setIsLoading] = useState(true);
    const [loadedData,setLoadedData] = useState({"time":[],"pwrA":[],"pwrB":[],"pwrC":[]});
      
    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchData = async () =>{ 
        const response = await fetch(`http://localhost:8000/data?last=${props.horizon*3 + 1}`);

        if (!response.ok){
        throw new Error();
        }
        const responseData = await response.json();
        let timeseries = {"time":[],"pwrA":[],"pwrB":[],"pwrC":[]};
        responseData.forEach(datapoint => {
            timeseries.time.push(datapoint.Time);
            timeseries.pwrA.push(datapoint.pwrA);
            timeseries.pwrB.push(datapoint.pwrB);
            timeseries.pwrC.push(datapoint.pwrC);
        }
        );
        setLoadedData(timeseries);
        setIsLoading(false);
        }

        fetchData().catch(error => {
            alert('Σφάλμα κατά την φόρτωση των χρονοσειρών...');
        });
    }, [props.best_scores, props.horizon])
      
    const backHandler = () => {
        props.onBack('Completed Forecasts')
    }

    const createPlot = (title,plot1,plot2) => {
        const trace1 = {
            x: plot1.x,
            y: plot1.y,
            type: 'scatter',
            mode: 'lines',
            name: plot1.name
        };          
        const trace2 = {
            x: plot2.x,
            y: plot2.y,
            type: 'scatter',
            name: plot2.name,
            line: {
                color: 'rgba(250, 6, 6, 0.795)'
            }
        };
        const data = [trace1, trace2];
        const config = {
            displayModeBar: false
        };
        const layout= {
            width: 1000,
            height: 550,
            title: title,
            yaxis: {fixedrange: true},
            xaxis : {fixedrange: true},
            showlegend: true
        }; 
        return (
            <Plot
                    key={Math.random()}
                    className={classes['plot']}
                    data = {data}
                    layout={layout}
                    config={config}
            />
        );
    };
    
    const createPlots = scores => {
        let ret = [] 
        for (const property in scores){
            if (scores[property]['mape'] !== 0){
                ret.push(createPlot(scores[property]['name'],
                {x:loadedData["time"], y:loadedData[property], name:property},
                {x:loadedData["time"].slice(-scores[property]['predictions'].length), y:scores[property]['predictions'], name:scores[property]['algo']})
                )
            }
        }
        return ret;
    }
    
    const createBestAlgosPres = scores => {
        let ret = []
        for (const property in scores){
            if (scores[property]['mape'] !== 0){
                ret.push(<BestAlgoPres 
                    key={Math.random()}
                    phase={selectPwr(property)} 
                    algo={scores[property]['name']} 
                    params={scores[property]['params']}
                />);
            }
        }
        return ret;    
    }

    return (
        <>        
            <button className={classes['back-button']} onClick={backHandler}>Πίσω</button>
            {isLoading && 
            <div className={classes["loading-content"]}>
                <h2 className={classes['title']}>Loading...</h2>    
            </div>
            }
            {!isLoading &&
            <div className={classes['main-content']}>
                <div className={classes['basic-infos']}>
                    <h1 className={classes['title']}>Βασικές πληροφορίες</h1>
                    <div className={classes['flxx']}>
                        <div className={classes['infos']}>
                            <div className={classes['info']}>
                                <p className={classes['label']}>Όνομα project: </p>
                                <p className={classes['prop-val']}>{props.project_name}</p>
                            </div>
                            <div className={classes['info']}>
                                <p className={classes['label']}>Υποβλήθηκε: </p>
                                <p className={classes['prop-val']}>{props.time}</p>    
                            </div>
                            <div className={classes['info']}>
                                <p className={classes['label']}>Ορίζοντας: </p>
                                <p className={classes['prop-val']}>{props.horizon}</p>    
                            </div>
                            <div className={classes['info']}>
                                <p className={classes['label']}>Είσοδοι: </p>
                                <p className={classes['prop-val']}>{props.input}</p>    
                            </div>
                        </div>
                    </div>  
                    <h2>Βέλτιστοι αλγορίθμοι</h2>
                    {createBestAlgosPres(props.best_scores)}
                </div>
                <div className={classes['plots']}>
                    <h1 className={classes['title']}>Γραφικά καλύτερων αλγορίθμων</h1>
                    {createPlots(props.best_scores)}    
                </div>
                <div className={classes['scores']}>
                    <h1 className={classes['title']}>Απόδοση αλγορίθμων</h1>
                    <PerformanceTable algorithms={props.algorithms}/>
                </div>
            </div>}
        </>    
    )
}

export default ViewForecast;