import React, {useContext,useState,useEffect} from 'react';
import HeaderContext from '../../store/header-context';
import classes from './Header.module.css';


const Header = props => {
    const headerCtx = useContext(HeaderContext);

    return(
        <header className={classes["header"]}>
            <h2 className={classes['app-title']}>ML Forecasting</h2>
            <div className={classes["stats"]}>
                <h3>Ολοκληρωμένες: {headerCtx.completed}</h3>
                <h3>Εκκρεμούν: {headerCtx.pending}</h3>
            </div>
        </header>
    )
}

export default Header;