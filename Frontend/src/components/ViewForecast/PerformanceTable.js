import React from "react";
import './PerformanceTable.module.css';

const PerformanceTable = props =>{    
    const createTableHeads = params => {
        const used_algos = Object.keys(params).filter(item => params[item]["used"])
        let ret = []
        for (const property in params[used_algos[0]]['performance']){
            if (params[used_algos[0]]['performance'][property] !== 0)
                ret.push(<th key={Math.random()}>{property}</th>)
        }
        return ret;        
    }
        
    const createRowData = performance => {
        let ret = []
        ret.push()
        for (const phase in performance){
            if (performance[phase] !== 0){
                ret.push(<td key={Math.random()}>{performance[phase]}</td>)
            } 
        }
        return ret;        
    }

    const createTableRows = algos => {
        let ret = []
        for (const algo in algos){
            if(algos[algo]["used"] !== false){
                ret.push(<tr key={Math.random()}>
                <td >{algos[algo]['name']}</td>
                {createRowData(algos[algo]['performance'])}    
            </tr>)
            }
        }
        return ret
    }
    
    return(
        <table>
            <thead>
                <tr>
                    <th>Algorithm</th>
                    {createTableHeads(props.algorithms)}
                </tr>   
            </thead> 
            <tbody>
                {createTableRows(props.algorithms)}
            </tbody>    
        </table>
    )
}

export default PerformanceTable;