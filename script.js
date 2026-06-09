/* ==========================================
   STATE MANAGEMENT SYSTEM (In-Memory Database)
   ========================================== */
let studentsDatabase = [];
let activeSessionStudent = null;
const MASTER_ADMIN_KEY = "admin123"; // Nenosiri la Jopo la Admin

// Auto-inject mock student data on initial pipeline load for presentation
window.addEventListener('DOMContentLoaded', () => {
    studentsDatabase = [
        {
            regNum: "SAM-IT-2026-0811",
            firstName: "Samwel",
            secondName: "Kelvin",
            lastName: "Yohana",
            phone: "0712345678",
            email: "samwel.it@gmail.com",
            level: "Level 8",
            password: "user123",
            avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80",
            status: "Active"
        }
    ];
});

/* ==========================================
   APP ROUTER (Inasimamia Kubadili Kurasa)
   ========================================== */
function navigateTo(pageId) {
    // Ficha kurasa zote
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    // Onyesha ukurasa uliokusudiwa
    const activePage = document.getElementById(`page-${pageId}`);
    if (activePage) activePage.classList.add('active');

    // Weka alama ya active link kwenye topbar links
    document.querySelectorAll('.nav-item').forEach(link => {
        link.classList.remove('active');
        if(link.getAttribute('onclick').includes(pageId)) {
            link.classList.add('active');
        }
    });
}

// Hamburger Display Controller
function toggleSidebar() {
    const sidebar = document.getElementById('appSidebar');
    sidebar.classList.toggle('open');
}

/* ==========================================
   REGISTRATION MODULE (Mifumo ya Udahili)
   ========================================== */
let temporaryAvatarDataUrl = "https://via.placeholder.com/150";

function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const preview = document.getElementById('avatarPreview');
        preview.innerHTML = `<img src="${reader.result}" alt="Preview">`;
        temporaryAvatarDataUrl = reader.result; // Dynamic base64 parsing
    }
    reader.readAsDataURL(event.target.files[0]);
}

function executeRegistration(event) {
    event.preventDefault();
    
    const email = document.getElementById('regEmail').value.trim();
    
    // Strict Validation: Lazima iwe Gmail iliyothibitishwa
    if (!email.endsWith("@gmail.com")) {
        alert("Security Rejection: You must supply a valid verified Google account (@gmail.com).");
        return;
    }

    // Auto generate a unique university key index
    const randomizedSuffix = Math.floor(1000 + Math.random() * 9000);
    const registrationNumber = `SAM-IT-2026-${randomizedSuffix}`;
    
    // Auto generate high entropy alphanumeric random password
    const generatedPassword = Math.random().toString(36).slice(-6);

    const newStudent = {
        regNum: registrationNumber,
        firstName: document.getElementById('regFirst').value.trim(),
        secondName: document.getElementById('regSecond').value.trim(),
        lastName: document.getElementById('regLast').value.trim(),
        phone: document.getElementById('regPhone').value.trim(),
        email: email,
        level: document.getElementById('regLevel').value,
        password: generatedPassword,
        avatar: temporaryAvatarDataUrl,
        status: "Active"
    };

    studentsDatabase.push(newStudent);

    // Dynamic Display Overlay Manipulation (display none override via absolute execution)
    document.getElementById('generatedRegNum').innerText = registrationNumber;
    document.getElementById('regSuccessModal').classList.remove('hidden');

    // SMTP Simulation Alert
    console.log(`[SMTP SIMULATOR] Outgoing dispatch to ${email}: Welcome! Use password: ${generatedPassword}`);
    alert(`[System Notice] Automated core transmission sent credentials to: ${email}`);
}

function proceedToLogin() {
    document.getElementById('regSuccessModal').classList.add('hidden');
    document.getElementById('registrationForm').reset();
    document.getElementById('avatarPreview').innerHTML = `<i class="fa-solid fa-camera"></i><span>Upload Profile Image</span>`;
    navigateTo('login');
}

/* ==========================================
   AUTHENTICATION MODULE (Uthibitisho)
   ========================================== */
