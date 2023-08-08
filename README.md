# E-Commerce Website Readme

![Screenshot (512)](https://github.com/RiteshLade28/E-Commerce-Site/assets/108731783/add958f3-68eb-424e-a599-e49273c49532)


## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Getting Started](#getting-started)
5. [Database Setup](#database-setup)
6. [Configuration](#configuration)
7. [Running the Application](#running-the-application)
8. [Deployment](#deployment)
9. [Contributing](#contributing)
10. [License](#license)

## Introduction
Welcome to the E-Commerce Website Readme! This is a web application created using React on the frontend and Flask on the backend. It provides a full-fledged e-commerce platform with features like shopping cart, product listing, purchasing, payment integration, user profiles, order tracking, product reviews, and more. Additionally, it incorporates secure authorization and authentication for users. Sellers have access to a dedicated dashboard to manage their products and orders.

## Features
- User Authentication and Authorization
- User Profile Management
- Product Catalog and Search
- Shopping Cart Functionality
- Order History
- Product Reviews and Ratings
- Seller Dashboard with Product Management

## Technologies Used
- Frontend: React.js
- Backend: Flask (Python)
- Database: Initially SQLite (for development), later shifted to PostgreSQL (for production)
- Payment Integration: [Payment Gateway API]
- Authentication: JWT Authentication
- State Management: React Context
- Styling: CSS

## Getting Started
To set up the project locally, follow the steps below:

1. Clone the repository from GitHub.
2. Ensure you have Node.js and Python installed on your system.
3. Install project dependencies using npm (for frontend) and pip (for backend).
4. Set up the configuration (environment variables, API keys, etc.).

## Database Setup
Initially, the project uses SQLite for local development. However, for the production environment, it has been shifted to PostgreSQL for better performance and scalability. To set up the PostgreSQL database, follow these steps:

1. Install PostgreSQL on your server.
2. Create a new PostgreSQL database for the project.
3. Update the database connection settings in the backend configuration (e.g., `.env` or `config.py`) to point to your PostgreSQL database.

## Configuration
Before running the application, you need to configure certain environment variables. Create a `.env` file in the backend directory and set the following variables:

```
# .env (backend directory)

# Database Config (For local development with PostgreSQL)
DB_HOST
DB_NAME
DB_USER
DB_PASSWORD

# JWT Secret Key
JWT_SECRET=secret
```
```
# .env (frontend directory)

# Database Config (For local development with PostgreSQL)
REACT_APP_API_URL



## Running the Application
Once you have completed the configuration, you can run the application using the following steps:

1. Navigate to the backend directory and start the Flask server using the command: `flask run --reload`.
2. Open a new terminal, navigate to the frontend directory go to the client folder, and start the React development server with: `npm start`.
3. The application should now be accessible at `http://localhost:3000/`.

## Deployment
For production deployment, it is recommended to use a web server like Nginx or Apache to serve the frontend, and Gunicorn or uWSGI to serve the Flask backend. Additionally, set up a production-ready PostgreSQL database.

## Contributing
We welcome contributions to improve this project! If you find any bugs or have new feature suggestions, please open an issue or submit a pull request.

