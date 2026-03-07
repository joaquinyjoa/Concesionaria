const vehiculoService = require("../services/vehiculo.service");

exports.getVehiculos = async (req, res) => {
    try {
        const vehiculos = await vehiculoService.getAll();
        res.status(200).json(vehiculos);
    } catch (error) {
        console.error('Error al obtener vehículos:', error);
        res.status(500).json({ error: 'Error al obtener vehículos' });
    }
}

exports.getVehiculoById = async (req, res) => {
    try {
        const vehiculo = await vehiculoService.getById(req.params.id);
        res.status(200).json(vehiculo);
    } catch (error) {
        if (error.message === 'Vehículo no encontrado') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al obtener el vehículo' });
    }
}

exports.createVehiculo = async (req, res) => {
    try{
        const id = await vehiculoService.create(req.body);
        res.status(201).json({ id });
    }catch(error){
        console.error('Error al crear el vehículo:', error);
        res.status(500).json({ error: 'Error al crear el vehículo' });
    }
}

exports.updateVehiculo = async (req, res) => {
    try {
        const vehiculo = await vehiculoService.update(req.params.id, req.body);
        res.status(200).json(vehiculo);
    } catch (error) {
        if (error.message === 'Vehículo no encontrado') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al actualizar el vehículo' });
    }
}

exports.deleteVehiculo = async (req, res) => {
    try {
        await vehiculoService.delete(req.params.id);
        res.status(200).json({ message: 'Vehículo eliminado correctamente' });
    } catch (error) {
        if (error.message === 'Vehículo no encontrado') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al eliminar el vehículo' });
    }
}