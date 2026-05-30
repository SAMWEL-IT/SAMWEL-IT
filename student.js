function studentLogin(){
const reg =
document.getElementById("loginReg").value;
const pass =
document.getElementById("loginPassword").value;
const students =
JSON.parse(localStorage.getItem("students")) || [];
const message =
document.getElementById("loginMessage");
const student = students.find(
s => s.regNumber == reg &&
s.password == pass);
if(!student){
message.innerHTML =
"<p style='color:red;'>Invalid Login</p>";
return;
}
if(student.blocked){
message.innerHTML =
"<p style='color:orange;'>Account Blocked</p>";
return;
}
// HIDE LOGIN FORM
document.querySelector(".card").innerHTML = `
<h2 style="text-align:center;
        color:#1565c0;
        margin-bottom:20px;">
        Student Profile
</h2>
<table style="width:1000;
border-collapse:collapse;
background:white;">
<tr>
<td colspan="2"
style="text-align:center;padding:20px;">
<img src="${student.image}"
style="width:120px;height:120px;
                    border-radius:50%;
                    object-fit:cover;
                    border:4px solid #1565c0;">
</td>
</tr>
<tr>
<th>Registration Number</th>
<td>${student.regNumber}</td>
</tr>
<tr>
<th>First Name</th>
<td>${student.firstName}</td>
</tr>
<tr>
<th>Second Name</th>
<td>${student.secondName}</td>
</tr>
<tr>
<th>Last Name</th>
<td>${student.lastName}</td>
</tr>
<tr>
<th>Course Name</th>
<td>${student.courseName}</td>
</tr>
<tr>
<th>Course Level</th>
<td>${student.courseLevel}</td>
</tr>
</table>




                    
<button onclick="logoutStudent()"
    style="
        margin-top:20px;
        background:red;
        color:white;
        width:100%;
        padding:12px;
        border:none;
        border-radius:5px;
        cursor:pointer;
        font-weight:bold;
    ">
        Logout
    </button>

    `;
}

// LOGOUT
function logoutStudent(){

    location.reload();
}

// FORGOT PASSWORD
function forgotPassword(){
alert("Contact Admin\nPhone: +255745375356");
}