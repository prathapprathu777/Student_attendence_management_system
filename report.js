document.addEventListener('DOMContentLoaded', () => {

// CHECK ADMIN LOGIN

if (localStorage.getItem('isLoggedIn') !== 'true') {

    window.location.href = 'index.html';

    return;

}


// GET ELEMENTS

const monthInput =
    document.getElementById('report-month');

const viewButton =
    document.getElementById('view-report');

const monthlyList =
    document.getElementById('monthly-list');

const backButton =
    document.getElementById('back-btn');

const logoutButton =
    document.getElementById('logout-report');


// GET CURRENT MONTH

const today = new Date();

const currentMonth =
    today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0');


// GET MONTH FROM URL

const urlParams =
    new URLSearchParams(window.location.search);

monthInput.value =
    urlParams.get('month') || currentMonth;


// GENERATE MONTHLY REPORT

function generateReport() {

    const students =
        JSON.parse(localStorage.getItem('students')) || [];

    const selectedMonth = monthInput.value;

    if (!selectedMonth) {

        alert('Please select a month.');

        return;

    }

    monthlyList.innerHTML = '';

    if (students.length === 0) {

        monthlyList.innerHTML = `
            <tr>
                <td colspan="6" class="no-students">
                    No students available.
                </td>
            </tr>
        `;

        return;

    }


    students.forEach(student => {

        let present = 0;

        let absent = 0;

        const records =
            student.attendanceRecords || {};


        // COUNT PRESENT AND ABSENT DAYS

        Object.keys(records).forEach(date => {

            if (date.substring(0, 7) === selectedMonth) {

                if (records[date] === 'Present') {

                    present++;

                } else if (records[date] === 'Absent') {

                    absent++;

                }

            }

        });


        // TOTAL DAYS

        const total = present + absent;


        // ATTENDANCE PERCENTAGE

        const percentage =
            total > 0
                ? ((present / total) * 100).toFixed(2)
                : '0.00';


        // PERCENTAGE COLOR

        let percentageClass = 'percentage-normal';

        if (total === 0) {

            percentageClass = 'percentage-pending';

        } else if (Number(percentage) < 75) {

            percentageClass = 'percentage-low';

        }


        // CREATE TABLE ROW

        const row = document.createElement('tr');

        const values = [
            student.rollNo,
            student.name,
            present,
            absent,
            total
        ];

        values.forEach(value => {

            const cell = document.createElement('td');

            cell.textContent = value;

            row.appendChild(cell);

        });


        // PERCENTAGE CELL

        const percentageCell =
            document.createElement('td');

        percentageCell.textContent = percentage + '%';

        percentageCell.className = percentageClass;

        row.appendChild(percentageCell);

        monthlyList.appendChild(row);

    });

}


// VIEW REPORT BUTTON

viewButton.addEventListener('click', generateReport);


// DISPLAY REPORT AUTOMATICALLY

generateReport();


// BACK TO DASHBOARD

backButton.addEventListener('click', () => {

    window.location.href = 'index.html';

});


// LOGOUT

logoutButton.addEventListener('click', () => {

    localStorage.removeItem('isLoggedIn');

    window.location.href = 'index.html';

});

});