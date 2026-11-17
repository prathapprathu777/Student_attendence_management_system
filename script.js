document.addEventListener('DOMContentLoaded', () => {

// ADMIN LOGIN

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');

const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

const logoutBtn = document.getElementById('logout-btn');

// STUDENT ELEMENTS

const studentForm = document.getElementById('student-form');

const rollNoInput = document.getElementById('roll-no');

const studentNameInput = document.getElementById('student-name');

const studentList = document.getElementById('student-list');

const datePicker = document.getElementById('attendance-date');

const submitAttendanceBtn =
    document.getElementById('submit-attendance');

const monthlyBtn =
    document.getElementById('monthly-percentage-btn');


// TODAY'S DATE

const today = new Date();

const localToday =
    today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');

datePicker.value = localToday;


// LOAD STUDENTS

let students =
    JSON.parse(localStorage.getItem('students')) || [];

let pendingAttendance = {};


// LOGIN CHECK

if (localStorage.getItem('isLoggedIn') === 'true') {

    showApp();

} else {

    showLogin();

}


// LOGIN

loginForm.addEventListener('submit', (e) => {

    e.preventDefault();

    const username =
        document.getElementById('admin-username').value.trim();

    const password =
        document.getElementById('admin-password').value.trim();

    if (
        username === ADMIN_USER &&
        password === ADMIN_PASS
    ) {

        localStorage.setItem('isLoggedIn', 'true');

        loginError.style.display = 'none';

        showApp();

    } else {

        loginError.style.display = 'block';

    }

});


// LOGOUT

logoutBtn.addEventListener('click', () => {

    localStorage.removeItem('isLoggedIn');

    pendingAttendance = {};

    showLogin();

});


// SHOW LOGIN

function showLogin() {

    loginContainer.style.display = 'block';

    appContainer.style.display = 'none';

}


// SHOW APPLICATION

function showApp() {

    loginContainer.style.display = 'none';

    appContainer.style.display = 'block';

    saveAndRender();

}


// SAVE AND RENDER

function saveAndRender() {

    students.sort((a, b) => {

        return a.rollNo.localeCompare(
            b.rollNo,
            undefined,
            {
                numeric: true,
                sensitivity: 'base'
            }
        );

    });

    localStorage.setItem(
        'students',
        JSON.stringify(students)
    );

    renderStudents();

}


// RENDER STUDENTS

function renderStudents() {

    studentList.innerHTML = '';

    const selectedDate = datePicker.value;

    if (students.length === 0) {

        studentList.innerHTML = `
            <tr>
                <td colspan="5" class="no-students">
                    No students added yet.
                </td>
            </tr>
        `;

        return;

    }

    students.forEach((student, index) => {

        const tr = document.createElement('tr');

        const recordForDate =
            student.attendanceRecords
                ? student.attendanceRecords[selectedDate]
                : null;

        const currentStatus =
            pendingAttendance[student.rollNo] ||
            recordForDate ||
            'Not Marked';

        let statusClass = 'status-pending';

        if (currentStatus === 'Present') {
            statusClass = 'status-present';
        }

        if (currentStatus === 'Absent') {
            statusClass = 'status-absent';
        }

        tr.innerHTML = `

            <td>${student.rollNo}</td>

            <td>${student.name}</td>

            <td class="${statusClass}">
                ${currentStatus}
            </td>

            <td>${selectedDate}</td>

            <td class="action-buttons">

                <button
                    class="btn-present"
                    onclick="selectAttendance('${encodeURIComponent(student.rollNo)}', 'Present')">
                    Present
                </button>

                <button
                    class="btn-absent"
                    onclick="selectAttendance('${encodeURIComponent(student.rollNo)}', 'Absent')">
                    Absent
                </button>

                <button
                    class="btn-clear"
                    onclick="clearAttendance('${encodeURIComponent(student.rollNo)}')">
                    Erase
                </button>

                <button
                    class="btn-delete"
                    onclick="deleteStudent('${encodeURIComponent(student.rollNo)}')">
                    Delete
                </button>

            </td>

        `;

        studentList.appendChild(tr);

    });

}


// DATE CHANGE

datePicker.addEventListener('change', () => {

    pendingAttendance = {};

    renderStudents();

});


// ADD STUDENT

studentForm.addEventListener('submit', (e) => {

    e.preventDefault();

    const rollNo = rollNoInput.value.trim();

    const name = studentNameInput.value.trim();

    if (!rollNo || !name) {

        alert('Please enter student details.');

        return;

    }

    const duplicate = students.some(student =>

        student.rollNo.toLowerCase() === rollNo.toLowerCase()

    );

    if (duplicate) {

        alert('This Roll Number already exists.');

        return;

    }

    students.push({

        rollNo: rollNo,

        name: name,

        attendanceRecords: {}

    });

    rollNoInput.value = '';

    studentNameInput.value = '';

    saveAndRender();

    alert('Student added successfully!');

});


// SELECT PRESENT / ABSENT

window.selectAttendance = (encodedRollNo, status) => {

    const rollNo = decodeURIComponent(encodedRollNo);

    if (!datePicker.value) {

        alert('Please select an attendance date.');

        return;

    }

    pendingAttendance[rollNo] = status;

    renderStudents();

};


// SUBMIT ATTENDANCE

submitAttendanceBtn.addEventListener('click', () => {

    const selectedDate = datePicker.value;

    if (!selectedDate) {

        alert('Please select a date.');

        return;

    }

    if (students.length === 0) {

        alert('Please add students first.');

        return;

    }

    const markedCount = Object.keys(pendingAttendance).length;

    if (markedCount === 0) {

        alert('Please mark attendance for at least one student.');

        return;

    }

    students.forEach(student => {

        const status = pendingAttendance[student.rollNo];

        if (status) {

            if (!student.attendanceRecords) {

                student.attendanceRecords = {};

            }

            student.attendanceRecords[selectedDate] = status;

        }

    });

    pendingAttendance = {};

    saveAndRender();

    alert('Attendance submitted successfully!');

});


// ERASE ATTENDANCE

window.clearAttendance = (encodedRollNo) => {

    const rollNo = decodeURIComponent(encodedRollNo);

    const student = students.find(s => s.rollNo === rollNo);

    if (!student) return;

    delete pendingAttendance[rollNo];

    const selectedDate = datePicker.value;

    if (
        student.attendanceRecords &&
        student.attendanceRecords[selectedDate]
    ) {

        delete student.attendanceRecords[selectedDate];

        saveAndRender();

    } else {

        renderStudents();

    }

};


// DELETE STUDENT

window.deleteStudent = (encodedRollNo) => {

    const rollNo = decodeURIComponent(encodedRollNo);

    const studentIndex =
        students.findIndex(s => s.rollNo === rollNo);

    if (studentIndex === -1) return;

    const confirmDelete = confirm(
        `Are you sure you want to delete ${students[studentIndex].name}?`
    );

    if (!confirmDelete) return;

    students.splice(studentIndex, 1);

    delete pendingAttendance[rollNo];

    saveAndRender();

};


// OPEN MONTHLY REPORT PAGE

monthlyBtn.addEventListener('click', () => {

    const selectedDate = datePicker.value;

    if (!selectedDate) {

        alert('Please select an attendance date.');

        return;

    }

    window.location.href =
        `report.html?month=${selectedDate.substring(0, 7)}`;

});

});