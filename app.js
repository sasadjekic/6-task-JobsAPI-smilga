require('dotenv').config();
require('express-async-errors');
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
// extra packages
app.use(express.urlencoded({extended:false}));

//routes - dodajemo MD za autentikaciju u /jobs rute
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser ,jobsRouter);


// routes
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
