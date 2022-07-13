import React from "react";
import classes from './BestAlgoPres.module.css';

const BestAlgoPres = props =>{
    
    const createParagraphs = params => {
        let ret = []
        if (props.algo !== 'Custom Neural Network'){
            if (params.technique === 'multimodel' || params.technique === 'chained-multimodel'){
                return [<p>technique:{params.technique}</p>]
            }    
        }
        let zero = false;
        if (props.algo === 'Custom Neural Network' && params.hidden_layers === 0){
            zero = true;
        }
        for (const property in params){
                if (!zero || !['hidden_size','activation_hidden'].includes(property)){
                    ret.push(<p key={Math.random()}>{property}: {String(params[property])}</p>)
                }
        }
        return ret;        
    }
    
    return(
        <div>
            <h3 className={classes['phase']}><u>{props.phase}</u></h3>
            <p>Όνομα αλγορίθμου:{props.algo}</p>
            <p>Παράμετροι</p>
            {createParagraphs(props.params)}
        </div>
    )
}

export default BestAlgoPres;