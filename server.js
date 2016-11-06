const http = require("http");
const fs = require("fs");

const todos = [{text:"element.text","id":0,"done":"checked"}];
const helper = {"last_id":1};

var server = http.createServer(function(req, res){
  if (req.url==="/"){
    fs.readFile("./public/index.html", function(err, data){
      res.statusCode = 200;
      res.end(data);
    });
  } else {
    fs.readFile("./public"+req.url, function(err, data){
      res.statusCode = 200;
      res.end(data);
    });
  }
}).listen(3001);

var io = require('socket.io')(server);


io.on('connection', function(socket){
  
  socket.on('list_init_data', function (data) {
  	console.log("Sending");
    socket.emit('list_from_server', { list: todos });
  });
  socket.on('add_to_list',function(data){
  	todos.push({"text":data.text,"id":helper.last_id++,"done":false});
  	io.emit('list_from_server', { list: todos });
  });
  socket.on('remove_from_list',function(id){
  	todos[id].text="";
  	io.emit('list_from_server', { list: todos });
  });
  socket.on('change_done_from_list',function(id){
  	if(todos[id].done==""){
  		todos[id].done="checked";
  	} else {
  		todos[id].done="";
  	}
  	socket.broadcast.emit('list_from_server', { list: todos });
  });
  socket.on('search_from_list',function(data){
  	const tmp_todos = [];
  	data.text=data.text.toLowerCase();
  	todos.forEach(function(element){
  		if(element.text.toLowerCase().search(data.text)!=-1){
  			tmp_todos.push(element);
  		}
  	});
  	console.log(tmp_todos);
  	io.emit('list_from_search', { "list": tmp_todos });
  });

});