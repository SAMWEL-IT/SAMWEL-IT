// --- APPLICATION MEMORY MANAGEMENT SYSTEM (STATE) ---
let students = JSON.parse(localStorage.getItem('students')) || [];
let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || null;
let currentProfileImageBase64 = "";

// Master Admin Access Credentials
const ADMIN_CREDENTIALS = { username: "samwel", password: "1234" };

// --- RUN SYSTEM CONTROLLERS ON STARTUP ---
document.addEventListener("DOMContentLoaded", () => {
    setupSidebarEvents();
    checkLoginState();
    renderAdminTable();
});

// --- TOGGLE INTERACTIVE RUNSIDEBAR (3-LINE BAR MANAGEMENT) ---
function setupSidebarEvents() {
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggleSidebar");
    const closeBtn = document.getElementById("closeSidebar");

    toggleBtn.addEventListener("click", () => sidebar.classList.add("active"));
    closeBtn.addEventListener("click", () => sidebar.classList.remove("active"));
}

// --- DYNAMIC LAYER ENGINE (PAGE CONTROL SYSTEM) ---
function switchPage(pageId) {
    document.querySelectorAll(".page-section").forEach(sec => sec.classList.remove("active"));
    document.querySelectorAll(".menu-item").forEach(item => item.classList.remove("active"));

    if(pageId === 'home') document.getElementById("homePage").classList.add("active");
    if(pageId === 'register') {
        document.getElementById("registerPage").classList.add("active");
        toggleAuthBoxes('register');
    }
    if(pageId === 'admin') {
        document.getElementById("adminPage").classList.add("active");
        renderAdminTable();
    }
    if(pageId === 'profile') {
        document.getElementById("profilePage").classList.add("active");
        populateProfileFields();
    }
    
    // Auto-collapse navigation sidebar frame when running on mobile Viewports
    document.getElementById("sidebar").classList.remove("active");
}

function toggleAuthBoxes(boxType) {
    document.getElementById("registerBox").style.display = boxType === 'register' ? 'block' : 'none';
    document.getElementById("loginBox").style.display = boxType === 'login' ? 'block' : 'none';
    document.getElementById("successRegBox").style.display = 'none';
}

function openLoginModal() {
    switchPage('register');
    toggleAuthBoxes('login');
}

// --- IMAGE PIPELINE STREAM (CONVERT UPLOADS INTO PERSISTENT BASE64 STRINGS) ---
function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const preview = document.getElementById('avatarPreview');
        preview.style.backgroundImage = `url(${reader.result})`;
        preview.innerHTML = ""; // Remove icon elements completely
        currentProfileImageBase64 = reader.result;
    }
    reader.readAsDataURL(event.target.files[0]);
}

// --- ACCOUNT REGISTRATION REGISTRY ---
function handleRegister(event) {
    event.preventDefault();

    // Unique Registration Numbers generation, Format string: REG-2026-[Random4Digits]
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const regNumber = `REG-2026-${randNum}`;

    const newStudent = {
        regNumber: regNumber,
        firstName: document.getElementById("firstName").value,
        middleName: document.getElementById("middleName").value,
        lastName: document.getElementById("lastName").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        courseLevel: document.getElementById("courseLevel").value,
        password: document.getElementById("regPassword").value,
        image: currentProfileImageBase64 || "https://via.placeholder.com/150",
        status: "Active"
    };

    students.push(newStudent);
    localStorage.setItem('students', JSON.stringify(students));

    // Hide standard forms, execute target presentation modal showing system generation output
    document.getElementById("registerBox").style.display = "none";
    document.getElementById("successRegBox").style.display = "block";
    document.getElementById("generatedRegNum").innerText = regNumber;

    // Reset standard input vectors
    document.getElementById("regForm").reset();
    document.getElementById('avatarPreview').style.backgroundImage = "none";
    document.getElementById('avatarPreview').innerHTML = `<i class="fas fa-camera"></i><span>Upload Photo</span>`;
    currentProfileImageBase64 = "";
}

