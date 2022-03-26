const app = require("./server");

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Express now departing from port ${port}!`));

var http = require("http");
setInterval(function() {
    http.get("https://maharani-server.herokuapp.com/");
}, 300000); // every 5 minutes (300000
