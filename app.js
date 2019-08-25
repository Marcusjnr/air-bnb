const express = require('express');
const app = express();
const bot = require('./scrape');

bot() // start the bot




let port = process.env.PORT || 9000;

app.listen(port, () => {
	console.log("Listening on port ", port);
});
