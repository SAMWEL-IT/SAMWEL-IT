// ---------- DATA STORAGE ----------
let students = JSON.parse(localStorage.getItem("students")) || [];
let currentLoggedStudent = JSON.parse(sessionStorage.getItem("loggedStudent")) || null;
let adminLogged = sessionStorage.getItem("adminLogged") === "true";

// Helper: Save students to localStorage
function saveStudents() {
    localStorage.setItem("students", JSON.stringify(students));
}

// Helper: generate Reg Number (e.g., SMT/2025/0001)
function generateRegNumber() {
    let lastId = 0;
    students.forEach(s => {
        let num = parseInt(s.regNumber.split("/")[2]);
        if(num > lastId) lastId = num;
    });
    let newNum = (lastId + 1).toString().padStart(4,"0");
    return `SMT/2025/${newNum}`;
}

// Render App (view router)
function renderApp() {
    const container = document.getElementById("pageContainer");
    const topBar = document.getElementById("topBar");
    const sidebar = document.getElementById("studentSidebar");
    const menuToggle = document.getElementById("menuToggleBtn");

    if(adminLogged) {
        // Admin View
        topBar.style.display = "flex";
        if(menuToggle) menuToggle.style.display = "none";
        sidebar.classList.remove("open");
        container.innerHTML = renderAdminPanel();
        attachAdminEvents();
    } 
    else if(currentLoggedStudent) {
        // Student logged in
        topBar.style.display = "flex";
        if(menuToggle) menuToggle.style.display = "block";
        // load student dashboard content (default home)
        const activeNav = document.querySelector(".side-nav-btn.active")?.getAttribute("data-student-nav") || "home";
        renderStudentContent(activeNav);
        attachStudentSidebarEvents();
    } 
    else {
        // Not logged in → show Homepage & Auth options
        topBar.style.display = "none";
        sidebar.classList.remove("open");
        container.innerHTML = renderHomepage();
        attachHomepageEvents();
    }
}

