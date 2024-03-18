package main

import (
	"database/sql"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	_ "github.com/go-sql-driver/mysql"
)

// Contact structure to represent a contact
type Contact struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Phone string `json:"phone"`
	Email string `json:"email"`
}

func main() {
	// Read database connection settings from environment variables
	dbURL := os.Getenv("localhost:3306")
	dbUser := os.Getenv("root")
	dbPassword := os.Getenv("123456")
	dbName := os.Getenv("contacts_db")

	// Construct database connection string
	dbConnectionString := dbUser + ":" + dbPassword + "@tcp(" + dbURL + ")/" + dbName

	// Connect to MySQL database
	db, err := sql.Open("mysql", dbConnectionString)
	if err != nil {
		log.Fatal("Error connecting to the database:", err)
	}
	defer db.Close()

	// Check the connection status
	if err := db.Ping(); err != nil {
		log.Fatal("Error pinging the database:", err)
	} else {
		log.Println("Database connection successful")
	}

	// Serve the frontend (index.html, script.js, styles.css)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "index.html")
	})

	http.HandleFunc("/script.js", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "script.js")
	})

	http.HandleFunc("/styles.css", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "styles.css")
	})

	// Define HTTP handlers for the backend API
	http.HandleFunc("/contacts", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			getContacts(w, r, db)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
	http.HandleFunc("/add-contact", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			addContact(w, r, db)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	http.HandleFunc("/edit-contact", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			editContact(w, r, db)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	http.HandleFunc("/remove-contact", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			removeContact(w, r, db)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Start the server
	log.Println("Server started on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// Handler to fetch all contacts
func getContacts(w http.ResponseWriter, _ *http.Request, db *sql.DB) {
	contacts, err := getAllContactsFromDB(db)
	if err != nil {
		http.Error(w, "Failed to fetch contacts", http.StatusInternalServerError)
		log.Println("Error fetching contacts from database:", err) // Log the error
		return
	}
	json.NewEncoder(w).Encode(contacts)
}

// Handler to add a new contact
func addContact(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var contact Contact
	err := json.NewDecoder(r.Body).Decode(&contact)
	if err != nil {
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
		return
	}

	err = addContactToDB(db, contact)
	if err != nil {
		http.Error(w, "Failed to add contact", http.StatusInternalServerError)
		log.Println("Error adding contact to database:", err) // Log the error
		return
	}

	w.WriteHeader(http.StatusCreated)
}

// Function to add a new contact to the database
func addContactToDB(db *sql.DB, contact Contact) error {
	_, err := db.Exec("INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?)", contact.Name, contact.Phone, contact.Email)
	if err != nil {
		return err
	}
	return nil
}

func getAllContactsFromDB(db *sql.DB) ([]Contact, error) {
	rows, err := db.Query("SELECT id, name, phone, email FROM contacts")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contacts []Contact
	for rows.Next() {
		var contact Contact
		if err := rows.Scan(&contact.ID, &contact.Name, &contact.Phone, &contact.Email); err != nil {
			return nil, err
		}
		contacts = append(contacts, contact)
	}

	// If no contacts found, return an empty slice
	if len(contacts) == 0 {
		return contacts, nil
	}

	return contacts, nil
}

// Handler to edit an existing contact
func editContact(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var contact Contact
	err := json.NewDecoder(r.Body).Decode(&contact)
	if err != nil {
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
		return
	}

	err = updateContactInDB(db, contact)
	if err != nil {
		http.Error(w, "Failed to update contact", http.StatusInternalServerError)
		log.Println("Error updating contact in the database:", err)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func removeContact(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	// Parse request body and extract contact ID
	var requestData struct {
		ID int `json:"id"`
	}

	// Log the request body
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusInternalServerError)
		log.Println("Error reading request body:", err)
		return
	}
	log.Println("Received request body:", string(body))

	// Decode the request body
	err = json.Unmarshal(body, &requestData)
	if err != nil {
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
		log.Println("Error decoding request body:", err)
		return
	}

	// Delete corresponding contact from the database
	err = deleteContactFromDB(db, requestData.ID)
	if err != nil {
		http.Error(w, "Failed to delete contact", http.StatusInternalServerError)
		log.Println("Error deleting contact from database:", err)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// Function to update an existing contact in the database
func updateContactInDB(db *sql.DB, contact Contact) error {
	_, err := db.Exec("UPDATE contacts SET name=?, phone=?, email=? WHERE id=?", contact.Name, contact.Phone, contact.Email, contact.ID)
	if err != nil {
		return err
	}
	return nil
}

func deleteContactFromDB(db *sql.DB, id int) error {
	_, err := db.Exec("DELETE FROM contacts WHERE id=?", id)
	if err != nil {
		return err
	}
	return nil
}
