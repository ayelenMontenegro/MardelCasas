import React, { useEffect, useState } from 'react'
import { connect } from "react-redux"
import propertiesActions from '../redux/action/propertiesActions'

const HomeFilter = (props) => {

    const [searchProperties, setSearchProperties] = useState(false)
    const [filter, setFilter] = useState({ forSale: true, shortRental: false, isHouse: true, houseStyle: "house", numberOfBedrooms: 0, numberOfBathrooms: 0, isBrandNew: false, haveGarage: false, })

    //revisar si filter se inicializa como un objeto vacio o no. Creo que eberia inicializar con las propiedades inicializadas ya que al hacer click en buscar redirige al componente propertiesList y muestra la lista filtrada como minimo por forSale: true y isHouse: true/ houseStyle: "house" y en ese componenete se amplia los campos para filtrar

    useEffect(() => {
        console.log("hook pero no manda a action")
        if (searchProperties) {
            console.log("hook manda a action")
            async function getPropertiesFiltered() {
                try {
                    let res = await props.getPropertiesFiltered(filter)
                    if (!res.data.success) throw res.data.response
                    if (!res.data.response) throw res.data.response
                } catch (err) {
                    console.log(err)
                }
            }
            getPropertiesFiltered()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchProperties])

    const changeClassHandle = (e) => {
        let elementClicked = e.target.dataset.type
        let childrenUl = e.target.parentNode.children 
        for (var i = 0; i < childrenUl.length; i++) {
            if (childrenUl[i].dataset !== elementClicked) {
                childrenUl[i].className=" "
            } 
        }
        e.target.className="active"
        if (e.target.dataset.type === "forSale") {
            var forSaleValue = true
            var shortRentValue = false
        } else if (e.target.dataset.type === "shortRent") {
            forSaleValue = false
            shortRentValue = true
        } else {
            forSaleValue = false
            shortRentValue = false
        }
        setFilter({
            ...filter,
            forSale: forSaleValue,
            shortRental: shortRentValue,
        })
    }

    const checkHandler = (e) => {
        setFilter({
            ...filter,
            [e.target.name]: e.target.checked
        })
    }

    const inputHandler = (e) => {
        if (e.target.name === "houseStyle") {
            if (e.target.value === "house" ) {
                var ishouseValue  = true
            } else {
                ishouseValue = false
            } 
        } else {
            ishouseValue = false
        } 
        if (e.target.name === "numberOfBedrooms") {
            var numberOfBedroomsValue = e.target.value
        } else {
            numberOfBedroomsValue = filter.numberOfBedrooms
        }
        if (e.target.name === "numberOfBathrooms") {
            var numberOfBathroomsValue = e.target.value
        } else {
            numberOfBathroomsValue = filter.numberOfBathrooms
        }
        setFilter({
            ...filter,
            [e.target.name]: e.target.value,
            isHouse: ishouseValue,
            numberOfBedrooms: parseInt(numberOfBedroomsValue),
            numberOfBathrooms: parseInt(numberOfBathroomsValue)
        })
    }

    const searchClickHandler = () => {
        // console.log("buscar")
        setSearchProperties(true)
    }

    console.log(filter)
    console.log(props.propertiesFiltered)

    return (
        <div className="homeFilter">
            <div className="firstRow">
                <ul>
                    <li className="active" onClick={changeClassHandle} data-type="forSale">Venta</li>
                    <li onClick={changeClassHandle} data-type="forRent" >Alquiler</li>
                    <li onClick={changeClassHandle} data-type="shortRent" >Alquiler temporario</li>
                </ul>    
            </div>
            <div className="secondRow" >
                <div>
                    <select name="houseStyle" onChange={inputHandler}>
                        <option value="house">Casa</option>     
                        <option value="department">Departamento</option>     
                        <option>otra opcion</option>     
                        <option>otra opcion</option>     
                    </select>
                </div>
                <div>
                    <select name="numberOfBedrooms" onChange={inputHandler} >
                        <option>Dormitorios</option>
                        <option value="1">1 dormitorio</option>
                        <option value="2">2 dormitorios</option>
                        <option value="3">3 dormitorios</option>
                        <option value="4">4 dormitorios</option>
                        <option value="5">5 dormitorios</option>
                        <option value="6">6 o mas</option>
                        
                    </select>
                    <select name="numberOfBathrooms" onChange={inputHandler} >
                        <option>Baños</option>
                        <option value="1">1 baño</option>
                        <option value="2">2 baños</option>
                        <option value="3">3 baños</option>
                        <option value="4">4 baños</option>
                        <option value="5">5 baños</option>
                        <option value="6">6 o mas</option>
                    </select>
                </div>
                <div className="boxes">
                    <div>
                        <input type="checkbox" id="aEstrenar" name="isBrandNew" onChange={checkHandler}/>
                        <label htmlFor="aEstrenar">A estrenar</label>
                    </div>
                    <div>
                        <input type="checkbox" id="conCochera"name="haveGarage" onChange={checkHandler}/>
                        <label htmlFor="conCochera">Con cochera</label>
                    </div>
                </div>
            </div>
                <div className="homeFilterButton">
                    <button onClick={searchClickHandler}>Buscar</button>
                </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        propertiesFiltered: state.properties.properties
    }
}

const mapDispatchToProps = {
    getPropertiesFiltered: propertiesActions.getPropertiesFiltered

}
export default connect(mapStateToProps, mapDispatchToProps)(HomeFilter)