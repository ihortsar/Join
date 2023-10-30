let tasks = [];
let awaitingFeedback = [];
let toDo = [];
let inProgress = [];
let done = [];
let urgent = [];

/**
 * This function executes of functions when loading the page.
 */
async function onLoad() {
    await initScript();
    await setUrl();
    getTasks();
    getTime();
}


/**
 * This function sets and downlaods the backend url.
 */
async function setUrl() {
 getUsers();
}


/**
 * This function parses the json array from the backend.
 */
async function getUsers() {
    try {
        joinUsers = JSON.parse(await getItem('joinUsers')) || [];
    } catch (e) {
        console.error('Loading error:', e);
    }
}


/**
 * This function gets the current time and displays it.
 */
function getTime() {
    let loignBtnClick = localStorage.getItem('LoginBtn');
    if (loignBtnClick == 'true') {
        checkTime()
        greetUser();
    } else {
        document.getElementById('welcomingSummary').classList.add('d-none');
    }
}


/**
 * checks current time
 */
function checkTime() {
    let currentTime = new Date();
    let hour = currentTime.getHours();
    let greeting = document.getElementById('greeting');
    if (hour >= 1 && hour < 12) {
        greeting.innerHTML = "Good morning";
    } else if (hour >= 12 && hour < 18) {
        greeting.innerHTML = "Welcome";
    } else {
        greeting.innerHTML = "Good evening";
    }
}


/**
 * This function greets the logged user.
 */
function greetUser() {
    let loginValue = localStorage.getItem('LogIn');
    if (loginValue === 'User') {
        greetUserName();
    }

    localStorage.setItem('LoginBtn', false);

}


/**
 * This function displays logged user name.
 */
function greetUserName() {
    loggedUser = localStorage.getItem('Logged User');

    for (let i = 0; i < joinUsers.length; i++) {
        const user = joinUsers[i];
        let loggedName = user['userName'];
        let loggedEmail = user['userEmail'];

        if (loggedEmail == loggedUser) {
            document.getElementById('greetUser').innerHTML = loggedName;
        }
    }
    getCheckboxFeedback();
}


/**
 * This function checks the checkboxs value.
 */
function getCheckboxFeedback() {
    let checkedBox = localStorage.getItem('checkedBox');
    if (checkedBox === 'true') {
        document.body.innerHTML += returnCheckboxFeedback();
    }
}


function returnCheckboxFeedback() {
    return `
                <div class="checkbox-feedback">
                Your login details are stored in your browser.
                </div>
            `;
}



/**
 * Adds a hover effect on Task sections.
 */
function hoverTaskSection(idIcon, idNumber) {
    document.getElementById(idIcon).style = "filter: invert(100%) sepia(100%) saturate(0%) hue-rotate(280deg) brightness(104%) contrast(104%);";
    document.getElementById(idNumber).style.color = "white";
}


/**
 * This function removes the hover effect on the 'todo' + 'done' Container.
 */
function hoverOff() {
    document.getElementById('todo-icon').style = "filter: none;";
    document.getElementById('done-icon').style = "filter: none;";
    document.getElementById('done-number').style.color = "black";
    document.getElementById('todo-number').style.color = "black";
}


/**
 * This function sets saved tasks.
 */
async function getTasks() {
    tasks = JSON.parse(await getItem('tasks')) || [];

    for (let t = 0; t < tasks.length; t++) {
        const task = tasks[t];
        const taskReadinessState = task['readinessState'];
        const taskPrio = task['prio'];
        await setTaskStates(taskReadinessState);
        await setUrgetState(taskPrio);
    }
    parseTaskStates();
}


/**
 * This function saves the readiness state in the backend.
 * 
 * @param {string} taskReadinessState - repsective readiness state from tasts.
 */
async function setTaskStates(taskReadinessState) {
    switch (taskReadinessState) {
        case 'toDo':
            toDo.push(taskReadinessState);
            await setItem('ToDo', JSON.stringify(toDo));
            break;
        case 'inProgress':
            inProgress.push(taskReadinessState);
            await setItem('InProgress', JSON.stringify(inProgress));
            break;
        case 'awaitingFeedback':
            awaitingFeedback.push(taskReadinessState);
            await setItem('AwaitingFeedback', JSON.stringify(awaitingFeedback));
            break;
        case 'done':
            done.push(taskReadinessState);
            await setItem('Done', JSON.stringify(done));
            break;
    }
}


/**
 * This function saves the prio task 'urgent' in the backend.
 * @param {string} taskPrio - This variable carries the value from the key-value pair task['prio'].
 */
async function setUrgetState(taskPrio) {
    if (taskPrio == 'urgent') {
        urgent.push(taskPrio);
        await setItem('Urgent', JSON.stringify(taskPrio));
    }
}


/**
 * This function parses the task in respective container.
 */
function parseTaskStates() {
    tasksInBoard.innerHTML = tasks.length;
    tasksInProgress.innerHTML = inProgress.length;
    document.getElementById('urgent-number').innerHTML = urgent.length;
    document.getElementById('awaiting-number').innerHTML = awaitingFeedback.length;
    document.getElementById('todo-number').innerHTML = toDo.length;
    document.getElementById('done-number').innerHTML = done.length;
}