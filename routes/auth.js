var miRouter = require('express').Router();
var jwt = require('jsonwebtoken');
var config = require('../config');
var md5 = require('md5');

miRouter.post('/login', (req, res) => {
    req.getConnection((err, conn)=>{
        if(err) return res.send(err);
        conn.query('SELECT * FROM users WHERE email = ? AND password = ?', [req.body.email, md5(req.body.password)], (err, user)=>{
            if(err) return res.send(err);
            if(user.length==0){
                res.status(200).send({error: 'Invalid Credentials'});
            }else{
                var token = jwt.sign({ id: user._id }, config.secret, {
                    expiresIn: 86400 // expires in 24 hours
                });
                res.json({user: user[0], token: token});
            }
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

        conn.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, user)=>{
            if(err) return res.send(err);
            res.json(user);
        });
    });
});

module.exports = miRouter;