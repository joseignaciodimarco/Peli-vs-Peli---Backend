var con = require('../../services/dbController');

getCompetencias = (req, res) => {
    con.query('SELECT * FROM competencia', (err, result, fields) => {
        if (err) throw err;

        res.send(result);
    });
}

getCompetencia = (req, res) => {
    con.query('SELECT * FROM competencia WHERE id = ? ', [req.params.id], (err, result, fields) => {
        if (result.length === 0) {
            res.status(404).send("Competencia no valida");
        }
    });

    con.query('SELECT * FROM pelicula WHERE genero_id = (SELECT genero_id FROM competencia WHERE id = ?) ORDER BY rand() limit 2;', [req.params.id], (err, result, fields) => {
        let peliculasArray = [];

        for (let i in result) {
            let pelicula = {
                id: result[i].id,
                poster: result[i].poster,
                titulo: result[i].titulo
            }
            peliculasArray.push(pelicula);
        }

        let opciones = {
            peliculas: peliculasArray
        }

        res.send(opciones);
    });

}

votar = (req, res) => {
    //COMPLETAR VERIFICAR EXISTENCIA PELIUCLA ID Y COMPETENCIA ID
    con.query('INSERT INTO voto (pelicula_id, competencia_id) VALUES(?,?)', [req.body.idPelicula, req.params.id], (err, result) => {
        console.log(result);
        res.status(200).send(`Voto cargado para la pelicula ${req.body.idPelicula}`);
    });

}

getResultados = (req, res) => {
    con.query("SELECT p.*, count(*) AS votos FROM pelicula AS p" +
        " INNER JOIN voto AS v" +
        " ON p.id = v.pelicula_id" +
        " INNER JOIN competencia AS c" +
        " ON v.competencia_id = c.id" +
        " WHERE c.id = ?" +
        " GROUP BY p.id" +
        " ORDER BY count(*) DESC" +
        " LIMIT 3;", [req.params.id], (err, result, fields) => {

            let peliculasArray = []

            for (let i in result) {
                let pelicula = {
                    id: result[i].id,
                    poster: result[i].poster,
                    titulo: result[i].titulo,
                    votos: result[i].votos
                }
                peliculasArray.push(pelicula);
            }

            let data = {
                resultados: peliculasArray
            }

            res.send(data);
        });
}

cargaCompetencia = (req, res) => {
    console.log(req.body);
    con.query('SELECT * FROM competencia WHERE nombre = ?', [req.body.nombre], (err, result, fields) => {
        if (result.length !== 0) {
            res.status(422).send("La competencia que desea cargar ya existe");
            return;
        }
    });

    con.query('INSERT INTO competencia (nombre, genero_id, director_id, actor_id) VALUES(?, ?, ?, ?)', [req.body.nombre, req.body.genero, req.body.director, req.body.actor], (err, result) => {
        console.log(result);
        res.status(200).send('Competencia cargada con exito');
        return;
    });
}

reiniciaCompetencia = (req, res) => {
    console.log(req.params);
    con.query('SELECT * FROM competencia WHERE id = ? ', [req.params.id], (err, result, fields) => {
        if (result.length === 0) {
            res.status(404).send("Competencia no valida");
            return;
        }
    });

    con.query('DELETE FROM voto WHERE competencia_id = ?', [req.params.id], (err, result, fields) => {
        if (err) throw err;
        console.log(result);
        res.status(200).send('Competencia reiniciada con exito');
    });
}

getGeneros = (req, res) => {
    con.query('SELECT * FROM genero', (err, result, fields) => {
        let generosArray = [];

        for (let i in result) {
            let genero = {
                id: result[i].id,
                nombre: result[i].nombre
            }
            generosArray.push(genero);
        }

        res.send(generosArray);
    });
}

getDirectores = (req, res) => {
    con.query('SELECT * FROM director', (err, result, fields) => {
        let directoresArray = [];

        for (let i in result) {
            let director = {
                id: result[i].id,
                nombre: result[i].nombre
            }
            directoresArray.push(director);
        }

        res.send(directoresArray);
    });
}

getActores = (req, res) => {
    con.query('SELECT * FROM actor', (err, result, fields) => {
        let actoresArray = [];

        for (let i in result) {
            let actor = {
                id: result[i].id,
                nombre: result[i].nombre
            }
            actoresArray.push(actor);
        }

        res.send(actoresArray);
    });
}

deleteCompetencia = (req, res) => {
    console.log('hola voy a eliminar', req.params.id);
    con.query('DELETE FROM voto WHERE competencia_id = ?', [req.params.id], (err, result, fields) => {
        if (err) throw err;
        con.query('DELETE FROM competencia WHERE id = ?', [req.params.id], (err, result, fields) => {
            if (err) throw err;
            console.log(result);
            res.status(200).send('Competencia eliminada con exito');
        });
    });
}

module.exports = {
    getCompetencias,
    getCompetencia,
    votar,
    getResultados,
    cargaCompetencia,
    reiniciaCompetencia,
    getGeneros,
    getDirectores,
    getActores,
    deleteCompetencia
}