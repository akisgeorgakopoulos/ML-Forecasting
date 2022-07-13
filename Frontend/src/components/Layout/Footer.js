import React from 'react';
import classes from './Footer.module.css';
import ntuaImg from "./ntua.png";

const Footer = props =>{
    return(
        <footer className={classes["footer"]}>
            <h2 className={classes['creator']}>Δημιουργήθηκε απ'τον ΑΜ Γεωργακόπουλο στα πλαίσια της διπλωματικής του εργασίας</h2>
            <img src={ntuaImg} alt="NTUA logo" className={classes['ntua-img']}/>
        </footer>
    )
}

export default Footer;