// ---------- DATA STORAGE ----------
let students = JSON.parse(localStorage.getItem("students")) || [];
let currentLoggedStudent = JSON.parse(sessionStorage.getItem("loggedStudent")) || null;
let adminLogged = sessionStorage.getItem("adminLogged") === "true";

function saveStudents() {
    localStorage.setItem("students", JSON.stringify(students));
}

function generateRegNumber() {
    let lastId = 0;
    students.forEach(s => {
        let parts = s.regNumber.split("/");
        if(parts.length === 3) {
            let num = parseInt(parts[2]);
            if(!isNaN(num) && num > lastId) lastId = num;
        }
    });
    let newNum = (lastId + 1).toString().padStart(4, "0");
    return `SMT/2025/${newNum}`;
}

// RENDER APP MAIN
function renderApp() {
    const container = document.getElementById("pageContainer");
    const topBar = document.getElementById("topBar");
    const sidebar = document.getElementById("studentSidebar");
    const menuToggle = document.getElementById("menuToggleBtn");

    if (adminLogged) {
        topBar.style.display = "flex";
        if (menuToggle) menuToggle.style.display = "none";
        sidebar.classList.remove("open");
        container.innerHTML = renderAdminPanel();
        attachAdminEvents();
    } 
    else if (currentLoggedStudent) {
        topBar.style.display = "flex";
        if (menuToggle) menuToggle.style.display = "block";
        const activeNav = document.querySelector(".side-nav-btn.active")?.getAttribute("data-student-nav") || "home";
        container.innerHTML = renderStudentContent(activeNav);
        attachStudentSidebarEvents();
    } 
    else {
        topBar.style.display = "none";
        sidebar.classList.remove("open");
        container.innerHTML = renderHomepage();
        attachHomepageEvents();
    }
}

// ---------- HOMEPAGE ----------
function renderHomepage() {
    return `
        <div class="card" style="text-align:center;">
            <h1>🎓 Smart Student Portal</h1>
            <p style="margin:20px 0;">Advanced Management System</p>
            <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                <button id="goToRegisterBtn" style="background:#10b981;">📝 Register</button>
                <button id="goToLoginBtn" style="background:#3b82f6;">🔐 Student Login</button>
                <button id="goToAdminLoginBtn" style="background:#8b5cf6;">👑 Admin Login</button>
            </div>
        </div>
        <div id="authFormsContainer"></div>
    `;
}

function attachHomepageEvents() {
    const regBtn = document.getElementById("goToRegisterBtn");
    const loginBtn = document.getElementById("goToLoginBtn");
    const adminBtn = document.getElementById("goToAdminLoginBtn");
    const containerDiv = document.getElementById("authFormsContainer");
    
    if (regBtn) {
        regBtn.onclick = () => {
            containerDiv.innerHTML = renderRegisterForm();
            attachRegisterEvents();
        };
    }
    if (loginBtn) {
        loginBtn.onclick = () => {
            containerDiv.innerHTML = renderStudentLoginForm();
            attachStudentLoginEvents();
        };
    }
    if (adminBtn) {
        adminBtn.onclick = () => {
            containerDiv.innerHTML = renderAdminLoginForm();
            attachAdminLoginEvents();
        };
    }
}

// REGISTER FORM
function renderRegisterForm() {
    return `
        <div class="card">
            <h2>📝 Student Registration</h2>
            <div class="form-grid">
                <div class="input-group"><label>🖼️ Image URL</label><input type="text" id="regImage" placeholder="https://randomuser.me/api/portraits/women/1.jpg" value="https://randomuser.me/api/portraits/men/1.jpg"></div>
                <div class="input-group"><label>First Name *</label><input id="regFname" placeholder="John"></div>
                <div class="input-group"><label>Second Name</label><input id="regSname" placeholder="Michael"></div>
                <div class="input-group"><label>Last Name *</label><input id="regLname" placeholder="Doe"></div>
                <div class="input-group"><label>Phone</label><input id="regPhone" placeholder="+255712345678"></div>
                <div class="input-group"><label>Email (Google) *</label><input id="regEmail" placeholder="student@gmail.com"></div>
                <div class="input-group"><label>Course Level (4-9)</label><select id="regLevel"><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option></select></div>
            </div>
            <button id="registerBtn" style="background:#10b981; margin-top:15px;">✅ Register & Get Reg Number</button>
            <p id="regResult" style="margin-top:15px; font-weight:bold;"></p>
        </div>
    `;
}

