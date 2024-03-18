# Contact Management System

This is a simple Contact Management System implemented in Go (backend) and HTML/CSS/JavaScript (frontend).

## Overview

The Contact Management System allows users to perform basic CRUD operations on contacts. Users can view, add, edit, and remove contacts through a user-friendly interface.

## Features

- View a list of contacts
- Add a new contact
- Edit an existing contact
- Remove a contact

## Technologies Used

### Backend

- Go (Golang)
- MySQL database
- Third-party packages:
  - `github.com/go-sql-driver/mysql` - MySQL driver for Go

### Frontend

- HTML
- CSS
- JavaScript
- jQuery

## Setup

1. Install Go and set up a MySQL database.
2. Clone this repository.
3. Run `go mod tidy` to install required dependencies.
4. Set up the MySQL database by executing the provided SQL script.
5. Update the database connection string in the main Go file (`main.go`) with your database credentials.
6. Run the Go server: `go run main.go`.
7. Open `loccalhost:8080` in a web browser to use the Contact Management System.

## File Structure

- `main.go`: Main Go file containing the backend code.
- `index.html`: HTML file containing the frontend code.
- `script.js`: JavaScript file containing frontend logic.
- `styles.css`: CSS file for styling the frontend.

Feel free to contribute or provide feedback!
