# Restaurant Reservation System Backend

This is the backend for a comprehensive restaurant reservation management system built with Node.js, Express, and SQLite. It provides a full suite of features for both customers and staff, including user authentication, reservation booking with email confirmations, table availability management, and a staff dashboard.

## Features

*   **User Authentication:** Secure user registration and login with JWT-based authentication.
*   **Role-Based Access:** Differentiates between `customer` and `staff` roles, with protected routes for staff members.
*   **Table Management:** Manages restaurant table inventory, including different table sizes and bar seating.
*   **Dynamic Availability:** Calculates and shows available reservation slots based on real-time table availability and party size.
*   **Reservation Booking:** Allows authenticated users to book reservations, automatically assigning an appropriate table.
*   **Email Confirmations:** Sends automated confirmation emails to users upon successful booking using customizable templates.
*   **Email Previews:** Uses Ethereal to generate email previews during development for easy testing without a real SMTP server.
*   **Staff Dashboard:** Provides endpoints for staff to view all reservations for a given day and generate reports.
*   **Reservation History:** Allows customers to view their past and upcoming reservations.

## Tech Stack

*   **Backend:** Node.js, Express.js
*   **Database:** SQLite
*   **Authentication:** JSON Web Tokens (JWT), bcrypt
*   **Email:** Nodemailer, Ethereal

## Getting Started

Follow these instructions to get the backend server up and running on your local machine.

### Prerequisites

*   [Node.js](https://nodejs.org/en/) (v14 or later recommended)
*   [npm](https://www.npmjs.com/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/dukegcha/project2.git
    cd project2/backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the server:**
    ```bash
    node server.js
    ```

The server will start on `http://localhost:3000`. The first time it runs, it will create a `restaurant.db` file in the `backend` directory and populate it with initial data for tables and email templates.

## API Endpoints

Here is a list of the available API endpoints. For protected routes, include a valid JWT in the request header:
`Authorization: Bearer <your_jwt_token>`

### Authentication

*   **`POST /register`**: Register a new user.
    *   **Body:** `{ "name": "John Doe", "email": "john.doe@example.com", "password": "password123", "phone": "1234567890" }`

*   **`POST /login`**: Log in an existing user.
    *   **Body:** `{ "email": "john.doe@example.com", "password": "password123" }`
    *   **Returns:** A JWT token.

### Availability

*   **`GET /availability`**: Get available reservation slots.
    *   **Query Params:** `date` (YYYY-MM-DD), `party_size` (number)
    *   **Example:** `curl "http://localhost:3000/availability?date=2025-12-24&party_size=4"`

### Reservations (Protected)

*   **`POST /reservations`**: Create a new reservation.
    *   **Body:** `{ "party_size": 4, "reservation_time": "2025-12-24T19:00:00", "special_occasion": "Birthday" }`

*   **`GET /reservations/history`**: Get the reservation history for the logged-in user.

### Staff Dashboard (Protected, Staff Only)

*   **`GET /dashboard/reservations`**: Get all reservations for a specific day.
    *   **Query Params:** `date` (YYYY-MM-DD)
    *   **Example:** `curl -H "Authorization: Bearer <token>" "http://localhost:3000/dashboard/reservations?date=2025-12-24"`

*   **`GET /dashboard/report`**: Generate a report of reservation stats for a date range.
    *   **Query Params:** `start_date` (YYYY-MM-DD), `end_date` (YYYY-MM-DD)
    *   **Example:** `curl -H "Authorization: Bearer <token>" "http://localhost:3000/dashboard/report?start_date=2025-12-01&end_date=2025-12-31"`