function attachRegisterEvents() {
    const registerBtn = document.getElementById("registerBtn");
    if (!registerBtn) return;
    
    registerBtn.onclick = () => {
        const image = document.getElementById("regImage").value || "https://randomuser.me/api/portraits/men/1.jpg";
        const fname = document.getElementById("regFname").value.trim();
        const sname = document.getElementById("regSname").value.trim();
        const lname = document.getElementById("regLname").value.trim();
        const phone = document.getElementById("regPhone").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const level = document.getElementById("regLevel").value;
        
        if (!fname || !lname || !email || !email.includes("@gmail.com")) {
            document.getElementById("regResult").innerHTML = "❌ Error: First name, Last name, and valid Gmail required!";
            return;
        }
        
        const newReg = generateRegNumber();
        const defaultPass = "pass123";
        const newStudent = {
            regNumber: newReg,
            password: defaultPass,
            firstName: fname,
            secondName: sname,
            lastName: lname,
            phone: phone,
            email: email,
            level: level,
            image: image,
            isBlocked: false,
            results: { semester1: "GPA 3.8 (B+)", semester2: "GPA 3.9 (A-)" },
            payments: "✅ Fully Paid - No Arrears",
            accountStatus: "Active"
        };
        
        students.push(newStudent);
        saveStudents();
        
        document.getElementById("regResult").innerHTML = `
            ✅ Registration Successful!<br>
            🆔 Reg Number: <strong>${newReg}</strong><br>
            🔑 Default Password: <strong>${defaultPass}</strong><br><br>
            <button id="gotoLoginAfterReg" style="background:#3b82f6;">🔐 Go to Login Page</button>
        `;
        
        const gotoBtn = document.getElementById("gotoLoginAfterReg");
        if (gotoBtn) {
            gotoBtn.onclick = () => {
                const containerDiv = document.getElementById("authFormsContainer");
                containerDiv.innerHTML = renderStudentLoginForm();
                attachStudentLoginEvents();
            };
        }
    };
}

// STUDENT LOGIN
function renderStudentLoginForm() {
    return `
        <div class="card">
            <h2>🔐 Student Login</h2>
            <div class="input-group"><label>Reg Number</label><input id="loginReg" placeholder="e.g SMT/2025/0001"></div>
            <div class="input-group"><label>Password</label><input id="loginPass" type="password" placeholder="Password"></div>
            <button id="doStudentLogin" style="background:#3b82f6; width:100%;">Login</button>
            <p id="loginMsg" style="color:red; margin-top:10px;"></p>
            <button id="forgotPassBtn" style="background:#6b7280; margin-top:10px;">🔑 Forgot Password?</button>
        </div>
    `;
}

function attachStudentLoginEvents() {
    const loginBtn = document.getElementById("doStudentLogin");
    if (!loginBtn) return;
    
    loginBtn.onclick = () => {
        const reg = document.getElementById("loginReg").value;
        const pass = document.getElementById("loginPass").value;
        const student = students.find(s => s.regNumber === reg && s.password === pass);
        
        if (student) {
            if (student.isBlocked) {
                document.getElementById("loginMsg").innerText = "⛔ Account is BLOCKED. Contact admin.";
                return;
            }
            currentLoggedStudent = student;
            sessionStorage.setItem("loggedStudent", JSON.stringify(student));
            adminLogged = false;
            sessionStorage.removeItem("adminLogged");
            renderApp();
        } else {
            document.getElementById("loginMsg").innerText = "❌ Invalid Reg Number or Password";
        }
    };
    
    const forgotBtn = document.getElementById("forgotPassBtn");
    if (forgotBtn) {
        forgotBtn.onclick = () => {
            const reg = document.getElementById("loginReg").value;
            const student = students.find(s => s.regNumber === reg);
            if (student && student.email) {
                const newPass = Math.random().toString(36).slice(2, 10);
                student.password = newPass;
                saveStudents();
                alert(`📧 System sent new password to ${student.email}\n🔐 New Password: ${newPass} (Demo)`);
                console.log(`[EMAIL SIMULATION] To: ${student.email} | New Password: ${newPass}`);
                document.getElementById("loginMsg").innerHTML = "✅ Password reset. Check email/console for new password.";
            } else {
                document.getElementById("loginMsg").innerText = "❌ Reg Number not found";
            }
        };
    }
}

