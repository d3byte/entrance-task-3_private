const path = require('path');

const models = require('./models')

const express = require('express');
const bodyParser = require('body-parser');

const pagesRoutes = require('./pages/routes');
const graphqlRoutes = require('./graphql/routes');

const cors = require('cors');

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use('/', pagesRoutes);
app.use('/graphql', graphqlRoutes);
app.use(express.static(path.join(__dirname, 'public')));

app.listen(4000, () => console.log('Express app listening on localhost:4000'));
