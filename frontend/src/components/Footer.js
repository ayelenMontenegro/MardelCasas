import "../styles/Footer.css"
import React from 'react'

const Footer = () => {
    return (
    <footer>
        <div className="contact">
            <div className="addresses">
                <div className="contactInfo infoOne">
                    <img className="contactImg" src="/assets/rrss_icons/pin.png" alt="pin"/>
                    <p>Alvarado 1560, Mar del Plata, <br id="footerBr"/>Buenos Aires</p>
                </div>
                <div className="mob">
                <div  className="contactInfo infoTwo">
                    <img className="contactImg" src="/assets/rrss_icons/telephone.png" alt="telephone"/>
                    <p>+ 54 223 5391098</p>
                </div>
                <div  className="contactInfo infoThree">
                    <img className="mailImg" src="/assets/rrss_icons/mail.png" alt="email"/>
                    <p>info@mardelcasas.com</p>
                </div>
                </div>
            </div>
            <div className="socialNetworks">
                <a href="www.facebook.com" target="_blank">
                    <img className="rrssImg" src="/assets/rrss_icons/facebook.png" alt="facebook"/>
                </a>
                <a href="www.instagram.com" target="_blank">
                    <img className="rrssImg" src="/assets/rrss_icons/instagram.png" alt="instagram"/>
                </a>
                <a href="www.twitter.com" target="_blank">
                    <img className="rrssImg" src="/assets/rrss_icons/twitter.png" alt="twitter"/>
                </a>
            </div>
        </div>
        <div className="copyright">
            <p> Copyright Cohort 21 | MindHub</p>
        </div>
    </footer>
    )
}

export default Footer
