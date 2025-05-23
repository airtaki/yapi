# YAPI - Yet Another API

**YAPI** is a clean and modular REST API boilerplate built with **Node.js**, **TypeScript**, and **Express**. It serves as a starting point for backend development, providing all the essential components for user management, input validation, error handling, and structured API responses.

This repository is intended to be used as a **template**. Developers can clone or generate a new repository from this template to quickly bootstrap their own API projects without starting from scratch.

## Features

- TypeScript-based development
- Express.js server setup
- MongoDB integration using Mongoose
- Built-in authentication (registration, login, password reset)
- Modular architecture (controllers, services, models)
- Centralized request validation and error handling
- Standardized API responses
- SMTP email support via SendGrid
- Environment-based configuration

> [!IMPORTANT]
> Work in progress, lot of further features will come in the near future.

## Project Structure

```
yapi/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── index.ts
├── config/
│   ├── default.json
│   ├── development.json (create manually)
│   ├── production.json (create manually)
│   └── staging.json (optional)
├── package.json
├── tsconfig.json
└── README.md
```

## Configuration

The application uses configuration files under the `config/` directory. The `default.json` file contains shared defaults, while environment-specific configurations such as `development.json`, `production.json`, and `staging.json` should be created manually as needed.

The API's listening port, database connection string, JWT secrets, and other environment-specific values can be set in these files.

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/airtaki/yapi.git
cd yapi
```

2. Install dependencies:

```bash
npm install
```

3. Create environment-specific configuration files:\
\
Create `config/development.json` (and optionally `production.json` or `staging.json`) based on the values in `default.json`.

4. Run the application in development mode:

```bash
npm run dev
```

The server will be available at `http://localhost:port`, where `port` is defined in the corresponding config file.

## Available Endpoints
- **POST** `/auth/register` – Register a new user
- **POST** `/auth/login` – Authenticate and receive a token
- **POST** `/auth/forgot-password` – Request a password reset email
- **POST** `/auth/reset-password` – Reset password with token
- **GET** `/users/me` – Retrieve the currently authenticated user

## Roadmap

The [TODO.md](./TODO.md) file includes planned features and ideas for future development.

## License

This project is licensed under the MIT License.
