const allowedOrigins = [
	'http://localhost:3002', // Test Node
	'http://localhost:4322', // Test Astro ?
	'http://localhost:3001', // Development Node
	'http://localhost:4321', // Development Astro
	'http://localhost:8080', // Production Node local
	'http://localhost:5000', // Production Node docker container
	'http://localhost:80', // Production Node docker container
	'http://localhost', // Production Node docker container
	// 'http://messagingapp.epd7hce8bbb7dsd0.brazilsouth.azurecontainer.io', // Production
	'https://messaging-app.azurewebsites.net', // Production
]

export default allowedOrigins
