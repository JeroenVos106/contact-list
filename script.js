document.addEventListener("DOMContentLoaded", function() {
    // Fetch contacts from the backend and display them
    fetchContacts();
  
    // Add event listener to the form for adding a new contact
    document.getElementById("add-contact-form").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent default form submission behavior
        addContact();
    });
  
    // Add event listeners for edit and remove buttons
    document.getElementById("contacts-list").addEventListener("click", function(event) {
        const target = event.target;
        if (target.classList.contains("edit-contact")) {
            const contactId = parseInt(target.dataset.id);
            openEditContactPopup(contactId);
        } else if (target.classList.contains("remove-contact")) {
            const contactId = parseInt(target.dataset.id);
            removeContact(contactId);
        }
    });
  
    // Add event listener to the exit button in the Edit Contact pop-up window
    document.getElementById("edit-contact-popup").querySelector(".close").addEventListener("click", function() {
        closeEditContactPopup();
    });
  
    // Prevent closing the pop-up when clicking inside it
    document.querySelector("#edit-contact-popup .popup-content").addEventListener("click", function(event) {
        event.stopPropagation();
    });
  
    // Add event listener for submitting the edit contact form
    document.getElementById("edit-contact-form").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent default form submission behavior
        const contactId = parseInt(document.getElementById("edit-contact-form").dataset.id);
        updateContact(contactId);
    });
  
    // Open Add Contact Popup
    document.getElementById("add-contact-button").addEventListener("click", function() {
        openAddContactPopup();
    });
  
    // Close Add Contact Popup
    document.querySelector("#add-contact-popup .close").addEventListener("click", function() {
        closeAddContactPopup();
    });
  });
  
  function fetchContacts() {
    fetch("/contacts")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch contacts");
            }
            return response.json();
        })
        .then(data => {
            const contactsList = document.getElementById("contacts-list");
            contactsList.innerHTML = ""; // Clear existing contacts
  
            if (data.length === 0) {
                const noContactsMessage = document.createElement("p");
                noContactsMessage.textContent = "No contacts available";
                contactsList.appendChild(noContactsMessage);
            } else {
                // Display each contact using displayContact function
                data.forEach(contact => {
                    displayContact(contact);
                });
            }
        })
        .catch(error => console.error("Error fetching contacts:", error));
  }
  
  function addContact() {
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
  
    fetch("/add-contact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, phone, email })
    })
    .then(response => {
        if (response.ok) {
            console.log("Contact added successfully");
            fetchContacts(); // Fetch and display updated contact list
            closeAddContactPopup(); // Close the Add Contact pop-up
        } else {
            throw new Error("Failed to add contact");
        }
    })
    .catch(error => console.error("Error adding contact:", error));
  }
  
  function editContact(contactId) {
    // Implement editContact functionality if needed
    console.log("Edit contact with ID:", contactId);
  }
  
  function removeContact(contactId) {
    // Send a request to the backend to remove the contact with the given ID
    fetch("/remove-contact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: contactId })
    })
    .then(response => {
        if (response.ok) {
            console.log("Contact removed successfully");
            // Optionally, you can fetch and display the updated contact list
            fetchContacts();
        } else {
            throw new Error("Failed to remove contact");
        }
    })
    .catch(error => console.error("Error removing contact:", error));
  }
  
  function displayContact(contact) {
    const contactsList = document.getElementById("contacts-list");
  
    // Create a div element for the contact entry
    const contactEntry = document.createElement("div");
    contactEntry.classList.add("contact-entry");
  
    // Create paragraph elements for name, phone, and email
    const nameParagraph = document.createElement("p");
    nameParagraph.textContent = "Name: " + contact.name;
    const phoneParagraph = document.createElement("p");
    phoneParagraph.textContent = "Phone: " + contact.phone;
    const emailParagraph = document.createElement("p");
    emailParagraph.textContent = "Email: " + contact.email;
  
    // Create buttons for editing and removing contacts
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.classList.add("edit-contact");
    editButton.dataset.id = contact.id;
  
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.classList.add("remove-contact");
    removeButton.dataset.id = contact.id;
  
    // Append paragraphs and buttons to the contact entry
    contactEntry.appendChild(nameParagraph);
    contactEntry.appendChild(phoneParagraph);
    contactEntry.appendChild(emailParagraph);
    contactEntry.appendChild(editButton);
    contactEntry.appendChild(removeButton);
  
    // Append the contact entry to the contacts list
    contactsList.appendChild(contactEntry);
  }
  
  // Function to fetch contact details by ID from the backend
  function getContactById(contactId) {
    return fetch(`/contacts/${contactId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to fetch contact details");
        }
        return response.json();
      })
      .then(data => data)
      .catch(error => console.error("Error fetching contact details:", error));
  }
  
  // Function to update contact information in the backend
  function updateContact(contact) {
    return fetch("/update-contact", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(contact)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to update contact");
      }
      console.log("Contact updated successfully");
    })
    .catch(error => console.error("Error updating contact:", error));
  }
  
  function openEditContactPopup(contactId) {
    // Fetch the contact details by ID and populate the edit form
    getContactById(contactId)
      .then(contact => {
        // Populate the input fields with the contact's information
        document.getElementById("edit-name").value = contact.name;
        document.getElementById("edit-phone").value = contact.phone;
        document.getElementById("edit-email").value = contact.email;
        // Set the contact ID as a data attribute in the form
        document.getElementById("edit-contact-form").dataset.id = contactId;
      })
      .catch(error => console.error("Error fetching contact details:", error));
  
    // Show the pop-up
    document.getElementById("edit-contact-popup").style.display = "block";
  }
  
  function closeEditContactPopup() {
    // Clear the edit form
    document.getElementById("edit-contact-form").reset();
    // Hide the pop-up
    document.getElementById("edit-contact-popup").style.display = "none";
  }
  
  function updateContact(contactId) {
    const name = document.getElementById("edit-name").value;
    const phone = document.getElementById("edit-phone").value;
    const email = document.getElementById("edit-email").value;
  
    const updatedContact = {
      id: contactId,
      name: name,
      phone: phone,
      email: email
    };
  
    // Send a request to update the contact
    updateContact(updatedContact)
      .then(() => {
        console.log("Contact updated successfully");
        fetchContacts(); // Fetch and display updated contact list
        closeEditContactPopup(); // Close the pop-up after updating
      })
      .catch(error => console.error("Error updating contact:", error));
  }
  
  function closeEditContactPopup() {
    // Clear the edit form
    document.getElementById("edit-contact-form").reset();
    // Hide the pop-up
    document.getElementById("edit-contact-popup").style.display = "none";
  }
  
  // Function to open the Add Contact pop-up
  function openAddContactPopup() {
  document.getElementById("add-contact-popup").style.display = "block";
  }
  
  // Function to close the Add Contact pop-up
  function closeAddContactPopup() {
  document.getElementById("add-contact-popup").style.display = "none";
  }
  
  function changeLanguage(language) {
    var element = document.getElementById("url");
    element.value = language;
    element.innerHTML = language;
  }
  
  function showDropdown() {
    document.getElementById("myDropdown").classList.toggle("show");
  }
  
  // Close the dropdown if the user clicks outside of it
  window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
  }