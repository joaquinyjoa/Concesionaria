class Vehiculo {
    constructor({ tipo, marca, modelo, motor, anio,
        kilometraje, condicion, estado, precio }) {
        this.tipo = tipo;
        this.marca = marca;
        this.modelo = modelo;
        this.motor = motor;
        this.anio = anio;
        this.kilometraje = kilometraje;
        this.condicion = condicion;
        this.estado = estado;
        this.precio = precio;
    }
}

module.exports = Vehiculo;