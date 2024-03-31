const express = require('express');
const app = express();
const cors = require('cors');
const router = express.Router();
const { checkJava, checkStorage } = require('./util/util');
require('dotenv').config();
const port = process.env.PORT || 443;

// app.use(cors({
//     origin: [
//       "http://localhost:8080",
//       "http://127.0.0.1",
//     ],
//     credentials: true
//   }
// ));
  
//Utility checks
if (!checkJava() || !checkStorage()) {
  process.exit(1);
}

app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.on('uncaughtException', function (req, res, route, err) {
    log.info('******* Begin Error *******\n%s\n*******\n%s\n******* End Error *******', route, err.stack);
    if (!res.headersSent) {
        return res.send(500, { ok: false });
    }
    res.write('\n');
    res.end();
});

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.get('/api/ping', function (req, res) {
  res.status(200).send();
});



app.use('/api/trace', require('./API/traceAPI'));
app.use('/api/optimizer', require('./API/optimizerAPI'));
app.use('/api/auth', require('./API/userAPI'));
app.use('/api/simulator',require('./API/simulatorAPI'));

app.listen(port, function () {
    console.log(`Listening on port ${port}!`);
});
