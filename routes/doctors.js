var miRouter = require('express').Router();
var jwt = require('jsonwebtoken');
var config = require('../config');

const waitFor = (ms) => new Promise(r => setTimeout(r, ms));
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

miRouter.get('/', (req, res)=>{
    var token = req.headers['x-auth-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'Se debe suministrar un token' });
  
    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Token incorrecto' });
    });
    req.getConnection((err, conn)=>{
        if(err) return res.send(err);

        conn.query('SELECT * FROM doctors', (err, doctors)=>{
            if(err) return res.send(err);

            const start = async () => {
                await asyncForEach(doctors, async (doctor) => {
                    conn.query('SELECT id_hospital as id FROM doctor_hospital WHERE id_doctor = ?', [doctor.id], (err, hospitalIds)=>{
                        if(err) return res.send(err);
                        doctor.hospitals = JSON.parse(JSON.stringify(hospitalIds));
                    });
                    await waitFor(50);
                });
                res.json(doctors);
            }
            start();
        });
    });
});

miRouter.get('/:id', (req, res)=>{
    var token = req.headers['x-auth-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'Se debe suministrar un token' });
  
    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Token incorrecto' });
    });
    req.getConnection((err, conn)=>{
        if(err) return res.send(err);

        conn.query('SELECT * FROM doctors WHERE id = ?', [req.params.id], (err, doctor)=>{
            if(err) return res.send(err);

            res.json(doctor);
        });
    });
});

miRouter.post('/', (req, res) => {
    var token = req.headers['x-auth-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'Se debe suministrar un token' });
  
    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Token incorrecto' });
    });
    req.getConnection((err, conn)=>{
        if(err) return res.send(err);
        conn.query('INSERT INTO doctors (name, phone, email, specialty) VALUES (?, ?, ?, ?)', [req.body.name, req.body.phone, req.body.email, req.body.specialty], (err, doctors)=>{
            if(err){
                console.log(err);
                return res.send(err);
            }

            conn.query('SELECT * FROM doctors WHERE id = ?', [doctors.insertId], (err, doctorSaved)=>{
                if(err) return res.send(err);
    
                conn.query('DELETE FROM doctor_hospital WHERE id_doctor = ?', [doctorSaved.id], (err, doctor_hospital)=>{
                    if(err){
                        console.log(err);
                        return res.send(err);
                    }
                    
                    const insertRelations = async () => {
                        await asyncForEach(req.body.hospitals, async (hospital) => {
                            conn.query('INSERT INTO doctor_hospital (id_doctor, id_hospital) VALUES (?,?)', [doctorSaved[0].id, hospital.id], (err, doctor_hospital)=>{
                                if(err) return res.send(err);
                            });
                            await waitFor(100);
                        });
                        conn.query('SELECT id_hospital as id FROM doctor_hospital WHERE id_doctor = ?', [doctorSaved[0].id], (err, hospitalIds)=>{
                            if(err) return res.send(err);
                            doctorSaved[0].hospitals = JSON.parse(JSON.stringify(hospitalIds));
                            res.json(doctorSaved[0]);
                        });
                    }
                    insertRelations();
                });
            });
        });
    });
});

miRouter.put('/:id', (req, res)=>{
    var token = req.headers['x-auth-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'Se debe suministrar un token' });
  
    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Token incorrecto' });
    });
    req.getConnection((err, conn)=>{
        if(err) return res.send(err);
        conn.query('UPDATE doctors SET name = ?, phone = ?, email = ?, specialty = ? WHERE id = ?', [req.body.name, req.body.phone, req.body.email, req.body.specialty, req.params.id], (err, doctorUpdated)=>{
            if(err) return res.send(err);

            conn.query('SELECT * FROM doctors WHERE id = ?', [req.params.id], (err, doctor)=>{
                if(err) return res.send(err);
                
                conn.query('DELETE FROM doctor_hospital WHERE id_doctor = ?', [req.params.id], (err, doctor_hospital)=>{
                    if(err){
                        console.log(err);
                        return res.send(err);
                    }

                    const insertRelations = async () => {
                        await asyncForEach(req.body.hospitals, async (hospital) => {
                            conn.query('INSERT INTO doctor_hospital (id_doctor, id_hospital) VALUES (?,?)', [req.params.id, hospital.id], (err, doctor_hospital)=>{
                                if(err) return res.send(err);
                            });
                            await waitFor(100);
                        });
                        conn.query('SELECT id_hospital as id FROM doctor_hospital WHERE id_doctor = ?', [doctor[0].id], (err, hospitalIds)=>{
                            if(err) return res.send(err);
                            doctor[0].hospitals = JSON.parse(JSON.stringify(hospitalIds));
                            res.json(doctor[0]);
                        });
                    }
                    insertRelations();
                });
            });
        });
    });
});

miRouter.delete('/:id', (req, res)=>{
    var token = req.headers['x-auth-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'Se debe suministrar un token' });
  
    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Token incorrecto' });
    });
    req.getConnection((err, conn)=>{
        if(err) return res.send(err);
        conn.query('DELETE FROM doctor_hospital WHERE id_doctor = ?', [req.params.id], (err, doctor_hospital)=>{
            if(err) return res.send(err);
            conn.query('DELETE FROM doctors WHERE id = ?', [req.params.id], (err, doctors)=>{
                if(err) return res.send(err);
    
                res.send('El hospital fue eliminado con éxito!');
            });
        });
    });
});

module.exports = miRouter;