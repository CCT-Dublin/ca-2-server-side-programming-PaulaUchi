const form = document.getElementById('userForm');
        const firstNameInput = document.getElementById('first_name');
        const lastNameInput = document.getElementById('last_name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const eircodeInput = document.getElementById('eir_code');

       

        // name validation
        function validateName(name) {
            if (!name || name.length > 20) {
                return false;
            }
    
            const nameRegex = /^[a-zA-Z0-9]+$/;
            return nameRegex.test(name);
        }

        // email validation
        function validateEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        // phone validations(must have only 10)
        function validatePhone(phone) {
            const phoneRegex = /^[0-9]{10}$/;
            return phoneRegex.test(phone);
        }

        //eircode validations(6 characters - number/letters)
        function validateEircode(eircode) {
            if (!eircode || eircode.length !== 6) {
                return false;
            }
            
            if (!/^[0-9]/.test(eircode)) {
                return false;
            }
            
            const eircodeRegex = /^[a-zA-Z0-9]{6}$/;
            return eircodeRegex.test(eircode);
        }

        //error message if input not correct
        function showError(inputId, message) {
            const input = document.getElementById(inputId);
            const errorDiv = document.getElementById(inputId + '_error');
            
            input.classList.add('error');
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
        }

        // cear the error message
        function clearError(inputId) {
            const input = document.getElementById(inputId);
            const errorDiv = document.getElementById(inputId + '_error');
            
            input.classList.remove('error');
            errorDiv.classList.remove('show');
        }

        // clear all errors
        function clearAllErrors() {
            clearError('first_name');
            clearError('last_name');
            clearError('email');
            clearError('phone');
            clearError('eir_code');
            document.getElementById('generalError').classList.remove('show');
            document.getElementById('successMessage').classList.remove('show');
        }

        // validation as user types
        firstNameInput.addEventListener('input', function() {
            if (this.value && !validateName(this.value)) {
                showError('first_name', 'Max 20 characters, letters/numbers only');
            } else {
                clearError('first_name');
            }
        });

        lastNameInput.addEventListener('input', function() {
            if (this.value && !validateName(this.value)) {
                showError('last_name', 'Max 20 characters, letters/numbers only');
            } else {
                clearError('last_name');
            }
        });

        emailInput.addEventListener('input', function() {
            if (this.value && !validateEmail(this.value)) {
                showError('email', 'Please enter a valid email address');
            } else {
                clearError('email');
            }
        });

        phoneInput.addEventListener('input', function() {
            // Only allow numbers
            this.value = this.value.replace(/[^0-9]/g, '');
            
            if (this.value && !validatePhone(this.value)) {
                showError('phone', 'Phone must be exactly 10 digits');
            } else {
                clearError('phone');
            }
        });

        // handle form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // prevent default form submission
            
            clearAllErrors();
            
            // Get form values
            const firstName = firstNameInput.value.trim();
            const lastName = lastNameInput.value.trim();
            const email = emailInput.value.trim();
            const phone = phoneInput.value.trim();
            const eircode = eircodeInput.value.trim();

            let isValid = true;

            // Validate all fields
            if (!validateName(firstName)) {
                showError('first_name', 'Invalid first name (max 20 chars, letters/numbers only)');
                isValid = false;
            }

            if (!validateName(lastName)) {
                showError('last_name', 'Invalid last name (max 20 chars, letters/numbers only)');
                isValid = false;
            }

            if (!validateEmail(email)) {
                showError('email', 'Please enter a valid email address');
                isValid = false;
            }

            if (!validatePhone(phone)) {
                showError('phone', 'Phone must be exactly 10 digits');
                isValid = false;
            }

            if (!validateEircode(eircode)) {
                showError('eir_code', 'Eircode must be 6 characters and start with a number');
                isValid = false;
            }

            // If validation fails, stop here
            if (!isValid) {
                return;
            }

            // Create data object to send to server
            const formData = {
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: phone,
                eir_code: eircode
            };

            // Send data to server using fetch API
            fetch('/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message
                    document.getElementById('successMessage').classList.add('show');
                    // Clear the form
                    form.reset();
                    // Hide success message after 3 seconds
                    setTimeout(() => {
                        document.getElementById('successMessage').classList.remove('show');
                    }, 3000);
                } else {
                    // Show error message
                    const errorDiv = document.getElementById('generalError');
                    errorDiv.textContent = '❌ ' + (data.message || 'Submission failed');
                    errorDiv.classList.add('show');
                }
            })
            .catch(error => {
                // Show error message if request fails
                const errorDiv = document.getElementById('generalError');
                errorDiv.textContent = '❌ Error: Could not connect to server';
                errorDiv.classList.add('show');
                console.error('Error:', error);
            });
        });