import "../styles/Form.css";
import React from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/Navbar";
import { useState } from "react";
import { connect } from "react-redux";
import userActions from "../redux/action/userActions";
import GoogleLogin from "react-google-login";

const SignIn = (props) => {
  const [user, setUser] = useState({
    password: "",
    eMail: "",
  });
  const inputNameHandler = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };
  const submitUser = async () => {
    if (Object.values(user).includes("")) {
      console.log("Todos los campos son obligatorios");
    } else if (!user.eMail.includes("@")) {
      console.log("Por favor ingrese un email válido");
    } 
    else {
      try {
        let res = await props.logUser(user);
        !res.success
          ? console.log(res)
          : console.log("¡Bienvenido de nuevo!");
      } catch (e) {
        console.log(e);
      }
    }
  };
  const responseGoogle = async (response) => {
    let user = {
      password: response.profileObj.googleId,
      eMail: response.profileObj.email,
      google: true,
    };
    console.log(user)
    try {
      let res = await props.logUser(user);
      console.log(res);
      if (!res.success) {
          console.log(res)
        // console.log("No tienes una cuenta registrada con Google");
      } else {
        console.log("¡Bienvenido de nuevo!");
      }
    } catch (e) {
      console.log(e);
      // console.log("Tenemos un problema, por favor intenta más tarde");
    }
  };

  return (
    <div className="formSign">
      <NavBar />
      <form>
        <h1>Inicia Sesión</h1>
        <div>
          <input
            type="email"
            name="eMail"
            placeholder="Email"
            onChange={inputNameHandler}
          />
        </div>
        <div>
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            onChange={inputNameHandler}
          />
        </div>
      </form>
      <div className="submit">
        <button onClick={submitUser}>Enviar</button>
      </div>
      <div className="logGoogle">
        <button>Inicia sesion con Facebook</button>
        <GoogleLogin
          clientId="449628523643-i6mlv9530rqnelgmf3gribco7nvsi4vr.apps.googleusercontent.com"
          className="botonSub"
          buttonText="Ingresá con Google"
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
          cookiePolicy={"single_host_origin"}
        />
      </div>
      <div className="submit">
        <p>
          ¿No tienes una cuenta?
          <Link to="/registrarse">
            <span> Registrate</span>
          </Link>
        </p>
      </div>
    </div>
  );
};

const mapDispatchToProps = {
  logUser: userActions.logIn,
};
export default connect(null, mapDispatchToProps)(SignIn);