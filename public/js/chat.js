const socket = io();

// Elements
const $messageForm = document.getElementById("message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.getElementById("send-location");
const $messages = document.getElementById("messages");
const $sidebar = document.getElementById("sidebar");

// Templates
const $messageTemplate = document.getElementById("message-template").innerHTML;
const $locationMessageTemplate = document.getElementById("location-message-template").innerHTML;
const $sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

socket.emit("join", { username, room }, (error) => {
	if (error) {
		alert(error);
		location.href = "/";
	}
});

const autoscroll = () => {
	const $newMessage = $messages.lastElementChild;

	const newMessageStyles = getComputedStyle($newMessage)
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHight = $newMessage.offsetHeight + newMessageMargin

	const visibleHeight = $messages.offsetHeight;

	const containerHeight = $messages.scrollHeight;

	const scrollOffset = $messages.scrollTop + visibleHeight;

	if (containerHeight - newMessageHight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight;
	}
}

socket.on("message", (message) => {
	console.log(message);
	const html = Mustache.render($messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format("h:mm a"),
	});
	$messages.insertAdjacentHTML("beforeend", html);
	autoscroll()
});

socket.on("locationMessage", (message) => {
	console.log(message);
	const html = Mustache.render($locationMessageTemplate, {
		username: message.username,
		url: message.url,
		createdAt: moment(message.createdAt).format("h:mm a"),
	});
	$messages.insertAdjacentHTML("beforeend", html);
	autoscroll()
});

socket.on("roomData", ({ room, users }) => {
	console.log(room, users);
	const html = Mustache.render($sidebarTemplate, {
		room,
		users,
	});
	$sidebar.innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
	e.preventDefault();

	$messageFormButton.setAttribute("disabled", "disabled");

	const message = $messageFormInput.value;
	socket.emit("sendMessage", message, (error) => {
		$messageFormButton.removeAttribute("disabled");
		$messageFormInput.value = "";
		$messageFormInput.focus();

		if (error) {
			return console.log(error);
		}

		console.log("Message Delivered!");
	});
});

$sendLocationButton.addEventListener("click", () => {
	$sendLocationButton.setAttribute("disabled", "disabled");

	if (!navigator) {
		return alert("Geolocation not Supported by your Device");
	}

	navigator.geolocation.getCurrentPosition((position) => {
		console.log(position);
		socket.emit(
			"sendLocation",
			{
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
			},
			(message) => {
				$sendLocationButton.removeAttribute("disabled");
				console.log("Location was Shared!");
			}
		);
	});
});
