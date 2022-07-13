import React, {useState, useRef} from 'react';
import Plot from 'react-plotly.js';
import classes from './PhasePlot.module.css';

const config = {
  displayModeBar: false
}

const PhasePlot = props => {
  const [indexRange, setIndexRange] = useState({'from':0,'until':props.data.time.length});
  const [error,setError] = useState([false,""]);
  
  const data = [
    {
      x: props.data.time.slice(indexRange.from,indexRange.until),
      y: props.data.phase.slice(indexRange.from,indexRange.until),
      type: 'scatter'
    }
  ];

    let layout= {
        width: 900,
        height: 450,
        title: '',
        yaxis: {fixedrange: true},
        xaxis : {fixedrange: true}
    } 
    
    layout.title = props.phase
    
    const inputFromRef = useRef();
    const inputUntilRef = useRef();
    
    const projectHandler = () => {
      let fromValue = inputFromRef.current.value;
      let untilValue = inputUntilRef.current.value;

      fromValue = fromValue.slice(0,10) + 'T' + fromValue.slice(11)+':00';
      untilValue = untilValue.slice(0,10) + 'T' + untilValue.slice(11)+':00';

      const fromIndex = props.data.time.findIndex(cur => cur === fromValue);
      const untilIndex = props.data.time.findIndex(cur => cur === untilValue);

      if (fromValue === " :00" && untilValue === " :00"){
        setError([true,"Παρακαλώ συμπληρώστε τις δύο ημερομηνίες"])  
      }
      else if (fromValue === " :00"){
        setError([true,"Παρακαλώ συμπληρώστε την πρώτη ημερομηνία"])  
      }
      else if (untilValue === " :00"){
        setError([true,"Παρακαλώ συμπληρώστε την δεύτερη ημερομηνία"]) 
      }
      else if (!fromValue.endsWith(':00:00') || !untilValue.endsWith(':00:00')){
        setError([true,"Οι ημερομηνίες πρέπει να έχουν μηδενικά λεπτά"])  
      }
      else if (fromIndex === -1 && untilIndex === -1){
        setError([true,"Οι ημερομηνίες πρέπει να'ναι εντός των χρονικών ορίων"])    
      }
      else if (fromIndex === -1){
        setError([true,"Η πρώτη ημερομηνία πρέπει να'ναι εντός των χρονικών ορίων"])    
      }
      else if (untilIndex === -1){
        setError([true,"Η δεύτερη ημερομηνία πρέπει να'ναι εντός των χρονικών ορίων"])    
      }
      else if (fromIndex >= untilIndex){
        setError([true,"Η δεύτερη ημερομηνία πρέπει να'ναι μεταγενέστερη"])
      }
      else{
        if (error[0]===true){
          setError([false,""])  
        }
        setIndexRange({'from': fromIndex,'until': untilIndex+1})
      }      
    }

    return(
        <div className={classes['container']}>
            <h4>Παρακαλώ επιλέξτε χρονικό διάστημα:</h4>
            <div className={classes['limits']}>
                <label>Από</label>
                <input
                      ref={inputFromRef} 
                      type={'datetime-local'}
                      min="2021-12-19T14:00" 
                      max="2022-01-16T13:00" 
                      step="3600"
                      // defaultValue="2021-12-19T14:00"
                />
                <label>Εώς</label>
                <input
                      ref={inputUntilRef} 
                      type={'datetime-local'}
                      min="2021-12-19T15:00"
                      max="2022-01-16T14:00"
                      step="3600"
                      // defaultValue="2022-01-16T14:00"
                />
                <button className={classes['project-button']} onClick={projectHandler}>Προβολή</button>
            </div>
            {error[0] && <p className={classes['err-msg']}>{error[1]}</p>}
            <Plot
                data = {data}
                layout={layout}
                config={config}
            />
        </div>  
    )
}

export default PhasePlot;