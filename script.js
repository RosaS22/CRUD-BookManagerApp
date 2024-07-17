$(document).ready(function() {
    // Function to fetch and display books from the API
    function fetchBooks() {
        console.log("Fetching books...");
        $.ajax({
            url: 'http://localhost:3000/books', // API endpoint for fetching books
            method: 'GET', // HTTP method for fetching data
            success: function(books) {
                $('#book-list').empty(); // Clear the existing list
                // Iterate over each book and append it to the list
                books.forEach(function(book) {
                    $('#book-list').append(`
                        <li class="list-group-item" data-id="${book.id}">
                            <strong>${book.title}</strong> by ${book.author}
                            ${book.dateRead ? `<span class="badge badge-success ml-2">Read on ${book.dateRead}</span>` : ''}
                            <button class="btn btn-warning btn-sm float-right read-btn mr-2">${book.dateRead ? 'Mark as Unread' : 'Mark as Read'}</button>
                            <button class="btn btn-danger btn-sm float-right delete-btn mr-2">Delete</button>
                            <button class="btn btn-info btn-sm float-right edit-btn mr-2">Edit</button>
                        </li>
                    `);
                });
                console.log("Books fetched successfully.");
            },
            error: function() {
                console.error("Failed to fetch books."); // Log error if fetch fails
            }
        });
    }

    // Initial fetch to populate the list
    fetchBooks();

    // Flag to check if we are in edit mode
    let editMode = false;
    // Variable to store the ID of the book being edited
    let editId = null;

    // Form submission event handler for adding or updating a book
    $('#book-form').submit(function(event) {
        event.preventDefault(); // Prevent the default form submission behavior

        // Collect the form data
        const bookData = {
            title: $('#title').val(),
            author: $('#author').val(),
            dateRead: null // New books are not read by default
        };

        if (!editMode) { // If not in edit mode, add a new book
            console.log("Adding new book...");
            $.ajax({
                url: 'http://localhost:3000/books', // API endpoint for adding a book
                method: 'POST', // HTTP method for creating data
                data: JSON.stringify(bookData), // Data to be sent in the request body
                contentType: 'application/json', // Content type of the request
                success: function() {
                    fetchBooks(); // Refresh the book list after adding
                    $('#book-form')[0].reset(); // Reset the form fields
                    console.log("Book added successfully.");
                },
                error: function() {
                    console.error("Failed to add book."); // Log error if add fails
                }
            });
        } else { // If in edit mode, update the existing book
            console.log("Updating book with ID:", editId);
            $.ajax({
                url: `http://localhost:3000/books/${editId}`, // API endpoint for updating a book
                method: 'PUT', // HTTP method for updating data
                data: JSON.stringify(bookData), // Data to be sent in the request body
                contentType: 'application/json', // Content type of the request
                success: function() {
                    fetchBooks(); // Refresh the book list after updating
                    $('#book-form')[0].reset(); // Reset the form fields
                    $('#book-form button').text('Add Book'); // Change button text back to "Add Book"
                    editMode = false; // Reset edit mode flag
                    editId = null; // Clear the edit ID
                    console.log("Book updated successfully.");
                },
                error: function() {
                    console.error("Failed to update book."); // Log error if update fails
                }
            });
        }
    });

    // Event handler for deleting a book
    $('#book-list').on('click', '.delete-btn', function() {
        const id = $(this).parent().data('id'); // Get the ID of the book to be deleted
        console.log("Deleting book with ID:", id);
        $.ajax({
            url: `http://localhost:3000/books/${id}`, // API endpoint for deleting a book
            method: 'DELETE', // HTTP method for deleting data
            success: function() {
                fetchBooks(); // Refresh the book list after deleting
                console.log("Book deleted successfully.");
            },
            error: function() {
                console.error("Failed to delete book."); // Log error if delete fails
            }
        });
    });

    // Event handler for editing a book
    $('#book-list').on('click', '.edit-btn', function() {
        editMode = true; // Set the flag to indicate edit mode
        editId = $(this).parent().data('id'); // Get the ID of the book to be edited
        const title = $(this).siblings('strong').text(); // Get the title of the book
        const author = $(this).parent().contents().filter(function() {
            return this.nodeType === 3;
        }).text().trim().split('by')[1].trim(); // Get the author of the book

        // Populate the form fields with the book's data
        $('#title').val(title);
        $('#author').val(author);
        $('#book-form button').text('Update Book'); // Change button text to "Update Book"
    });

    // Event handler for toggling the read status of a book
    $('#book-list').on('click', '.read-btn', function() {
        const id = $(this).parent().data('id'); // Get the ID of the book to be marked as read
        console.log("Toggling read status for book with ID:", id);

        // Fetch the current book data
        $.ajax({
            url: `http://localhost:3000/books/${id}`, // API endpoint for fetching a single book
            method: 'GET',
            success: function(book) {
                // Toggle the book's read status
                if (book.dateRead) {
                    book.dateRead = null;
                } else {
                    const currentDate = new Date().toISOString().split('T')[0]; // Get the current date in YYYY-MM-DD format
                    book.dateRead = currentDate;
                }
                $.ajax({
                    url: `http://localhost:3000/books/${id}`, // API endpoint for updating a book
                    method: 'PUT', // HTTP method for updating data
                    data: JSON.stringify(book), // Data to be sent in the request body
                    contentType: 'application/json', // Content type of the request
                    success: function() {
                        fetchBooks(); // Refresh the book list after updating
                        console.log("Book read status toggled successfully.");
                    },
                    error: function() {
                        console.error("Failed to update book."); // Log error if update fails
                    }
                });
            },
            error: function() {
                console.error("Failed to fetch book data."); // Log error if fetch fails
            }
        });
    });
});