function executeStudentLogin(event) {
    event.preventDefault();
    const regIn = document.getElementById('loginReg').value.trim();
    const passIn = document.getElementById('loginPass').value.trim();

    const student = studentsDatabase.find(s => s.regNum === regIn && s.password === passIn);

    if (!student) {
        alert("Security Error: Invalid system index key or password mismatch.");
        return;
    }

    if (student.status === "Blocked") {
        alert("Terminal Access Denied: This account has been Suspended/Blocked by the Administration.");
        return;
    }

    // Mount structural payload data into system memory session
    activeSessionStudent = student;
    mountStudentWorkspace();
    navigateTo('profile');
}

function executeAdminLogin(event) {
    event.preventDefault();
    const key = document.getElementById('adminPass').value;

    if (key !== MASTER_ADMIN_KEY) {
        alert("Access Refused: Critical security authentication breach.");
        return;
    }

    renderAdminDatabase();
    navigateTo('admin-dashboard');
}

function triggerForgotPassword() {
    const targetReg = prompt("Enter your Registration Number to trigger autonomous email override:");
    if (!targetReg) return;

    const student = studentsDatabase.find(s => s.regNum === targetReg.trim());
    if (!student) {
        alert("Record query empty.");
        return;
    }

    const temporaryPass = Math.random().toString(36).slice(-6);
    student.password = temporaryPass;
    
    console.log(`[SMTP API OVR] Resent password to ${student.email}: ${temporaryPass}`);
    alert(`Security Notice: Automated account recovery system dispatched new password to ${student.email}`);
}

/* ==========================================
   STUDENT CENTER SYSTEM (Jopo la Mwanafunzi)
   ========================================== */
function mountStudentWorkspace() {
    if (!activeSessionStudent) return;

    // Direct interface data mapping
    document.getElementById('profileCardImg').src = activeSessionStudent.avatar;
    document.getElementById('profileCardName').innerText = `${activeSessionStudent.firstName} ${activeSessionStudent.lastName}`;
    document.getElementById('profileCardReg').innerText = activeSessionStudent.regNum;

    // Load form values
    document.getElementById('selfFirst').value = activeSessionStudent.firstName;
    document.getElementById('selfLast').value = activeSessionStudent.lastName;
    document.getElementById('selfEmail').value = activeSessionStudent.email;
    document.getElementById('selfReg').value = activeSessionStudent.regNum;

    const statusBanner = document.getElementById('accountStatusBanner');
    statusBanner.innerText = `Status Ecosystem: ${activeSessionStudent.status}`;
    statusBanner.className = activeSessionStudent.status === "Active" ? "account-status-banner" : "account-status-banner txt-red";
}

