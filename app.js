let mongodb=require('mongodb');
let express=require('express');
let db=require('./src/imdb');
//let api=require('./api');
const MongoClient = require("mongodb").MongoClient;
const DENZEL_IMDB_ID = 'nm0000243';

let connection="mongodb+srv://kariwar:abc@cluster0-si9od.mongodb.net/test?retryWrites=true";

const app = express();
const PORT = 9292;

app.listen(PORT, () => {
	MongoClient.connect(connection, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db('denzel');
        collection = database.collection("movies");
        console.log("Connected to `" + 'denzel' + "`!");
		console.log(`server running on port ${PORT}`)
	});
});
app.get('/movies/populate', async(req, res) => {
	const movies=await db(DENZEL_IMDB_ID);
	collection.insert(movies);
  res.send({
    success: 'true',
    message: 'movies retrieved successfully',
    todos: movies
  })
});

app.get('/movies', async(req, res) => {
	collection.find({metascore: {$gte: 70}}).toArray((err, result) => {
		if(err) throw err;
		random=Math.floor(Math.random()*result.length);
		res.send({
			success: 'true',
			message: 'movies retrieved successfully',
			todos: result[random]
		});
	});
});
app.get("/movies/search", (request, response) => {
    var limit = (request.query.limit === undefined ? 5 : parseInt(request.query.limit));
    var metascore = (request.query.metascore === undefined ? 0 : parseInt(request.query.metascore));

    collection.find({"metascore": {$gte: metascore}}).limit(limit).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});

app.get("/movies/:id", (request, response) => {
    collection.findOne({ "id": request.params.id }, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});

app.post("/movies/:id", (request, response) => {
    if(request.body.review === undefined || request.body.date === undefined) {
        return response.status(400).send("You have to specify review and date");
    }
    collection.update({"id": request.params.id}, {$set: {"date": request.body.date, "review": request.body.review}}, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
    });
    collection.findOne({"id": request.params.id}, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        result = {
          "_id": result._id
        };
        response.send(result);
    });
});


