var miRouter = require('express').Router();
var jwt = require('jsonwebtoken');
var config = require('../config');

miRouter.get('/', (req, res)=>{
    var token = req.headers['x-auth-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'Se debe suministrar un token' });
  
    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Token incorrecto' });
    });

    req.getConnection((err, conn)=>{
        if(err) return res.send(err);

        conn.query('SELECT * FROM hospitals', (err, hospitals)=>{

            if(err) return res.send(err);

            res.json(hospitals);
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

        conn.query('SELECT * FROM hospitals WHERE id = ?', [req.params.id], (err, hospital)=>{
            if(err) return res.send(err);

            res.json(hospital);
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
        conn.query('INSERT INTO hospitals (name, address) VALUES (?, ?)', [req.body.name, req.body.address], (err, hospitals)=>{
            if(err) return res.send(err);

            conn.query('SELECT * FROM hospitals WHERE id = ?', [hospitals.insertId], (err, hospital)=>{
                if(err) return res.send(err);
    
                res.json(hospital);
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
        conn.query('UPDATE hospitals SET name = ?, address = ? WHERE id = ?', [req.body.name, req.body.address, req.params.id], (err, hospitals)=>{
            if(err) return res.send(err);

            conn.query('SELECT * FROM hospitals WHERE id = ?', [req.params.id], (err, hospital)=>{
                if(err) return res.send(err);
                res.json(hospital);
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
        conn.query('DELETE FROM doctor_hospital WHERE id_hospital = ?', [req.params.id], (err, doctor_hospital)=>{
            if(err) return res.send(err);
            conn.query('DELETE FROM hospitals WHERE id = ?', [req.params.id], (err, hospitals)=>{
                if(err) return res.send(err);

                res.send('El hospital fue eliminado con éxito!');
            });
        });
    });
});

module.exports = miRouter;