document.addEventListener('DOMContentLoaded', () => {
    const userTableBody = document.querySelector('#userTable tbody');
    const saveUserButton = document.querySelector('#saveUserButton');

    // Вызов fetchUsers() при загрузке страницы
    fetchUsers();

    function fetchUsers() {
        fetch('/api/users')
            .then(response => response.json())
            .then(data => {
                userTableBody.innerHTML = ''; // Clear the table
                data.forEach(user => {
                    const row = `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.username}</td>
                            <td>${user.firstname}</td>
                            <td>${user.lastname}</td>
                            <td>${user.age}</td>
                            <td>${user.email}</td>
                            <td>
                                <button class="btn btn-warning edit-btn" data-id="${user.id}">Edit</button>
                                <button class="btn btn-danger delete-btn" data-id="${user.id}">Delete</button>
                            </td>
                        </tr>
                    `;
                    userTableBody.innerHTML += row;
                });
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });
    }

    // Add a new user
    saveUserButton.addEventListener('click', () => {
        const username = document.querySelector('#username').value;
        const firstname = document.querySelector('#firstname').value;
        const lastname = document.querySelector('#lastname').value;
        const age = document.querySelector('#age').value;
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;
        const roles = Array.from(document.querySelectorAll('input[name="roles"]:checked')).map(input => ({id: input.value}));

        const user = {
            username,
            firstname,
            lastname,
            age,
            email,
            password,
            roles
        };

        fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add user');
                }
                return response.json();
            })
            .then(() => {
                fetchUsers(); // Refresh the table
                $('#addUserModal').modal('hide'); // Close the modal
            })
            .catch(error => {
                console.error('Error adding user:', error);
                alert('Failed to add user. Please check the console for details.');
            });
    });

    // Edit a user
    userTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-btn')) {
            const userId = event.target.getAttribute('data-id');
            fetch(`/api/users/${userId}`)
                .then(response => response.json())
                .then(user => {
                    // Populate the modal with user data
                    document.querySelector('#username').value = user.username;
                    document.querySelector('#firstname').value = user.firstname;
                    document.querySelector('#lastname').value = user.lastname;
                    document.querySelector('#age').value = user.age;
                    document.querySelector('#email').value = user.email;
                    document.querySelector('#password').value = user.password;

                    // Select roles
                    user.roles.forEach(role => {
                        const roleCheckbox = document.querySelector(`input[value="${role.id}"]`);
                        if (roleCheckbox) {
                            roleCheckbox.checked = true;
                        }
                    });

                    $('#addUserModal').modal('show');

                    // Update the user when saving
                    saveUserButton.setAttribute('data-id', userId);
                    saveUserButton.setAttribute('data-action', 'update');
                })
                .catch(error => {
                    console.error('Error fetching user for edit:', error);
                    alert('Failed to fetch user data for edit.');
                });
        }

        if (event.target.classList.contains('delete-btn')) {
            const userId = event.target.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this user?')) {
                fetch(`/api/users/${userId}`, {
                    method: 'DELETE'
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to delete user');
                        }
                        return response.json();
                    })
                    .then(() => {
                        fetchUsers(); // Refresh the table
                    })
                    .catch(error => {
                        console.error('Error deleting user:', error);
                        alert('Failed to delete user. Please check the console for details.');
                    });
            }
        }
    });

    // Delete a user
    userTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const userId = event.target.getAttribute('data-id');
            fetch(`/api/users/${userId}`, {
                method: 'DELETE'
            })
                .then(() => {
                    fetchUsers(); // Refresh the table
                });
        }
    });

    // Initial fetch of users
    fetchUsers();

    // Fetch roles for the modal
    fetch('/api/users/roles')
        .then(response => response.json())
        .then(roles => {
            const rolesContainer = document.querySelector('#rolesContainer');
            roles.forEach(role => {
                const roleCheckbox = `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="roles" value="${role.id}" id="role_${role.id}">
                        <label class="form-check-label" for="role_${role.id}">${role.name}</label>
                    </div>
                `;
                rolesContainer.innerHTML += roleCheckbox;
            });
        });
});