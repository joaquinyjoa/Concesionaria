const vehiculoService = require("../services/vehiculo.service");

exports.createVehiculo = async (req, res) => {
    try{
        const id = await vehiculoService.create(req.body);
        res.status(201).json({ id });
    }catch(error){
        console.error('Error al crear el vehículo:', error);
        res.status(500).json({ error: 'Error al crear el vehículo' });
    }
    
}
