const users = [];

const addUser = ({ id, username, room }) => {
	username = username.trim().toLowerCase();
	room = room.trim().toLowerCase();

	if (!username || !room) {
		return {
			error: "Username and room are Required!",
		};
	}

	const existingUser = users.find((user) => {
		return user.room === room && user.username === username;
	});

	if (existingUser) {
		return {
			error: "Username Already Taken in this Room!",
		};
	}
	const user = { id, username, room };
	users.push(user);
	return { user };
};

const removeUser = (id) => {
	const index = users.findIndex((user) => user.id === id);

	if (index !== -1) {
		return {user: users.splice(index, 1)[0]};
	}
	return {
		error: "No User found for given Id!",
	};
};

const getUser = (id) => {
	return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
	room = room.trim().toLowerCase();
	return users.filter((user) => user.room === room);
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}