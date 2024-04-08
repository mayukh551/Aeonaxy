function checkPasswordStrength(password) {
    // Check if password is at least 8 characters long
    if (password.length < 8) {
        return false;
    }

    // Check if password contains an uppercase letter
    if (!/[A-Z]/.test(password)) {
        return false;
    }

    // Check if password contains a lowercase letter
    if (!/[a-z]/.test(password)) {
        return false;
    }

    // Check if password contains a number
    if (!/[0-9]/.test(password)) {
        return false;
    }

    // Check if password contains a special symbol
    if (!/[_#$@%]/.test(password)) {
        return false;
    }

    // Password meets all criteria
    return true;
}

module.exports = checkPasswordStrength;