// ---------- HOMEPAGE (Welcome + Buttons to Register/Login) ----------
function renderHomepage() {
    return `
        <div class="card" style="text-align:center;">
            <h1>🎓 Welcome to Smart Student Portal</h1>
            <p style="margin:20px 0;">Advanced system for students & admin management</p>
            <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                <button id="goToRegisterBtn" style="background:#10b981;">📝 Register New Student</button>
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
    if(regBtn) regBtn.onclick = () => { containerDiv.innerHTML = renderRegisterForm(); attachRegisterEvents(); };
    if(loginBtn) loginBtn.onclick = () => { containerDiv.innerHTML = renderStudentLoginForm(); attachStudentLoginEvents(); };
    if(adminBtn) adminBtn.onclick = () => { containerDiv.innerHTML = renderAdminLoginForm(); attachAdminLoginEvents(); };
}

// REGISTER FORM
function renderRegisterForm() {
    return `
        <div class="card">
            <h2>Student Registration</h2>
            <div class="form-grid">
                <div class="input-group"><label>Profile Image URL</label><input type="text" id="regImage" placeholder="https://randomuser.me/api/portraits/women/1.jpg"></div>
                <div class="input-group"><label>First Name</label><input id="regFname" placeholder="John"></div>
                <div class="input-group"><label>Second Name</label><input id="regSname" placeholder="Michael"></div>
                <div class="input-group"><label>Last Name</label><input id="regLname" placeholder="Doe"></div>
                <div class="input-group"><label>Phone</label><input id="regPhone" placeholder="+255712345678"></div>
                <div class="input-group"><label>Email (Google)</label><input id="regEmail" placeholder="student@gmail.com"></div>
                <div class="input-group"><label>Course Level (4-9)</label><select id="regLevel"><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option></select></div>
            </div>
            <button id="registerBtn">Register & Get Reg Number</button>
            <p id="regResult"></p>
        </div>
    `;
}

function attachRegisterEvents() {
    document.getElementById("registerBtn").onclick = () => {
        const image = document.getElementById("regImage").value || "https://randomuser.me/api/portraits/men/1.jpg";
        const fname = document.getElementById("regFname").value.trim();
        const sname = document.getElementById("regSname").value.trim();
        const lname = document.getElementById("regLname").value.trim();
        const phone = document.getElementById("regPhone").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const level = document.getElementById("regLevel").value;
        if(!fname || !lname || !email || !email.includes("@gmail.com")) {
            document.getElementById("regResult").innerText = "Error: Valid Gmail required!";
            return;
        }
        const newReg = generateRegNumber();
        const defaultPass = "pass123";
        const newStudent = {
            regNumber: newReg,
            password: defaultPass,
            firstName: fname, secondName: sname, lastName: lname,
            phone, email, level, image,
            isBlocked: false,
            results: { semester1: "GPA 3.8", semester2: "GPA 3.9" },
            payments: "Fully Paid - No Arrears"
        };
        students.push(newStudent);
        saveStudents();
        document.getElementById("regResult").innerHTML = `✅ Registered! Your Reg Number: <strong>${newReg}</strong><br>Default Password: ${defaultPass}<br><button id='gotoLoginAfterReg'>Go to Login</button>`;
        const gotoBtn = document.getElementById("gotoLoginAfterReg");
        if(gotoBtn) gotoBtn.onclick = () => { document.getElementById("authFormsContainer").innerHTML = renderStudentLoginForm(); attachStudentLoginEvents(); };
    };
}

// STUDENT LOGIN
function renderStudentLoginForm() {
    return `<div class="card"><h2>Student Login</h2><input id="loginReg" placeholder="Reg Number e.g SMT/2025/0001"><input id="loginPass" type="password" placeholder="Password"><button id="doStudentLogin">Login</button><p id="loginMsg"></p><button id="forgotPassBtn">Forgot Password?</button></div>`;
}
function attachStudentLoginEvents() {
    document.getElementById("doStudentLogin").onclick = () => {
        const reg = document.getElementById("loginReg").value;
        const pass = document.getElementById("loginPass").value;
        const student = students.find(s => s.regNumber === reg && s.password === pass && !s.isBlocked);
        if(student) {
            currentLoggedStudent = student;
            sessionStorage.setItem("loggedStudent", JSON.stringify(student));
            adminLogged = false;
            sessionStorage.removeItem("adminLogged");
            renderApp();
        } else {
            document.getElementById("loginMsg").innerText = "Invalid or blocked account";
        }
    };
    document.getElementById("forgotPassBtn").onclick = () => {
        const reg = document.getElementById("loginReg").value;
        const student = students.find(s => s.regNumber === reg);
        if(student && student.email) {
            const newPass = Math.random().toString(36).slice(2,8);
            student.password = newPass;
            saveStudents();
            alert(`System sent new password to ${student.email} (SIMULATION: new pass = ${newPass})`);
            console.log(`📧 Email to ${student.email}: Your new password is ${newPass}`);
        } else alert("Reg number not found");
    };
}

// ADMIN LOGIN
function renderAdminLoginForm() {
    return `<div class="card"><h2>Admin Login</h2><input id="adminPass" type="password" placeholder="Admin Password"><button id="adminLoginBtn">Login as Admin</button><p id="adminMsg"></p></div>`;
}
function attachAdminLoginEvents() {
    document.getElementById("adminLoginBtn").onclick = () => {
        const pass = document.getElementById("adminPass").value;
        if(pass === "admin123") {
            adminLogged = true;
            sessionStorage.setItem("adminLogged","true");
            currentLoggedStudent = null;
            sessionStorage.removeItem("loggedStudent");
            renderApp();
        } else document.getElementById("adminMsg").innerText = "Wrong admin password";
    };
}

// ADMIN PANEL (view all students, edit, delete, block, change password)
function renderAdminPanel() {
    let html = `<div class="card"><h2>Admin Dashboard - All Students</h2><button id="adminLogoutBtn">Logout Admin</button><div style="overflow-x:auto;"><table class="admin-table"><tr><th>Reg No</th><th>Image</th><th>Name</th><th>Email</th><th>Level</th><th>Status</th><th>Actions</th></tr>`;
    students.forEach((s,idx) => {
        html += `<tr>
            <td>${s.regNumber}</td>
            <td><img src="${s.image}" width="40" style="border-radius:50%"></td>
            <td>${s.firstName} ${s.lastName}</td>
            <td>${s.email}</td>
            <td>${s.level}</td>
            <td>${s.isBlocked ? "<span class='badge-blocked'>BLOCKED</span>" : "Active"}</td>
            <td>
                <button class="adminEditBtn" data-idx="${idx}">Edit Name</button>
                <button class="adminChangePassBtn" data-idx="${idx}">Change Pass</button>
                <button class="adminBlockBtn" data-idx="${idx}">${s.isBlocked ? "Unblock" : "Block"}</button>
                <button class="adminDeleteBtn" data-idx="${idx}">Delete</button>
            </td>
        </tr>`;
    });
    html += `</table></div></div>`;
    return html;
}

function attachAdminEvents() {
    document.getElementById("adminLogoutBtn")?.addEventListener("click",()=>{
        adminLogged=false; sessionStorage.removeItem("adminLogged"); renderApp();
    });
    document.querySelectorAll(".adminEditBtn").forEach(btn=>{
        btn.onclick = ()=>{
            let idx = btn.getAttribute("data-idx");
            let newName = prompt("New First Name:", students[idx].firstName);
            if(newName) students[idx].firstName = newName;
            saveStudents(); renderApp();
        };
    });
    document.querySelectorAll(".adminChangePassBtn").forEach(btn=>{
        btn.onclick = ()=>{
            let idx = btn.getAttribute("data-idx");
            let newPass = prompt("New password for student");
            if(newPass) {
                students[idx].password = newPass;
                saveStudents();
                alert(`New password sent to student email: ${students[idx].email} (Simulation)`);
                console.log(`Email to ${students[idx].email}: new pass = ${newPass}`);
                renderApp();
            }
        };
    });
    document.querySelectorAll(".adminBlockBtn").forEach(btn=>{
        btn.onclick = ()=>{
            let idx = btn.getAttribute("data-idx");
            students[idx].isBlocked = !students[idx].isBlocked;
            saveStudents(); renderApp();
        };
    });
    document.querySelectorAll(".adminDeleteBtn").forEach(btn=>{
        btn.onclick = ()=>{
            if(confirm("Delete student?")){
                students.splice(btn.getAttribute("data-idx"),1);
                saveStudents(); renderApp();
            }
        };
    });
}

// STUDENT PROFILE & DASHBOARD
function renderStudentContent(section) {
    const student = currentLoggedStudent;
    if(!student) return "<div>Please login</div>";
    if(section === "home") {
        return `<div class="card"><h2>Welcome ${student.firstName} ${student.lastName}</h2><p>Reg: ${student.regNumber} | Level: ${student.level}</p><button id="viewProfileBtn">Go to Profile</button></div>`;
    }
    if(section === "profile") {
        return `<div class="card"><h2>My Profile</h2><img src="${student.image}" width="100" style="border-radius:50%"><p><strong>Reg:</strong> ${student.regNumber}</p><p><strong>Names:</strong> ${student.firstName} ${student.secondName} ${student.lastName}</p><p><strong>Email:</strong> ${student.email}</p><p><strong>Phone:</strong> ${student.phone}</p><button id="editProfileBtn">Edit Profile</button><button id="changePassStudentBtn">Change Password</button></div>`;
    }
    if(section === "account") {
        return `<div class="card"><h2>Account Status</h2><p>✅ Account: ${student.isBlocked ? "Blocked ❌" : "Active ✅"}</p><p>Last Login: Today</p></div>`;
    }
    if(section === "results") {
        return `<div class="card"><h2>Academic Results</h2><table class="admin-table"><tr><th>Semester 1</th><td>${student.results?.semester1 || "3.7"}</td></tr><tr><th>Semester 2</th><td>${student.results?.semester2 || "3.9"}</td></tr></table></div>`;
    }
    if(section === "payments") {
        return `<div class="card"><h2>Financial Payments</h2><p>💰 Status: ${student.payments || "Up to date"}</p><p>No outstanding fee</p></div>`;
    }
    return `<div>Dashboard</div>`;
}

function attachStudentSidebarEvents() {
    const toggleBtn = document.getElementById("menuToggleBtn");
    const sidebar = document.getElementById("studentSidebar");
    const closeBtn = document.getElementById("closeSidebarBtn");
    if(toggleBtn) toggleBtn.onclick = () => sidebar.classList.toggle("open");
    if(closeBtn) closeBtn.onclick = () => sidebar.classList.remove("open");
    document.querySelectorAll(".side-nav-btn").forEach(btn=>{
        btn.onclick = (e)=>{
            document.querySelectorAll(".side-nav-btn").forEach(b=>b.classList.remove("active"));
            btn.classList.add("active");
            let nav = btn.getAttribute("data-student-nav");
            renderStudentContent(nav);
            const container = document.getElementById("pageContainer");
            container.innerHTML = renderStudentContent(nav);
            attachStudentDynamicButtons();
            sidebar.classList.remove("open");
        };
    });
    document.getElementById("studentLogoutBtn")?.addEventListener("click",()=>{
        currentLoggedStudent=null;
        sessionStorage.removeItem("loggedStudent");
        renderApp();
    });
    attachStudentDynamicButtons();
}

function attachStudentDynamicButtons() {
    const editBtn = document.getElementById("editProfileBtn");
    if(editBtn) editBtn.onclick = ()=>{
        let newFirstName = prompt("New First Name:", currentLoggedStudent.firstName);
        if(newFirstName) currentLoggedStudent.firstName = newFirstName;
        let newEmail = prompt("New Email (Gmail):", currentLoggedStudent.email);
        if(newEmail && newEmail.includes("@gmail.com")) currentLoggedStudent.email = newEmail;
        let index = students.findIndex(s=>s.regNumber === currentLoggedStudent.regNumber);
        if(index!==-1) students[index] = currentLoggedStudent;
        saveStudents();
        sessionStorage.setItem("loggedStudent", JSON.stringify(currentLoggedStudent));
        renderApp();
    };
    const changePass = document.getElementById("changePassStudentBtn");
    if(changePass) changePass.onclick = ()=>{
        let old = prompt("Current password:");
        if(old === currentLoggedStudent.password){
            let newp = prompt("New password:");
            if(newp){
                currentLoggedStudent.password = newp;
                let idx=students.findIndex(s=>s.regNumber===currentLoggedStudent.regNumber);
                students[idx]=currentLoggedStudent;
                saveStudents();
                sessionStorage.setItem("loggedStudent",JSON.stringify(currentLoggedStudent));
                alert("Password changed");
                renderApp();
            }
        } else alert("Wrong current password");
    };
    const viewProf = document.getElementById("viewProfileBtn");
    if(viewProf) viewProf.onclick = ()=>{
        document.querySelector(".side-nav-btn[data-student-nav='profile']").click();
    };
}

// Initialize Render
renderApp();