const express = require('express')
const app = express()

// Require minimist module
const args = require('minimist')(process.argv.slice(2))
// See what is stored in the object produced by minimist
console.log(args)
// Store help text 
const help = (`
server.js [options]

--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.

--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.

--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.

--help	Return this message and exit.
`)
// If --help or -h, echo help text to STDOUT and exit
if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}

//log - endpoint
if (args.log == true) {
    const log = fs.createWriteStream('access.log', {flags: 'a'})
    app.use(morgan('combined', {stream: accessLog}))
}

//Middleware
app.use((req, res, next) => {
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        status: res.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']
    }

    const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    const info = stmt.run(String(logdata.remoteaddr), String(logdata.remoteuser), String(logdata.time), String(logdata.method, logdata.url), String(logdata.protocol), String(logdata.httpversion), String(logdata.status), String(logdata.referer), String(logdata.useragent))
    res.status(200).json(info);
    next();
})

//start of mine


args['port']

var port = args.port || process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`App is running on port %PORT%`.replace(`%PORT%`, port))
});


function coinFlip() {
  var x = Math.round(Math.random());
  if (x < 1) {return "heads";} else {return "tails";}
}


function coinFlips(flips) {
  const flipArray = []
  for(let i = 0; i<flips; i++){
    flipArray[i] = coinFlip()
  }
  return flipArray
}


function countFlips(array) {
  var h = 0;
  var t = 0;
  for(let i = 0; i<array.length; i++){
    if(array[i]==='heads'){
      h++;
    }
    else{
      t++;
    }
  }
  return {heads: h, tails: t};
}


function flipACoin(call) {
  let flipCall = {call: call, flip: coinFlip(), result: ''};
  if(flipCall.call === flipCall.flip){
    flipCall.result = 'win';
  } 
  else{
    flipCall.result = 'lose';
  }
  return flipCall;
}

//end of coin stuff

//start of endpoints



app.get('/app', (req, res)=>{
  res.status(200).end('OK')
  res.type('text/plain')
})

app.get('/app/flip', (req, res) => {
  res.status(200).json({ 'flip': coinFlip() })
})

app.get('/app/flips/:number([0-9]{1,3})', (req, res) => {
  const flips = coinFlips(req.params.number);
	const numFlips = countFlips(flips);
  res.status(200).json({'raw': flips, 'summary': numFlips})
});//one line

app.get('/app/flip/call/heads', (req, res) => {
  res.status(200).json({ 'message': flipACoin('heads')})
})

app.get('/app/flip/call/tails', (req, res) => {
  res.status(200).json({ 'message': flipACoin('tails')})
})

//added endpoint:
if (args.debug) {
    app.get('/app/log/access', (req, res) =>{
      try{
        const stmt = db.prepare('Select * FROM accesslog').all();
        res.status(200).json(stmt);
      }
      catch {
        console.error("oops - log/access")
      }
    });
    app.get("/app/error", (req, res) => {
        throw new Error("Error Test Successful");
    })
}

app.use(function(req, res) {
  res.status(404).end("Endpoint does not exist")
  res.type("text/plain")
})

