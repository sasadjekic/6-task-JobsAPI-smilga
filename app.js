require('dotenv').config();
require('express-async-errors');

//security import
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

//Swagger
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');



const express = require('express');
const app = express();

//connect DB
const connectDB = require('./db/connect')

//Authentication middleware - uvoz iz MD-a
const authenticateUser = require('./middleware/authentication')

//routes import
const authRouter = require('./routes/auth')
const jobsRouter = require('./routes/jobs')



// error handler import 
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json());
//security use
app.set('trust proxy', 1)// za app koja je iza reverse proxy - heroku,... - pre ratelimitera
//Rate limiter za requestove - objekat sa opcijama
app.use(rateLimiter({
  windowMs: 15 * 60 *1000, //15 minuta
  max: 100 //limit each IP to 100 requests per windowsMs
}))
app.use(helmet())
app.use(cors())
app.use(xss())


// extra packages
app.use(express.urlencoded({extended:false}));

app.get('/', (req, res) => {
  res.send('<h1>Jobs API</h1><a href="/api-docs">Documentation</a>');
});
//Za Swagger
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));


//routes - dodajemo MD za autentikaciju u /jobs rute
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser ,jobsRouter);


// routes - Ovo nam je i dummy test kada dizemo na neki server
app.get('/', (req, res) => {
  res.send('jobs api');
});



// routes
app.post('/api/v1', (req, res) => {
  res.json({req: req.body});
});

// error handler Use - hvatamo sve sto se ne hendluje gornjim rutama uspesno
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    //konektujemo bazu pa onda server
    await connectDB(process.env.MONGO_URI)
    console.log("MongoDB database is connected...")
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
