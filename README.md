# Storehouse: A Comprehensive Order and Container Management System

Storehouse is a robust backend application designed to manage orders, containers, and user accounts efficiently. It provides a RESTful API for handling various operations related to order processing, container tracking, and user authentication.

This system is built using Node.js and Express.js, with MongoDB for user account management and PostgreSQL for order and container data storage. It implements JWT-based authentication, input validation, and error handling to ensure secure and reliable operations.

## Repository Structure

```
.
├── config
│   └── default.json         # Default configuration settings
├── package.json             # Project metadata and dependencies
├── src
│   ├── config
│   │   └── service.js       # Service configuration and initialization
│   ├── databases
│   │   ├── mongo
│   │   │   └── MongoConnection.js
│   │   └── postgres
│   │       └── PostgresConnection.js
│   ├── errors
│   │   └── errors.js        # Error handling utilities
│   ├── middlewares
│   │   ├── authenticateMiddleware.js
│   │   ├── corsMiddleware.js
│   │   └── validationMiddleware.js
│   ├── routes
│   │   ├── accounts.js
│   │   ├── containerRoutes.js
│   │   ├── errorsRoutes.js
│   │   └── ordersRoutes.js
│   ├── server.js            # Main application entry point
│   ├── services
│   │   ├── AccountsService.js
│   │   ├── ContainerDataService.js
│   │   ├── GetErrorsService.js
│   │   └── OrdersService.js
│   └── utils
│       ├── dateUtils.js
│       ├── queries.js       # SQL query definitions
│       └── schemas.js       # Input validation schemas
└── test
    ├── container-data.test.js
    ├── errors.test.js
    └── orders.test.js
```

## Usage Instructions

### Installation

1. Ensure you have Node.js (version 12 or higher) and npm installed on your system.
2. Clone the repository:
   ```
   git clone https://github.com/derzkijsklad/storehouse
   cd storehouse
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Set up environment variables:
   Create a `.env` file in the root directory and add the following variables:
   ```
   MONGO_URI=<your-mongodb-connection-string>
   POSTGRES_URI=<your-postgresql-connection-string>
   JWT_SECRET=<your-jwt-secret>
   OWNER_USERNAME=<admin-username>
   OWNER_PASSWORD=<admin-password>
   ```

### Running the Application

To start the server in development mode:

```
npm run dev
```

For production:

```
npm start
```

### Testing

Run the test suite:

```
npm test
```

## Data Flow

The Storehouse application follows a typical request-response cycle:

1. Client sends a request to the server.
2. The request passes through CORS and authentication middleware.
3. If authentication is required, the JWT token is verified.
4. The request is routed to the appropriate handler based on the URL and HTTP method.
5. Input validation is performed using Joi schemas.
6. The corresponding service method is called to interact with the database.
7. The response is sent back to the client.

```
Client -> CORS Middleware -> Authentication Middleware -> Route Handler -> 
Input Validation -> Service Layer -> Database -> Service Layer -> 
Route Handler -> Response
```

## API Endpoints

### Accounts

- `POST /login`: Authenticate a user
- `PUT /password`: Update user password
- `PATCH /email`: Change user email
- `POST /manageUser`: Add a new user (admin only)
- `PUT /manageUser`: Update an existing user (admin only)
- `DELETE /manageUser`: Delete a user (admin only)

### Orders

- `GET /orders`: Retrieve orders (supports filtering)
- `POST /orders`: Create a new order
- `PUT /orders`: Close an existing order

### Containers

- `GET /containers`: Retrieve all containers
- `GET /containers?id=<container_id>`: Retrieve a specific container

### Errors

- `GET /errors`: Retrieve all error logs

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Problem: Unable to connect to MongoDB or PostgreSQL
   - Solution: 
     - Verify that the connection strings in your `.env` file are correct.
     - Ensure that the database servers are running and accessible.
     - Check firewall settings to allow connections on the database ports.

2. **Authentication Failures**
   - Problem: Receiving 401 Unauthorized errors
   - Solution:
     - Verify that you're sending the correct JWT token in the Authorization header.
     - Check that the `JWT_SECRET` in your `.env` file matches the one used to generate the tokens.
     - Ensure that the token hasn't expired (default expiration is 1 hour).
