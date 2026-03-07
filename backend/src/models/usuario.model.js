class Usuario {
    constructor({ email, password, rol }) {
        this.email = email;
        this.password = password;
        this.rol = rol;
    }
}

module.exports = Usuario;