// ADMIN LOGIN
function renderAdminLoginForm() {
    return `
        <div class="card">
            <h2>👑 Admin Login</h2>
            <div class="input-group"><label>Admin Password</label><input id="adminPass" type="password" placeholder="Enter admin password"></div>
            <button id="adminLoginBtn" style="background:#8b5cf6; width:100%;">Login as Admin</button>
            <p id="adminMsg" style="color:red; margin-top:10px;"></p>
            <p style="margin-top:15px; font-size:12px;">Demo Password: <strong>admin123</strong></p>
        </div>
    `;
}

function attachAdminLoginEvents() {
    const adminBtn = document.getElementById("adminLoginBtn");
    if (!adminBtn) return;
    
    adminBtn.onclick = () => {
        const pass = document.getElementById("adminPass").value;
        if (pass === "admin123") {
            adminLogged = true;
            sessionStorage.setItem("adminLogged", "true");
            currentLoggedStudent = null;
            sessionStorage.removeItem("loggedStudent");
            renderApp();
        } else {
            document.getElementById("adminMsg").innerText = "❌ Wrong admin password";
        }
    };
}

// ADMIN PANEL
function renderAdminPanel() {
    let html = `
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2>👑 Admin Dashboard</h2>
                <button id="adminLogoutBtn" style="background:#ef4444;">🚪 Logout Admin</button>
            </div>
            <div style="overflow-x:auto; margin-top:20px;">
                <table class="admin-table">
                    <thead>
                        <tr><th>Reg No</th><th>Image</th><th>Full Name</th><th>Email</th><th>Level</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
    `;
    
    students.forEach((s, idx) => {
        html += `
            <tr>
                <td><strong>${s.regNumber}</strong></td>
                <td><img src="${s.image}" width="45" style="border-radius:50%; object-fit:cover;"></td>
                <td>${s.firstName} ${s.lastName}</td>
                <td>${s.email}</td>
                <td>Level ${s.level}</td>
                <td>${s.isBlocked ? "<span class='badge-blocked'>⛔ BLOCKED</span>" : "✅ Active"}</td>
                <td>
                    <button class="adminEditBtn" data-idx="${idx}" style="background:#f59e0b; margin:2px;">✏️ Edit</button>
                    <button class="adminChangePassBtn" data-idx="${idx}" style="background:#3b82f6; margin:2px;">🔑 Pass</button>
                    <button class="adminBlockBtn" data-idx="${idx}" style="background:${s.isBlocked ? '#10b981' : '#ef4444'}; margin:2px;">${s.isBlocked ? "Unblock" : "🚫 Block"}</button>
                    <button class="adminDeleteBtn" data-idx="${idx}" style="background:#6b7280; margin:2px;">🗑️ Delete</button>
                </td>
            </tr>
        `;
    });
    
    if(students.length === 0) {
        html += `<tr><td colspan="7" style="text-align:center;">No students registered yet</td></tr>`;
    }
    
    html += `</tbody></table></div></div>`;
    return html;
}