// --- SECURE AUTHORIZATION AUTH SIGN IN ---
function handleLogin(event) {
    event.preventDefault();
    const userInp = document.getElementById("loginRegNum").value.trim();
    const passInp = document.getElementById("loginPassword").value;

    // Validate Admin Accounts 
    if(userInp === ADMIN_CREDENTIALS.username && passInp === ADMIN_CREDENTIALS.password) {
        loggedInUser = { role: "admin", name: "System Administrator" };
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
        checkLoginState();
        switchPage('admin');
        return;
    }

    // Validate Standard Registered Student Accounts 
    const student = students.find(s => s.regNumber === userInp && s.password === passInp);
    
    if(student) {
        if(student.status === "Blocked") {
            alert("🚫 Account Access Suspended! Your account has been blocked by the System Administrator.");
            return;
        }
        loggedInUser = { role: "student", data: student };
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
        checkLoginState();
        switchPage('profile');
    } else {
        alert("❌ Credentials Mismatch! The registration number or password input is incorrect.");
    }
}

// --- PASSWORD AUTOMATED FORWARD RECOVERY ---
function handleForgotPassword() {
    const regNum = prompt("Please enter your Registration Number to request an automated password reset:");
    if(!regNum) return;

    const student = students.find(s => s.regNumber === regNum.trim());
    if(student) {
        const autoPass = Math.random().toString(36).slice(-6);
        student.password = autoPass;
        localStorage.setItem('students', JSON.stringify(students));
        
        // Simulating background automated SMTP server responses
        alert(`📧 System Dispatch: A new system-generated password has been sent automatically to the registered address (${student.email}).\n\nYour Temporary Password is: ${autoPass}`);
    } else {
        alert("❌ Target registration token data record not detected inside current environment.");
    }
}

// --- STATE MANAGEMENT TRACKER & UI SYNCING ---
function checkLoginState() {
    const statusDiv = document.getElementById("userNavStatus");
    const sideProfile = document.getElementById("sideProfileLink");
    const sideAdmin = document.getElementById("sideAdminLink");
    const logoutBtn = document.getElementById("logoutBtn");

    if(loggedInUser) {
        logoutBtn.style.display = "block";
        if(loggedInUser.role === 'admin') {
            statusDiv.innerHTML = `<span>Welcome, <b>Admin</b></span>`;
            sideAdmin.style.display = "block";
            sideProfile.style.display = "none";
        } else {
            statusDiv.innerHTML = `<span>Student: <b>${loggedInUser.data.firstName}</b></span>`;
            sideAdmin.style.display = "none";
            sideProfile.style.display = "block";
        }
    } else {
        statusDiv.innerHTML = `<button class="btn btn-primary" onclick="switchPage('register')">Get Started</button>`;
        sideAdmin.style.display = "none";
        sideProfile.style.display = "none";
        logoutBtn.style.display = "none";
    }
}

function logout() {
    loggedInUser = null;
    localStorage.removeItem('loggedInUser');
    checkLoginState();
    switchPage('home');
}

// --- PROFILE MULTI-TAB DISPLAY INTERFACE CONTROLLER ---
function switchProfileSubTab(tabId) {
    document.querySelectorAll(".sub-tab-content").forEach(c => c.classList.remove("active"));
    document.querySelectorAll(".prof-tab-btn").forEach(b => b.classList.remove("active"));

    document.getElementById(`profTab-${tabId}`).classList.add("active");
    event.currentTarget.classList.add("active");
}

function populateProfileFields() {
    if(!loggedInUser || loggedInUser.role !== 'student') return;
    const s = loggedInUser.data;

    document.getElementById("profCardImage").src = s.image;
    document.getElementById("profCardName").innerText = `${s.firstName} ${s.lastName}`;
    document.getElementById("profCardReg").innerText = s.regNumber;
    
    const statusCard = document.getElementById("profCardStatus");
    statusCard.innerText = s.status;
    statusCard.className = `status-badge ${s.status.toLowerCase()}`;

    document.getElementById("editFirstName").value = s.firstName;
    document.getElementById("editLastName").value = s.lastName;
    document.getElementById("editEmail").value = s.email;
    document.getElementById("editPhone").value = s.phone;
}

// Students modifying their own profile parameters
function handleStudentUpdate(event) {
    event.preventDefault();
    const currentReg = loggedInUser.data.regNumber;
    
    const idx = students.findIndex(st => st.regNumber === currentReg);
    if(idx !== -1) {
        students[idx].firstName = document.getElementById("editFirstName").value;
        students[idx].lastName = document.getElementById("editLastName").value;
        students[idx].email = document.getElementById("editEmail").value;
        students[idx].phone = document.getElementById("editPhone").value;

        loggedInUser.data = students[idx];
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
        localStorage.setItem('students', JSON.stringify(students));
        
        alert("✅ Success! Your personal records profile parameters have been updated.");
        populateProfileFields();
    }
}