function switchProfileTab(event, tabId) {
    document.querySelectorAll('.profile-tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.p-tab').forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

function executeStudentSelfUpdate(event) {
    event.preventDefault();
    if (!activeSessionStudent) return;

    activeSessionStudent.firstName = document.getElementById('selfFirst').value.trim();
    activeSessionStudent.lastName = document.getElementById('selfLast').value.trim();
    activeSessionStudent.email = document.getElementById('selfEmail').value.trim();

    mountStudentWorkspace();
    alert("System Data Synchronization Complete.");
}

// BADILISHA KAZI HII KWENYE SCRIPT.JS YAKO
function executeRegistration(event) {
    event.preventDefault();
    
    const email = document.getElementById('regEmail').value.trim();
    const passwordInput = document.getElementById('regPassword').value; // Inasoma password mpya
    
    // Strict Validation: Lazima iwe Gmail iliyothibitishwa
    if (!email.endsWith("@gmail.com")) {
        alert("Security Rejection: You must supply a valid verified Google account (@gmail.com).");
        return;
    }

    if (passwordInput.length < 6) {
        alert("Security risk: Password must be at least 6 characters long.");
        return;
    }

    // Auto generate a unique university key index
    const randomizedSuffix = Math.floor(1000 + Math.random() * 9000);
    const registrationNumber = `02.${randomizedSuffix}.01.03.2026`;

    const newStudent = {
        regNum: registrationNumber,
        firstName: document.getElementById('regFirst').value.trim(),
        secondName: document.getElementById('regSecond').value.trim(),
        lastName: document.getElementById('regLast').value.trim(),
        phone: document.getElementById('regPhone').value.trim(),
        email: email,
        level: document.getElementById('regLevel').value,
        password: passwordInput, // Hapa inahifadhi password aliyochagua mwanafunzi
        avatar: temporaryAvatarDataUrl,
        status: "Active"
    };

    studentsDatabase.push(newStudent);

    // Dynamic Display Overlay Manipulation
    document.getElementById('generatedRegNum').innerText = registrationNumber;
    document.getElementById('regSuccessModal').classList.remove('hidden');

    // SMTP Simulation Alert
    console.log(`[SMTP SIMULATOR] Registration Successful for ${email}. Access Granted with chosen password.`);
    alert(`[System Notice] Welcome to SAMWEL-IT! Your Reg Number is generated. Please memorize it.`);
}


/* ==========================================
   ADMIN INSTRUMENTATION (Jopo la Udhibiti)
   ========================================== */
function renderAdminDatabase() {
    const tbody = document.getElementById('adminStudentTableBody');
    tbody.innerHTML = "";

    studentsDatabase.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img class="td-avatar" src="${student.avatar}"></td>
            <td><strong>${student.regNum}</strong></td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.email}</td>
            <td>${student.level}</td>
            <td><span class="${student.status === 'Active' ? 'txt-green' : 'txt-red'}">${student.status}</span></td>
            <td>
                <button class="btn btn-outline" style="padding:4px 8px; font-size:12px;" onclick="openAdminEditModal('${student.regNum}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-outline" style="padding:4px 8px; font-size:12px; color:orange;" onclick="toggleBlockStudent('${student.regNum}')"><i class="fa-solid fa-ban"></i></button>
                <button class="btn btn-danger" style="padding:4px 8px; font-size:12px;" onclick="adminPurgeStudent('${student.regNum}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openAdminEditModal(regNum) {
    const student = studentsDatabase.find(s => s.regNum === regNum);
    if (!student) return;

    document.getElementById('editTargetReg').value = student.regNum;
    document.getElementById('editFirst').value = student.firstName;
    document.getElementById('editLast').value = student.lastName;
    document.getElementById('editPassword').value = student.password;

    document.getElementById('adminEditModal').classList.remove('hidden');
}

function closeAdminModal() {
    document.getElementById('adminEditModal').classList.add('hidden');
}

function saveAdminEdits() {
    const reg = document.getElementById('editTargetReg').value;
    const student = studentsDatabase.find(s => s.regNum === reg);

    if (student) {
        student.firstName = document.getElementById('editFirst').value.trim();
        student.lastName = document.getElementById('editLast').value.trim();
        
        const oldPass = student.password;
        const newPass = document.getElementById('editPassword').value.trim();
        
        if (newPass && oldPass !== newPass) {
            student.password = newPass;
            console.log(`[ADMIN SMTP RE-ROUTE] Auto-dispatching forced administrative password rewrite to ${student.email}: ${newPass}`);
            alert(`Administrative notification dispatched to ${student.email} containing updated encrypted keys.`);
        }
    }

    closeAdminModal();
    renderAdminDatabase();
}

function toggleBlockStudent(regNum) {
    const student = studentsDatabase.find(s => s.regNum === regNum);
    if (student) {
        student.status = student.status === "Active" ? "Blocked" : "Active";
        alert(`Account state update configured to: ${student.status}`);
        renderAdminDatabase();
    }
}

function adminPurgeStudent(regNum) {
    if (confirm("Execute destructive clear? This will wipe the student data completely.")) {
        studentsDatabase = studentsDatabase.filter(s => s.regNum !== regNum);
        renderAdminDatabase();
    }
}

/* ==========================================
   SESSION LIFECYCLE TERMINATION
   ========================================== */
function logout() {
    activeSessionStudent = null;
    document.getElementById('loginReg').value = "";
    document.getElementById('loginPass').value = "";
    document.getElementById('adminPass').value = "";
    navigateTo('home');
    alert("Session destroyed successfully.");
}



// ========================================================
// CBE-STYLE SLIDER ENGINE FOR SAMWEL-IT (FIXED NO-DOTS)
// ========================================================