function attachAdminEvents() {
    const logoutBtn = document.getElementById("adminLogoutBtn");
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            adminLogged = false;
            sessionStorage.removeItem("adminLogged");
            renderApp();
        };
    }
    
    document.querySelectorAll(".adminEditBtn").forEach(btn => {
        btn.onclick = () => {
            const idx = btn.getAttribute("data-idx");
            const newName = prompt("Enter new First Name:", students[idx].firstName);
            if (newName) {
                students[idx].firstName = newName;
                saveStudents();
                renderApp();
            }
        };
    });
    
    document.querySelectorAll(".adminChangePassBtn").forEach(btn => {
        btn.onclick = () => {
            const idx = btn.getAttribute("data-idx");
            const newPass = prompt("Enter new password for " + students[idx].firstName);
            if (newPass) {
                students[idx].password = newPass;
                saveStudents();
                alert(`✅ Password changed! New password sent to ${students[idx].email} (Demo)`);
                console.log(`📧 Email to ${students[idx].email}: New password = ${newPass}`);
                renderApp();
            }
        };
    });
    
    document.querySelectorAll(".adminBlockBtn").forEach(btn => {
        btn.onclick = () => {
            const idx = btn.getAttribute("data-idx");
            students[idx].isBlocked = !students[idx].isBlocked;
            saveStudents();
            renderApp();
        };
    });
    
    document.querySelectorAll(".adminDeleteBtn").forEach(btn => {
        btn.onclick = () => {
            const idx = btn.getAttribute("data-idx");
            if (confirm(`Delete student ${students[idx].firstName} ${students[idx].lastName}?`)) {
                students.splice(idx, 1);
                saveStudents();
                renderApp();
            }
        };
    });
}

// STUDENT CONTENT (Dashboard)
function renderStudentContent(section) {
    const student = currentLoggedStudent;
    if (!student) return "<div class='card'>Please login first</div>";
    
    if (section === "home") {
        return `
            <div class="card">
                <h2>🏠 Welcome, ${student.firstName} ${student.lastName}!</h2>
                <p>📌 Reg Number: <strong>${student.regNumber}</strong> | Level: ${student.level}</p>
                <p>📧 ${student.email}</p>
                <hr style="margin:20px 0;">
                <button id="viewProfileBtn" style="background:#10b981;">👤 View Full Profile</button>
            </div>
        `;
    }
    
    if (section === "profile") {
        return `
            <div class="card">
                <h2>👤 My Profile</h2>
                <div style="display:flex; gap:20px; flex-wrap:wrap;">
                    <img src="${student.image}" width="120" style="border-radius:50%;">
                    <div>
                        <p><strong>🆔 Reg Number:</strong> ${student.regNumber}</p>
                        <p><strong>📛 First Name:</strong> ${student.firstName}</p>
                        <p><strong>📛 Second Name:</strong> ${student.secondName || "-"}</p>
                        <p><strong>📛 Last Name:</strong> ${student.lastName}</p>
                        <p><strong>📞 Phone:</strong> ${student.phone || "-"}</p>
                        <p><strong>📧 Email:</strong> ${student.email}</p>
                        <p><strong>🎓 Level:</strong> ${student.level}</p>
                    </div>
                </div>
                <div style="margin-top:20px;">
                    <button id="editProfileBtn" style="background:#f59e0b;">✏️ Edit Profile</button>
                    <button id="changePassStudentBtn" style="background:#3b82f6;">🔑 Change Password</button>
                </div>
            </div>
        `;
    }
    
    if (section === "account") {
        return `
            <div class="card">
                <h2>🛡️ Account Status</h2>
                <p>✅ Status: <strong>${student.isBlocked ? "⛔ BLOCKED" : "Active ✅"}</strong></p>
                <p>🔐 Last Login: Today at ${new Date().toLocaleTimeString()}</p>
                <p>📅 Registration Date: ${new Date().toDateString()}</p>
            </div>
        `;
    }
    
    if (section === "results") {
        return `
            <div class="card">
                <h2>📊 Semester Results</h2>
                <table class="admin-table">
                    <tr><th>Semester</th><th>GPA</th><th>Grade</th></tr>
                    <tr><td>Semester 1</td><td>${student.results?.semester1 || "3.8"}</td><td>B+</td></tr>
                    <tr><td>Semester 2</td><td>${student.results?.semester2 || "3.9"}</td><td>A-</td></tr>
                </table>
            </div>
        `;
    }
    
    if (section === "payments") {
        return `
            <div class="card">
                <h2>💰 Financial Payments</h2>
                <p>${student.payments || "✅ All fees paid. No outstanding balance."}</p>
                <hr>
                <p>Tuition: Fully Cleared</p>
                <p>Library Fee: Paid</p>
            </div>
        `;
    }
    
    return `<div class="card">Page not found</div>`;
}