// Student Changing Password Entry Vector
function handleStudentPasswordChange(event) {
    event.preventDefault();
    const oldP = document.getElementById("oldPass").value;
    const newP = document.getElementById("newPass").value;
    const currentReg = loggedInUser.data.regNumber;

    const idx = students.findIndex(st => st.regNumber === currentReg);
    if(idx !== -1 && students[idx].password === oldP) {
        students[idx].password = newP;
        loggedInUser.data.password = newP;
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
        localStorage.setItem('students', JSON.stringify(students));
        alert("✅ Security verification passed! Account Password updated successfully.");
        event.target.reset();
    } else {
        alert("❌ Authentication Failed! Current security passphrase input matches nothing.");
    }
}

// --- ADMINISTRATIVE DATA MATRIX OPERATORS (ADMIN CRUD PANEL) ---
function renderAdminTable() {
    const tbody = document.getElementById("adminStudentsTable");
    if(!tbody) return;
    tbody.innerHTML = "";

    if(students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No student user profile data currently initialized in database context.</td></tr>`;
        return;
    }

    students.forEach((s, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><img src="${s.image}" class="table-img" alt="avatar"></td>
            <td><b>${s.regNumber}</b></td>
            <td>${s.firstName} ${s.lastName}</td>
            <td>${s.email}</td>
            <td>${s.courseLevel}</td>
            <td><span class="status-badge ${s.status.toLowerCase()}">${s.status}</span></td>
            <td>
                <button class="btn btn-secondary" onclick="adminModifyStudentName('${s.regNumber}')" style="padding:5px 10px; font-size:12px;"><i class="fas fa-user-edit"></i> Edit Name</button>
                <button class="btn btn-secondary" onclick="adminResetStudentPassword('${s.regNumber}')" style="padding:5px 10px; font-size:12px; background:#fef3c7; color:#d97706;"><i class="fas fa-key"></i> Reset Pass</button>
                <button class="btn ${s.status === 'Active' ? 'btn-danger' : 'btn-success'}" onclick="adminToggleBlockStatus('${s.regNumber}')" style="padding:5px 10px; font-size:12px;">
                    ${s.status === 'Active' ? '🚫 Block' : '✓ Unblock'}
                </button>
                <button class="btn btn-danger" onclick="adminDeleteStudent(${index})" style="padding:5px 10px; font-size:12px;"><i class="fas fa-trash-alt"></i> Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function adminModifyStudentName(regNum) {
    const student = students.find(s => s.regNumber === regNum);
    if(!student) return;
    
    const newFirstName = prompt(`Modify First Name for ${student.firstName}:`, student.firstName);
    const newLastName = prompt(`Modify Last Name for ${student.lastName}:`, student.lastName);
    
    if(newFirstName && newLastName) {
        student.firstName = newFirstName;
        student.lastName = newLastName;
        localStorage.setItem('students', JSON.stringify(students));
        renderAdminTable();
        alert("✅ Student structural profile name updated by Admin.");
    }
}

function adminResetStudentPassword(regNum) {
    const student = students.find(s => s.regNumber === regNum);
    if(!student) return;

    const newPass = prompt(`Assign a new operational password for ${student.firstName}:`);
    if(newPass) {
        student.password = newPass;
        localStorage.setItem('students', JSON.stringify(students));
        renderAdminTable();
        
        // Emulated background notification engine triggered by Admin Override actions
        alert(`📧 Dispatch System Alert: Account operational password overwritten by Admin permissions.\n\nThe system has transmitted the update automatically to student inbox via: ${student.email}`);
    }
}

function adminToggleBlockStatus(regNum) {
    const student = students.find(s => s.regNumber === regNum);
    if(!student) return;

    student.status = student.status === "Active" ? "Blocked" : "Active";
    localStorage.setItem('students', JSON.stringify(students));
    renderAdminTable();
    alert(`Account status updated to: ${student.status}`);
}

function adminDeleteStudent(index) {
    if(confirm("CRITICAL CRITERIA RISK WARNING: Are you completely certain you want to purge this record profile completely from the system state engine memory storage? This cannot be undone.")) {
        students.splice(index, 1);
        localStorage.setItem('students', JSON.stringify(students));
        renderAdminTable();
        alert("💥 Student account permanently erased from system records matrix.");
    }
}



