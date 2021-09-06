const User = require('../models/User')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const handleError = (res,err) =>{
    console.log(err.message)
    res.json({success: false, response: err.message})
}
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
    type: 'OAuth2',
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
    clientId: process.env.OAUTH_CLIENTID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN
    }
})

const userControllers = {
    registerUser: (req, res) =>{
        console.log("Received Register User Petition:" + Date())
        const {firstName, lastName, password, eMail, photoURL, google, facebook} = req.body
        let hashedPass = bcryptjs.hashSync(password)
        const newUser = new User({
            firstName,
            lastName,
            password : hashedPass,
            eMail,
            photoURL,
            google,
            facebook,
        })
        newUser.save()
        .then(user => {
            const token = jwt.sign({...newUser}, process.env.SECRETORKEY)
            res.json({success: true, response: user, token: token}) // desde front, tomar token y pegarle al validar mail
        })
        .catch(err => {
            res.json({success: false, response: err.message.includes('duplicate key') ? 'eMail already in use' : err.message})
        })
    },
    logUser: (req, res)=>{
        console.log("Received SIGN IN USER Petition:" + Date())
        const errMessage = "Invalid username or pass"
        const {eMail, password, google, facebook} = req.body
        User.exists({eMail: eMail}).then(exists => {
            if(exists){
                User.findOne({eMail: eMail})
                .then(userFound => {
                    if((userFound.google === true && google === false) || (userFound.facebook === true && facebook === false)){
                        throw new Error(`Log in with ${userFound.google ? 'Google' : 'Facebook'}!`)
                    }
                    if(!userFound.validated){
                        throw new Error(`Please validate your account, check your email`) // que en front end al recibir este error, de opcion de enviar mail de nuevo.
                    }
                    if(userFound.banned){
                        throw new Error('This user has a ban on him')
                    }
                    if(!bcryptjs.compareSync(password, userFound.password))throw new Error(errMessage)
                    const token = jwt.sign({...userFound}, process.env.SECRETORKEY) 
                    res.json({success: true, response: userFound, token})
                })
                .catch(err => handleError(res, err))
            }else{
                throw new Error(errMessage)
            } 
        })
        .catch(err => handleError(res, err))   
    },
    sendValidationMail: (req, res)=>{
        console.log("Received Send Validation Mail Petition:" + Date())
        let message = `
            <h1>Hello ${req.user.firstName} ${req.user.lastName}</h1>
            <p>Please to confirm your account continue to this link:</p>
            <break></break>
            <a href="http://localhost:4000/api/user/validatemail/${req.user._id}">CLICK HERE!</a>
        `//reemplazar esta URL por una de frontend, que vaya en params un ID, que en front monte componente y useEffect did mount, haga pedido a esa ruta de api con el req params id
        let mailOptions = {
            from: "Mar Del Casas <mardelcasas@gmail.com>",
            to: `${req.user.firstName} <${req.user.eMail}>`,
            subject: `Welcome ${req.user.firstName}!`,
            text: message,
            html: message
        }
        transporter.sendMail(mailOptions, (err, data) => {
            err ? res.json({success: false, response: err}) : res.json({success: true, response: data})
        })
    },
    validateUser: (req, res)=>{
        console.log("Received Validate User Email Petition:" + Date())
        User.findOneAndUpdate({_id: req.params.id}, {validated: true})
        .then(user => user ? res.json({success: true}) : res.json({success: false, response: "Didn't find that user"}))
        .catch(err => handleError(res, err))
    },
    sendResetPasswordMail: (req, res) =>{
        console.log("Received Send Reset Password Mail Petition:" + Date())
        const {eMail} = req.body
        User.findOne({eMail: eMail})
        .then(user => {
            if(user){
                if(!user.validated){
                    throw new Error("Have to validate that user first")
                }
                let message = `
                    <h1>Hello ${user.firstName} ${user.lastName}</h1>
                    <p>Please to change your password continue to this link:</p>
                    <break></break>
                    <a href="http://localhost:4000/api/user/resetpassword/${user._id}">CLICK HERE!</a>
                `//mandarlo a frontend a una pagina con 2 input para la contraseña y que cuando el tipo toque enviar le pegues a ese endpoint, con ese params id y el paquete en el body
                let mailOptions = {
                    from: "Mar Del Casas <mardelcasas@gmail.com>",
                    to: `${user.firstName} <${user.eMail}>`,
                    subject: `Reset Password ${user.firstName}!`,
                    text: message,
                    html: message
                }
                transporter.sendMail(mailOptions, (err, data) => {
                    err ? res.json({success: false, response: err}) : res.json({success: true, response: data})
                })
            }else{
                throw new Error("Didn't find that user")
            }
        })
        .catch( err => handleError(res, err))
    },
    resetUserPassword: (req, res)=>{ // desde el punto de vista de la inseguridad... es medio inseguro esto, ver como hacer.
        console.log("Received Reset Password Petition:" + Date())
        const {password} = req.body
        let hashedPass = bcryptjs.hashSync(password)
        User.findOneAndUpdate({_id: req.params.id}, {password: hashedPass})
        .then(user => {
            if(user){
                let message = `
                    <h1>Hello ${user.firstName} ${user.lastName}</h1>
                    <p>We would like to inform you, your password has been successfully reset!</p>
                    <p>If you didn't change your password, and you want to disable your account please continue and click the following link</p>
                    <break></break>
                    <a href="http://localhost:4000/api/user/compromised/${user._id}">I didn't reset my password, help!</a>
                `//mandarlo a frontend a una pagina de datos de contacto con una confirmación si quiere desabilitar su cuenta!
                let mailOptions = {
                    from: "Mar Del Casas <mardelcasas@gmail.com>",
                    to: `${user.firstName} <${user.eMail}>`,
                    subject: `Your password has changed ${user.firstName}!`,
                    text: message,
                    html: message
                }
                transporter.sendMail(mailOptions, (err, data) => {
                    err ? res.json({success: true, response: 'password changed successfully but eMail failed to be sent'}) : res.json({success: true, response: 'password changed successfully & eMail sent'})
                })
            }else{
                throw new Error('User not found')
            }
        })
        .catch((err) => handleError(res, err))
    }, // mandarle mail al usuario que hubo cambios en su cuenta, opcion de bannear cuenta. redirigir a un componente con datos de contacto.
    disableUser: (req, res)=>{
        console.log("Received Disable User because Compromised Petition:" + Date())
        User.findOneAndUpdate({_id: req.params.id}, {banned: true})
        .then(user => user ? res.json({success: true, response: 'user banned successfully'}) : res.json({success: false, response: 'user not found'}))
        .catch(err => handleError(res, err))
    },
    manageUser: (req, res)=>{ // posible future feature, send mail for BANNED users only, consider appealing at help component
        console.log("Received Manage User Petition:" + Date())
        if(req.user.admin){
            let whatToDo = req.body.actionToDo === 'ban'
            User.findOneAndUpdate({_id: req.body._id}, {banned: whatToDo})
            .then(user => user ? res.json({success: true, response: `User ${whatToDo ? 'banned' : 'unbanned'} successfully`}) : res.json({success: false, response: 'user not found'}))
            .catch(err => handleError(res, err))
        }else{
            res.json({success: false, response: "You don't have permissions to do this"})
        }
    },
    manageDreamHouseOfUser: (req, res)=>{
        console.log("Received Manage Filter AND Email List Petition:" + Date())
        let whatToDo = req.body.actionToDo === 'add'
        User.findOneAndUpdate({_id: req.user._id}, {dreamProperty: whatToDo ? req.body.filter : {}, suscribedToNewsLetter: whatToDo && true})
        .then(user => user ? res.json({success: true, response: `dream property ${whatToDo ? 'added to' : 'removed from'} user`}) : res.json({success: false, response: 'user not found'}))
        .catch(err => handleError(res, err))
    }
}

module.exports = userControllers