function attachStudentSidebarEvents() {
    const toggleBtn = document.getElementById("menuToggleBtn");
    const sidebar = document.getElementById("studentSidebar");
    const closeBtn = document.getElementById("closeSidebarBtn");
    
    if (toggleBtn) {
        toggleBtn.onclick = () => sidebar.classList.add("open");
    }
    if (closeBtn) {
        closeBtn.onclick = () => sidebar.classList.remove("open");
    }
    
    document.querySelectorAll(".side-nav-btn").forEach(btn => {
        btn.onclick = (e) => {
            document.querySelectorAll(".side-nav-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const nav = btn.getAttribute("data-student-nav");
            const container = document.getElementById("pageContainer");
            container.innerHTML = renderStudentContent(nav);
            attachStudentDynamicButtons();
            sidebar.classList.remove("open");
        };
    });
    
    const logoutStudent = document.getElementById("studentLogoutBtn");
    if (logoutStudent) {
        logoutStudent.onclick = () => {
            currentLoggedStudent = null;
            sessionStorage.removeItem("loggedStudent");
            renderApp();
        };
    }
    
    attachStudentDynamicButtons();
}

function attachStudentDynamicButtons() {
    const editBtn = document.getElementById("editProfileBtn");
    if (editBtn) {
        editBtn.onclick = () => {
            const newFirstName = prompt("New First Name:", currentLoggedStudent.firstName);
            if (newFirstName) currentLoggedStudent.firstName = newFirstName;
            
            const newEmail = prompt("New Email (must be @gmail.com):", currentLoggedStudent.email);
            if (newEmail && newEmail.includes("@gmail.com")) currentLoggedStudent.email = newEmail;
            
            const newPhone = prompt("New Phone:", currentLoggedStudent.phone);
            if (newPhone) currentLoggedStudent.phone = newPhone;
            
            const idx = students.findIndex(s => s.regNumber === currentLoggedStudent.regNumber);
            if (idx !== -1) {
                students[idx] = currentLoggedStudent;
                saveStudents();
                sessionStorage.setItem("loggedStudent", JSON.stringify(currentLoggedStudent));
            }
            renderApp();
            alert("✅ Profile updated!");
        };
    }
    
    const changePassBtn = document.getElementById("changePassStudentBtn");
    if (changePassBtn) {
        changePassBtn.onclick = () => {
            const oldPass = prompt("Enter current password:");
            if (oldPass === currentLoggedStudent.password) {
                const newPass = prompt("Enter new password:");
                if (newPass) {
                    currentLoggedStudent.password = newPass;
                    const idx = students.findIndex(s => s.regNumber === currentLoggedStudent.regNumber);
                    if (idx !== -1) {
                        students[idx] = currentLoggedStudent;
                        saveStudents();
                        sessionStorage.setItem("loggedStudent", JSON.stringify(currentLoggedStudent));
                        alert("✅ Password changed successfully!");
                        renderApp();
                    }
                }
            } else {
                alert("❌ Wrong current password!");
            }
        };
    }
    
    const viewProfileBtn = document.getElementById("viewProfileBtn");
    if (viewProfileBtn) {
        viewProfileBtn.onclick = () => {
            const profileBtn = document.querySelector(".side-nav-btn[data-student-nav='profile']");
            if (profileBtn) profileBtn.click();
        };
    }
}

// INITIAL RENDER
renderApp();
