const Vehiculo = require("../models/vehiculo.model");

exports.create = async (data) => {
    return await Vehiculo.create(data);
}