const sliderData = [

    {
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200",
        title: "Collaborative Student Network Hubs",
        desc: "Teamwork and agile development methods in action. Our students build distributed databases and modern web ecosystems cooperatively."
    },
    {
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200",
        title: "Verified User Portal Management Access",
        desc: "Secure end-to-end user experience encryption. Access financial ledger logs, academic progress tracking grids, and profile metadata instantly."
    },
    {
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200",
        title: "Digital Learning & Modern IT Infrastructure",
        desc: "Bridging technology gaps with top-tier academic portals. Secure registration mapping for NTA Level 4 to 9 is currently live for 2026."
    },
    {
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200",
        title: "Advanced Computer Programming Environment",
        desc: "Students gaining hands-on coding experience in full-stack architecture, utilizing cloud platforms and sandbox systems inside our Mwanza campus labs."
    },
    {
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200",
        title: "Collaborative Student Network Hubs",
        desc: "Teamwork and agile development methods in action. Our students build distributed databases and modern web ecosystems cooperatively."
    },
    {
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200",
        title: "Verified User Portal Management Access",
        desc: "Secure end-to-end user experience encryption. Access financial ledger logs, academic progress tracking grids, and profile metadata instantly."
    },
    {
        // HAPA NDIO PICHA MPYA YA UBUNIFU (INNOVATION & FUTURE TECH) INAPOWEKWA
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200",
        title: "SAMWEL-IT Innovation Lab & Creativity",
        desc: "Exploring futuristic technology, artificial intelligence matrix pipelines, and innovative web ecosystems to solve complex real-world computing challenges."
    },




    {
        image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1200",
        title: "Inter-University Coding Competition Success",
        desc: "SAMWEL-IT students emerge victorious in the national software development showcase, securing premium incubation grants."
    },
    {
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200",
        title: "Admissions Now Open for Academic Year 2026/2027",
        desc: "Secure your future in computing science. Register your verified Google account inside our secure dynamic web portal session today."
    }
];

let currentSlideIndex = 0;
let sliderTimer = null;

function initializeCbeSlider() {
    const wrapper = document.getElementById('heroSliderWrapper');
    if (!wrapper) return;

    wrapper.innerHTML = "";

    sliderData.forEach((slide, index) => {
        // Tumebadilisha darasa hapa kuwa 'slide-visible' badala ya active ili picha ya kwanza ionekane
        const slideHtml = `
            <div class="slide-item ${index === 0 ? 'slide-visible' : ''}" id="slide-${index}">
                <img src="${slide.image}" alt="${slide.title}">
                <div class="slide-overlay"></div>
                <div class="slide-content">
                    <h2>${slide.title}</h2>
                    <p>${slide.desc}</p>
                </div>
            </div>
        `;
        wrapper.insertAdjacentHTML('beforeend', slideHtml);
    });

    startSliderAutoCycle();
}

function moveSlider(direction) {
    resetSliderTimer();
    
    const currentSlide = document.getElementById(`slide-${currentSlideIndex}`);
    if (currentSlide) currentSlide.classList.remove('slide-visible');

    currentSlideIndex += direction;
    if (currentSlideIndex >= sliderData.length) { currentSlideIndex = 0; }
    if (currentSlideIndex < 0) { currentSlideIndex = sliderData.length - 1; }

    const nextSlide = document.getElementById(`slide-${currentSlideIndex}`);
    if (nextSlide) nextSlide.classList.add('slide-visible');
}

function startSliderAutoCycle() {
    sliderTimer = setInterval(() => {
        moveSlider(1);
    }, 2000); // Inabadilika kiotomatiki kila sekunde 4
}

function resetSliderTimer() {
    clearInterval(sliderTimer);
    startSliderAutoCycle();
}

// 4. Kazi mpya ya kubonyeza kitufe cha "12+ IT Courses" kwenda kwenye Matokeo
function navigateToResults() {
    // Kama hakuna mwanafunzi aliyelogin, kwanza mlazimishe alogin ili aone matokeo yake
    if (!activeSessionStudent) {
        alert("Authentication Required: Please login with your Student Registration Number to view semester results matrices.");
        navigateTo('login');
    } else {
        // Kama ameshalogin, mpeleke moja kwa moja kwenye ukurasa wa profile na uwashe tab ya Academics
        navigateTo('profile');
        switchProfileTab({ currentTarget: document.querySelector('.profile-menu-triggers button:nth-child(2)') }, 'p-academics');
    }
}

// Washa injini ya picha ukurasa ukifunguka tu
document.addEventListener("DOMContentLoaded", () => {
    initializeCbeSlider();
});


