let students = JSON.parse(localStorage.getItem("students")) || [];

let usedNumbers = [];

// GENERATE UNIQUE REGISTRATION NUMBER
function generateRegNumber(){

    let number;

    do{
        number = Math.floor(1000 + Math.random() * 9000);
    }while(usedNumbers.includes(number));

    usedNumbers.push(number);

    return number;
}

// REGISTER STUDENT
function registerStudent(){

    const imageInput = document.getElementById("studentImage");

    const firstName = document.getElementById("firstName").value;

    const secondName = document.getElementById("secondName").value;

    const lastName = document.getElementById("lastName").value;

    const courseName = document.getElementById("courseName").value;

    const courseLevel = document.getElementById("courseLevel").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const password = document.getElementById("password").value;

    if(
        !firstName ||
        !secondName ||
        !lastName ||
        !courseName ||
        !courseLevel ||
        !phoneNumber || 
        !password
    ){
        alert("Fill all fields");
        return;
    }

    const regNumber = generateRegNumber();

    const reader = new FileReader();

    reader.onload = function(e){

        const student = {

            image:e.target.result,
            regNumber,
            firstName,
            secondName,
            lastName,
            courseName,
            courseLevel,
            phoneNumber,
            password,
            blocked:false
        };

        students.push(student);

        localStorage.setItem(
            "students",
            JSON.stringify(students)
        );

        displayStudents();

        alert(
            "Student Registered Successfully\nReg Number: "
            + regNumber
        );
    };

    if(imageInput.files[0]){
        reader.readAsDataURL(imageInput.files[0]);
    }else{

        const student = {

            image:"https://via.placeholder.com/60",
            regNumber,
            firstName,
            secondName,
            lastName,
            courseName,
            courseLevel,
            phoneNumber,
            password,
            blocked:false
        };

        students.push(student);

        localStorage.setItem(
            "students",
            JSON.stringify(students)
        );

        displayStudents();

        alert(
            "Student Registered Successfully\nReg Number: "
            + regNumber
        );
    }
}

// DISPLAY STUDENTS
function displayStudents(){

    const table = document.getElementById("studentTableBody");

    table.innerHTML = "";

    students.forEach((student,index)=>{

        table.innerHTML += `
        <tr class="${student.blocked ? 'blocked':''}">

            <td>
                <img src="${student.image}" class="student-img">
            </td>

            <td>${student.regNumber}</td>

            <td>${student.firstName}</td>

            <td>${student.secondName}</td>

            <td>${student.lastName}</td>

            <td>${student.courseName}</td>

            <td>${student.courseLevel}</td>
            <td>${student.phoneNumber}</td>
            <td>
${student.blocked ? 'Blocked':'Active'}
            </td>

            <td>

<button class="action-btn delete"
onclick="deleteStudent(${index})">
                Remove
</button>

<button class="action-btn block"
onclick="toggleBlock(${index})">
${student.blocked ? 'Unblock':'Block'}
</button>
<button class="action-btn reset"
onclick="resetPassword(${index})">
                Reset Password
                </button>

            </td>

        </tr>
        `;
    });
}

// DELETE STUDENT
function deleteStudent(index){

    students.splice(index,1);

    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );

    displayStudents();
}

// BLOCK / UNBLOCK
function toggleBlock(index){

    students[index].blocked =
    !students[index].blocked;

    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );

    displayStudents();
}

// RESET PASSWORD
function resetPassword(index){

    const newPassword =
    prompt("Enter new password");

    if(newPassword){

        students[index].password = newPassword;

        localStorage.setItem(
            "students",
            JSON.stringify(students)
        );

        alert("Password changed");
    }
}

displayStudents();