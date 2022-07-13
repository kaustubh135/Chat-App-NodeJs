const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");

require("dotenv").config({ path: path.join(__dirname, "../config/config.env") });

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirPath = path.join(__dirname, "../public");

app.use(express.static(publicDirPath));

io.on("connection", (socket) => {
	console.log("New Websocket Connection");

	socket.on("join", (options, callback) => {
		const { error, user } = addUser({ id: socket.id, ...options });

		if (error) {
			return callback(error);
		}

		socket.join(user.room);

		socket.emit("message", generateMessage("Admin", "Welcome!"));
		socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has Joined!`));

		io.to(user.room).emit("roomData", {
			room: user.room,
			users: getUsersInRoom(user.room),
		});

		callback();
	});

	socket.on("sendMessage", (message, callback) => {
		const user = getUser(socket.id);
		const filter = new Filter();

		if (filter.isProfane(message)) {
			return callback("Profanity is not allowed!");
		}

		io.to(user.room).emit("message", generateMessage(user.username, message));
		callback();
	});

	socket.on("sendLocation", (coords, callback) => {
		const user = getUser(socket.id);
		io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
		callback();
	});

	socket.on("disconnect", () => {
		const { error, user } = removeUser(socket.id);
		if (user) {
			io.to(user.room).emit("message", generateMessage("Admin", `${user.username} has left the room!`));
			io.to(user.room).emit("roomData", {
				room: user.room,
				users: getUsersInRoom(user.room),
			});
		}
	});
});

server.listen(process.env.PORT, () => {
	console.log("Server is up on port " + process.env.PORT);
});
