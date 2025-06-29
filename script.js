document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Element References ---
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    const firstPage = document.getElementById('firstPage');
    const simulationPage = document.getElementById('simulationPage');
    const analyzePasswordBtn = document.getElementById('analyzePasswordBtn');
    const backToMainBtn = document.getElementById('backToMainBtn');

    const passwordInput = document.getElementById('passwordInput');
    const showPasswordCheckbox = document.getElementById('showPassword');
    const passwordStrengthSpan = document.getElementById('passwordStrength');
    const strengthProgressBar = document.getElementById('strengthProgressBar');
    const requirementsList = document.getElementById('requirementsList');

    const targetPasswordDisplay = document.getElementById('targetPasswordDisplay');
    const attackMethodRadios = document.querySelectorAll('input[name="attackMethod"]');
    const crackingProgressBar = document.getElementById('crackingProgressBar');
    const crackingProgressPercentage = document.getElementById('crackingProgressPercentage');
    const currentAttemptValue = document.getElementById('currentAttemptValue');
    const attemptLog = document.getElementById('attemptLog');
    const speedRange = document.getElementById('speedRange');
    const speedValueSpan = document.getElementById('speedValue');
    const startSimulationBtn = document.getElementById('startSimulationBtn');
    const pauseSimulationBtn = document.getElementById('pauseSimulationBtn');
    const resetSimulationBtn = document.getElementById('resetSimulationBtn');

    const hashTypeRadios = document.querySelectorAll('input[name="hashType"]');
    const generatedHashDiv = document.getElementById('generatedHash');
    const copyHashBtn = document.getElementById('copyHashBtn');

    // --- State Variables for Simulation (Initialize as needed) ---
    let currentPassword = '';
    let simulationIntervalId = null;
    let isSimulationRunning = false;
    let attempts = 0;
    let maxAttempts = 500000; // Example max attempts for simulation progress
    let crackable = false; // Will be true if password is 'cracked' in simulation
    let selectedHashType = 'sha256'; // Default hash type


    // --- Theme Toggle Logic ---
    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark');
            body.classList.remove('light');
            themeToggle.checked = true;
        } else {
            body.classList.add('light'); // Default to light if no theme saved or it's 'light'
            body.classList.remove('dark');
            themeToggle.checked = false;
        }

        themeToggle.addEventListener('change', function() {
            if (themeToggle.checked) {
                body.classList.remove('light');
                body.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                body.classList.remove('dark');
                body.classList.add('light');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // --- Page Navigation and Background Logic ---
    function showPage(pageToShow) {
        if (pageToShow === 'first') {
            firstPage.classList.remove('hidden');
            simulationPage.classList.add('hidden');
            body.classList.remove('no-background-image'); // Restore background
            resetSimulation(); // Reset simulation when going back
        } else if (pageToShow === 'simulation') {
            firstPage.classList.add('hidden');
            simulationPage.classList.remove('hidden');
            body.classList.add('no-background-image'); // Remove background
            // Prepare simulation with current password
            targetPasswordDisplay.textContent = currentPassword || 'No password entered';
            updateGeneratedHash(); // Generate initial hash for the simulation page
        }
    }

    if (analyzePasswordBtn) {
        analyzePasswordBtn.addEventListener('click', function() {
            currentPassword = passwordInput.value; // Store the password for simulation
            if (currentPassword.length > 0) {
                showPage('simulation');
            } else {
                alert('Please enter a password to analyze.');
            }
        });
    }

    if (backToMainBtn) {
        backToMainBtn.addEventListener('click', function() {
            showPage('first');
        });
    }

    // --- Show/Hide Password Functionality ---
    if (showPasswordCheckbox && passwordInput) {
        showPasswordCheckbox.addEventListener('change', function() {
            if (this.checked) {
                passwordInput.type = 'text';
            } else {
                passwordInput.type = 'password';
            }
        });
    }

    // --- Password Strength Analysis (Placeholder - **YOU NEED TO IMPLEMENT THIS ACCURATELY**) ---
    const requirements = [
        { regex: /.{8,}/, message: 'At least 8 characters' },
        { regex: /[A-Z]/, message: 'Contains uppercase letter' },
        { regex: /[a-z]/, message: 'Contains lowercase letter' },
        { regex: /[0-9]/, message: 'Contains a number' },
        { regex: /[^A-Za-z0-9]/, message: 'Contains a special character' },
        // Add more requirements like 'Not a common password' if you have a dictionary or API
        { checkFn: (pwd) => !isCommonPassword(pwd), message: 'Not a common password' }
    ];

    function checkPasswordStrength(password) {
        let score = 0;
        let metCount = 0;

        requirementsList.innerHTML = ''; // Clear previous requirements

        requirements.forEach(req => {
            const li = document.createElement('li');
            const iconSpan = document.createElement('span');
            iconSpan.classList.add('icon');
            li.appendChild(iconSpan);
            li.append(req.message);

            let isMet = false;
            if (req.regex) {
                isMet = req.regex.test(password);
            } else if (req.checkFn) {
                isMet = req.checkFn(password);
            }

            if (isMet) {
                li.classList.add('met');
                metCount++;
                score += 1; // Simple scoring based on requirements met
            } else {
                li.classList.add('not-met');
            }
            requirementsList.appendChild(li);
        });

        // Basic strength calculation
        if (password.length === 0) {
            score = 0;
        } else if (metCount === requirements.length && password.length >= 12) {
            score = 5; // All met and good length
        } else if (metCount >= 4 && password.length >= 10) {
            score = 4; // Strong
        } else if (metCount >= 3 && password.length >= 8) {
            score = 3; // Moderate
        } else if (metCount >= 2 && password.length >= 6) {
            score = 2; // Weak
        } else {
            score = 1; // Very Weak
        }

        updateStrengthDisplay(score);
        return score; // Return score for potential use in simulation logic
    }

    function updateStrengthDisplay(score) {
        let strengthText = 'No Password';
        let strengthClass = 'very-weak'; // Default to very weak/no password style
        let progressWidth = '0%';

        switch (score) {
            case 1: strengthText = 'Very Weak'; strengthClass = 'very-weak'; progressWidth = '20%'; break;
            case 2: strengthText = 'Weak'; strengthClass = 'weak'; progressWidth = '40%'; break;
            case 3: strengthText = 'Moderate'; strengthClass = 'moderate'; progressWidth = '60%'; break;
            case 4: strengthText = 'Strong'; strengthClass = 'strong'; progressWidth = '80%'; break;
            case 5: strengthText = 'Very Strong'; strengthClass = 'very-strong'; progressWidth = '100%'; break;
            default: // score 0 or any other
                strengthText = 'No Password';
                strengthClass = 'very-weak';
                progressWidth = '0%';
                break;
        }

        passwordStrengthSpan.textContent = strengthText;
        passwordStrengthSpan.className = 'strength ' + strengthClass;
        strengthProgressBar.style.width = progressWidth;
    }

    // Placeholder for common password check (implement a real list or API later)
    function isCommonPassword(password) {
        const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'welcome', '12345678', 'password123', 'iloveyou'];
        return commonPasswords.includes(password.toLowerCase());
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
            // Disable analyze button if password is empty
            analyzePasswordBtn.disabled = this.value.length === 0;
        });
        // Initial check on page load
        checkPasswordStrength(passwordInput.value);
        analyzePasswordBtn.disabled = passwordInput.value.length === 0; // Set initial state
    }

    // --- Password Hashing Logic (Placeholder - **YOU NEED TO IMPLEMENT THIS SECURELY**) ---
    // For a real app, never do sensitive hashing client-side. This is for visual demo.
    function generateHash(password, type) {
        if (!password) return 'No password to hash.';
        let hashResult = '';
        try {
            switch (type) {
                case 'md5':
                    // In a real scenario, use a proper MD5 library like 'js-md5' or similar.
                    // This is a dummy hash:
                    hashResult = 'MD5-' + btoa(password).substring(0, 20) + '...';
                    break;
                case 'sha1':
                     // In a real scenario, use a proper SHA1 library.
                    hashResult = 'SHA1-' + btoa(password).substring(0, 25) + '...';
                    break;
                case 'sha256':
                    // In a real scenario, use Web Crypto API or a library like 'crypto-js'.
                    hashResult = 'SHA256-' + btoa(password).substring(0, 32) + '...';
                    break;
                case 'bcrypt':
                    hashResult = 'Bcrypt-hash-simulated-' + password.substring(0, Math.min(password.length, 7)) + '...';
                    break;
                case 'argon2':
                    hashResult = 'Argon2-hash-simulated-' + password.substring(0, Math.min(password.length, 7)) + '...';
                    break;
                case 'scrypt':
                    hashResult = 'Scrypt-hash-simulated-' + password.substring(0, Math.min(password.length, 7)) + '...';
                    break;
                default:
                    hashResult = 'Select a Hash Type';
            }
        } catch (e) {
            console.error("Hashing error:", e);
            hashResult = "Error generating hash.";
        }
        return hashResult;
    }

    function updateGeneratedHash() {
        if (generatedHashDiv) {
            generatedHashDiv.textContent = generateHash(currentPassword, selectedHashType);
        }
    }

    hashTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            selectedHashType = this.value;
            updateGeneratedHash();
        });
    });

    if (copyHashBtn) {
        copyHashBtn.addEventListener('click', function() {
            if (generatedHashDiv && generatedHashDiv.textContent && generatedHashDiv.textContent !== 'No password to hash.') {
                navigator.clipboard.writeText(generatedHashDiv.textContent)
                    .then(() => {
                        alert('Hash copied to clipboard!');
                    })
                    .catch(err => {
                        console.error('Failed to copy hash: ', err);
                        alert('Failed to copy hash. Please copy manually.');
                    });
            } else {
                alert('Nothing to copy!');
            }
        });
    }

    // --- Simulation Logic (Placeholder - **YOU NEED TO IMPLEMENT THIS REALISTICALLY**) ---
    function startSimulation() {
        if (isSimulationRunning) return;

        if (!currentPassword || currentPassword.length === 0) {
            alert("Please enter a password on the main page first.");
            showPage('first'); // Go back to main page if no password
            return;
        }

        isSimulationRunning = true;
        startSimulationBtn.disabled = true;
        pauseSimulationBtn.disabled = false;
        resetSimulationBtn.disabled = false;

        const simulationSpeedMs = 1000 / parseFloat(speedRange.value); // attempts per second to milliseconds per attempt
        let currentStrengthScore = checkPasswordStrength(currentPassword); // Get the initial strength score

        // Adjust maxAttempts based on password complexity for a more "realistic" feel
        // These are highly arbitrary values for simulation, NOT cryptographically accurate
        if (currentStrengthScore === 1) maxAttempts = 1000;
        else if (currentStrengthScore === 2) maxAttempts = 10000;
        else if (currentStrengthScore === 3) maxAttempts = 100000;
        else if (currentStrengthScore === 4) maxAttempts = 1000000;
        else if (currentStrengthScore === 5) maxAttempts = 5000000; // Very strong

        // Further adjust based on selected attack method (very simplistic)
        const selectedMethod = document.querySelector('input[name="attackMethod"]:checked').value;
        if (selectedMethod === 'dictionary') {
            maxAttempts = Math.min(maxAttempts, 50000); // Dictionary attacks are "faster" for common words
        } else if (selectedMethod === 'hybrid') {
            maxAttempts = Math.min(maxAttempts, 500000); // Hybrid is somewhere in between
        }

        attemptLog.innerHTML = '<p class="no-attempts">Starting simulation...</p>'; // Clear log

        simulationIntervalId = setInterval(() => {
            if (attempts >= maxAttempts) {
                clearInterval(simulationIntervalId);
                isSimulationRunning = false;
                pauseSimulationBtn.disabled = true;
                currentAttemptValue.textContent = "Max attempts reached. Password NOT cracked (in this simulation).";
                attemptLog.innerHTML += `<p>Simulation ended: Max attempts (${maxAttempts}) reached without cracking.</p>`;
                return;
            }

            if (crackable) { // If password is "cracked"
                clearInterval(simulationIntervalId);
                isSimulationRunning = false;
                pauseSimulationBtn.disabled = true;
                currentAttemptValue.textContent = `Password Cracked! (${currentPassword})`;
                attemptLog.innerHTML += `<p style="color: var(--strength-strong);">SUCCESS: Password cracked after ${attempts} attempts!</p>`;
                return;
            }

            // Simulate an attempt
            attempts++;
            let simulatedAttempt = generateSimulatedAttempt(currentPassword, selectedMethod, attempts);
            currentAttemptValue.textContent = simulatedAttempt;

            // Log every 100 attempts or if it's the 1st
            if (attempts % 100 === 0 || attempts === 1) {
                attemptLog.innerHTML += `<p>Attempt ${attempts}: ${simulatedAttempt}</p>`;
                attemptLog.scrollTop = attemptLog.scrollHeight; // Scroll to bottom
            }

            // --- Simplified cracking check ---
            // A truly random attempt is unlikely to match quickly.
            // For demo purposes, we'll force a "crack" based on strength and attempts.
            if (simulatedAttempt === currentPassword) {
                crackable = true;
            } else if (currentStrengthScore <= 2 && attempts > maxAttempts * 0.1 && Math.random() < 0.05) {
                // Simulate crack for very weak/weak passwords after 10% of max attempts
                crackable = true;
            } else if (currentStrengthScore <= 3 && attempts > maxAttempts * 0.5 && Math.random() < 0.005) {
                // Simulate crack for moderate passwords after 50% of max attempts
                crackable = true;
            }


            // Update progress bar
            const progress = (attempts / maxAttempts) * 100;
            crackingProgressBar.style.width = `${progress}%`;
            crackingProgressPercentage.textContent = `${progress.toFixed(2)}%`;

        }, simulationSpeedMs);
    }

    function pauseSimulation() {
        clearInterval(simulationIntervalId);
        isSimulationRunning = false;
        startSimulationBtn.disabled = false;
        pauseSimulationBtn.disabled = true;
    }

    function resetSimulation() {
        clearInterval(simulationIntervalId);
        isSimulationRunning = false;
        attempts = 0;
        crackable = false;

        crackingProgressBar.style.width = '0%';
        crackingProgressPercentage.textContent = '0%';
        currentAttemptValue.textContent = 'N/A';
        attemptLog.innerHTML = '<p class="no-attempts">No attempts yet...</p>';

        startSimulationBtn.disabled = false;
        pauseSimulationBtn.disabled = true;
        resetSimulationBtn.disabled = true;
    }

    function generateSimulatedAttempt(targetPassword, method, currentAttemptNum) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?';
        let result = '';
        const length = targetPassword.length > 0 ? targetPassword.length : 8; // Aim for target length or default 8

        // Simplified logic for different attack methods
        if (method === 'dictionary') {
            const commonWords = ['password', 'dragon', 'secret', 'admin', 'qwerty', 'football', 'america', 'welcome', 'computer'];
            // For a true dictionary attack, we'd iterate through a list
            // Here, we pick a random common word to simulate finding it.
            if (currentAttemptNum % 100 === 0 && commonWords.includes(targetPassword.toLowerCase())) {
                return targetPassword; // "Found" if it's a common word
            }
            return commonWords[Math.floor(Math.random() * commonWords.length)];
        } else if (method === 'hybrid') {
            // Mix of dictionary and brute force elements
            const baseWord = (currentAttemptNum % 2 === 0 && commonWords.length > 0) ? commonWords[Math.floor(Math.random() * commonWords.length)] : '';
            const randomSuffix = Math.random().toString(36).substring(2, 2 + Math.floor(Math.random() * 3)); // 0-2 random chars
            const randomDigit = Math.floor(Math.random() * 99);
            return baseWord + randomSuffix + randomDigit;
        } else { // bruteForce or default
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }
    }


    if (startSimulationBtn) {
        startSimulationBtn.addEventListener('click', startSimulation);
    }
    if (pauseSimulationBtn) {
        pauseSimulationBtn.addEventListener('click', pauseSimulation);
    }
    if (resetSimulationBtn) {
        resetSimulationBtn.addEventListener('click', resetSimulation);
    }
    if (speedRange) {
        speedRange.addEventListener('input', function() {
            speedValueSpan.textContent = `${this.value}x`;
            if (isSimulationRunning) {
                pauseSimulation();
                startSimulation(); // Restart with new speed
            }
        });
    }

    // --- Initial setup ---
    showPage('first'); // Ensure the first page is shown on load
    // You might want to trigger initial password strength check if input has a default value
    if (passwordInput.value) {
        checkPasswordStrength(passwordInput.value);
    } else {
        // Set initial state for empty password input
        updateStrengthDisplay(0);
    }
    resetSimulation(); // Set initial state for simulation controls
});