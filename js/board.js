tasksToEdit = []
subtasksToSave = []
let currentDragged
let statusOpen
let reassignContactsOnEdit = false


async function initBoard() {
    await initScript();
    try {
        tasks = JSON.parse(await getItem('tasks')) || []
        contacts = JSON.parse(await getItem('contacts')) || [];
        renderTaskCards()
        displayExistingCategories()
        listenFullCard()
        listenEditCard()
        listenAddTaskPopUp()
    } catch (er) {
        console.error(er)
    }
}


/**clears the page, filters tasks, iterates through tasks looking for entered value in filterTasks() */
async function renderTaskCards(i, j) {
    clearSubsections()
    let search = filterTasks()
    j = 0;

    for (i = 0; i < tasks.length; i++) {
        if (tasks[i].title.toLowerCase().includes(search) || tasks[i].description.toLowerCase().includes(search)) {
            checkForReadiness(i, j, tasks[i].readinessState)
            await checkIfContactNotDeleted(i)
            document.getElementById('progressBar' + i).style.background = tasks[i].colorOfBar
            renderAssignedContactsOnBoard(i)
            hideProgressSection(i)
            j++
        }
    }
}


/**hides progress section if there are no subtasks */
function hideProgressSection(i) {
    if (tasks[i].subtasks.length == 0) {
        document.getElementById(`progressBarSection${i}`).classList.remove('progressBarSection');
        document.getElementById(`progressBarSection${i}`).classList.add('displayNone');
    }
}


/**renders and sets colors to the reassigned contacts */
async function renderAssignedContactsOnBoard(i) {
    let colorCircle = 0
    if (tasks[i].assignedTo) {
        document.getElementById(`assignedToCircles${i}`).innerHTML = ''
        for (let contact = 0; contact < tasks[i].assignedTo.length; contact++) {
            await checkIfTheContactNameChanged(i, contact)
            HTMLforRenderAssignedContactsOnBoard(i, colorCircle, contact)
            colorCircle++
            if (colorCircle == 6) { colorCircle = 0 }
        }
    }
}


/**crenders and sets colors to the reassigned contacts on full card */
async function renderAssignedContactsOnFullCard(i, colorCircle, contact) {
    colorCircle = 0
    if (tasks[i].assignedTo) {
        document.getElementById(`assignedToFullCard`).innerHTML = ''
        for (contact = 0; contact < tasks[i].assignedTo.length; contact++) {
            await checkIfTheContactNameChanged(i, contact)
            HTMLforRenderAssignedContactsOnFullCard(i, colorCircle, contact)
            colorCircle++
            if (colorCircle == 6) { colorCircle = 0 }
        }
    }
}


/**draws urgency pictures on board*/
function priorityImageForRenderTaskCards(i, id, imgLow, imgMedium, imgUrgent) {
    if (tasks[i].prio == 'urgent') { document.getElementById(id).src = imgLow }
    if (tasks[i].prio == 'medium') { document.getElementById(id).src = imgMedium }
    if (tasks[i].prio == 'low') { document.getElementById(id).src = imgUrgent }
}


/**defines the dragged div */
async function renderDialogFullCard(i) {
    let counter = 0
    document.getElementById('dialogFullCard').classList.remove('displayNone')
    document.getElementById('dialogFullCard').innerHTML = HTMLrenderDialogFullCard(i)
    priorityImageForRenderTaskCards(i, `urgencyFullCard${i}`, prioImagesFullCard[0], prioImagesFullCard[1], prioImagesFullCard[2])
    renderSubtasksOnFullCard(i, counter)
    await renderAssignedContactsOnFullCard(i)
    checkForChecked(i, `checkBox${counter}`)
    let changeStatus = document.getElementById(`dropdown-contentForMobileDevices${i}`);
    changeStatus.style.display = 'none'
}


/**renders subtasks on full card */
function renderSubtasksOnFullCard(i, counter) {
    return tasks[i].subtasks.forEach(subtask => {
        document.getElementById('subtasksFullCard').innerHTML += HTMLrenderSubtasksDialogFullCard(i, subtask, counter)
        counter++
    })
}


/**opens the edit task dialog,sets the time in calender, checks if it's opened and colors the selected urgency */
function openEditTask(i) {
    let changeStatus = document.getElementById(`dropdown-contentForMobileDevices${i}`);
    changeStatus.style.display = 'none'
    document.getElementById('dialogEditCard').classList.remove('displayNone')
    document.getElementById('dialogEditCard').innerHTML = openEditTaskHTML(i)
    document.getElementById(`editedDate`).setAttribute("min", date.toISOString().split("T")[0]);
    colorPriosForEditTask(i)
}


/**gets the current state of tasks, redefines values for the task,saves them and renders */
async function editTask(i) {
    tasks = JSON.parse(await getItem('tasks'))
    let title = document.getElementById('editedTask');
    let description = document.getElementById('editedDescription');
    let date = document.getElementById('editedDate');
    tasks[i] = {
        title: title.value,
        description: description.value,
        category: tasks[i].category,
        colorCategory: tasks[i].colorCategory,
        date: date.value,
        assignedTo: tasks[i].assignedTo,
        prio: tasks[i].prio,
        readinessState: tasks[i].readinessState,
        subtasks: tasks[i].subtasks,
        colorOfBar: tasks[i].colorOfBar,
        percentOfDone: tasks[i].percentOfDone,
        pace: tasks[i].pace,
    };
    await setItem('tasks', JSON.stringify(tasks))
    closeEditCard()
}


/**closes edit card */
function closeEditCard() {
    document.getElementById('dialogFullCard').classList.add('displayNone')
    document.getElementById('dialogEditCard').classList.add('displayNone')
    reassignContactsOnEdit = false
    renderTaskCards();
}


/**defines the dragged div */
function startDragging(i) {
    currentDragged = i
}


/**changes readinessState for the dragged div */
async function moveTo(readinessState) {
    tasks = JSON.parse(await getItem('tasks'))
    tasks[currentDragged].readinessState = readinessState
    await setItem('tasks', JSON.stringify(tasks))
    renderTaskCards()
}


/** is the event object representing the drag event-used to prevent the default behavior of the browser, 
 * which would typically not allow dropping elements onto other elements. */
function allowDrop(ev) {
    ev.preventDefault();
}


/**returns in lower case the entered value */
function filterTasks() {
    let search = document.getElementById('findATask').value
    search = search.toLowerCase()
    return search
}


/**sorts the tasks */
function capitalizeFirstLetter(string) {
    if (string !== undefined) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}


function checkForReadiness(i, j, readinessState) {
    let stringWithFirstLetterCapitalized = capitalizeFirstLetter(readinessState);
    let id = 'boardSubsection' + stringWithFirstLetterCapitalized;
    document.getElementById(id).innerHTML += HTMLrenderTaskCards(i, j);
    priorityImageForRenderTaskCards(i, `urgencyBoard${j}`, prioImages[0], prioImages[1], prioImages[2]);
}


function openTask() {
    document.getElementById('dialogFullCard').classList.remove('displayNone')
}


function closeTask() {
    document.getElementById('dialogFullCard').classList.add('displayNone')
    renderTaskCards();
}


/** manages subtasks(done, not done and counts the general percent of done. 
 * Pace is used as a flag changing when checkbox clicked from initial 0 to 1 */
async function countSubtasks(i, j) {
    tasks = JSON.parse(await getItem('tasks'))

    if (tasks[i].subtasks[j].checkedValue == 0 && tasks[i].pace < tasks[i].subtasks.length) {
        tasks[i].pace++
        countsPercentOfDoneForBarOnBoard(i)
        tasks[i].subtasks[j].checkedValue = 1
    } else {
        if (tasks[i].pace > 0)
            tasks[i].pace--
        countsPercentOfDoneForBarOnBoard(i)
        tasks[i].subtasks[j].checkedValue = 0
    }
    colorOfBar = document.getElementById('progressBar' + i).style.background = `linear-gradient(to right, #29ABE2 ${percentOfDone}%, #e9e7e7 ${percentOfDone}%)`;
    tasks[i].colorOfBar = colorOfBar
    tasks[i].percentOfDone = percentOfDone
    await setItem('tasks', JSON.stringify(tasks))
}


/**counts percent of done for bar on board*/
function countsPercentOfDoneForBarOnBoard(i) {
    let addedSubtaskCheckboxes = document.getElementsByClassName('addedSubtaskOnEdit')
    return percentOfDone = tasks[i].pace / addedSubtaskCheckboxes.length * 100
}


/**keeps track of checked checkboxes for subtasks */
function checkForChecked(i, checkedbox) {
    for (let counter = 0; counter < tasks[i].subtasks.length; counter++) {
        checkedbox = document.getElementById(`checkBox${counter}`)

        if (tasks[i].subtasks[counter].checkedValue == 0) {
            checkedbox.checked = false
        } else { checkedbox.checked = true }
    }
}


function checkForCheckedAssignedOnEdit(i) {
    contacts.forEach((contact, index) => {
        tasks[i].assignedTo.forEach(assigned => {
            let checkedbox = document.getElementById(`checkboxAssigned${index}`)
            if (contact.email === assigned.email) {
                checkedbox.checked = true;
            }
        });
    });
}


/**checks the check box for checked property and adds or deletes from assigned contacts*/
async function addDeleteReassignedContacts(i, index) {
    let checkedbox = document.getElementById(`checkboxAssigned${index}`)
    if (checkedbox.checked == true) { addReassigned(i, index) }
    if (checkedbox.checked == false) { deleteReassigned(i, index) }
    await setItem('tasks', JSON.stringify(tasks));
}


/**deletes contacts from assigned*/
function deleteReassigned(i, index) {
    const emailToDelete = contacts[index].email;
    const assignedTo = tasks[i].assignedTo;
    for (let j = assignedTo.length - 1; j >= 0; j--) {
        if (assignedTo[j].email === emailToDelete) {
            assignedTo.splice(j, 1);
        }
    }
}


/**reassigns new contact*/
function addReassigned(i, index) {
    tasks[i].assignedTo.push(contacts[index])
}


/**opens readiness statuses for mobile*/
function openChangeStatus(i, event) {
    let changeStatus = document.getElementById(`dropdown-contentForMobileDevices${i}`);
    if (changeStatus.style.display === 'none') {
        changeStatus.style.display = 'block';
    } else {
        changeStatus.style.display = 'none'
    }
    event = event || window.event;
    event.stopPropagation();
    openChangeStatusContent(i);
    let droppedContent = document.getElementById(`statusesDropdown${i}`);
    if (changeStatus.style.display === 'none') {
        droppedContent.style.display = 'none'
    }
}


/**readiness states for mobile devices*/
function openChangeStatusContent(i) {
    ifStatusToDoForMobile(i)
    ifStatusInProgressForMobile(i)
    ifStatusAwaitingFeedbackForMobile(i)
    ifStatusDoneForMobile(i)
}


/**sets readiness state toDo*/
async function setStatus(i, status) {
    tasks[i].readinessState = status
    await setItem('tasks', JSON.stringify(tasks))
    renderTaskCards(i)
}


/**colors the chosen priority button */
function colorPriosForEditTask(i) {
    let selectedUrgency = checkForPrioOnEditTask(i)
    ifSelectedUrgencyUrgent(selectedUrgency)
    ifSelectedUrgencyMedium(selectedUrgency)
    ifSelectedUrgencyLow(selectedUrgency)
}


/**returns selected urgency for task */
function checkForPrioOnEditTask(i) {
    let selectedUrgency = tasks[i].prio
    return selectedUrgency
}


function ifSelectedUrgencyUrgent(selectedUrgency) {
    if (selectedUrgency == 'urgent') {
        document.getElementById("prio" + 4).src = "./assets/img/urgentOnclick.png";
        document.getElementById("prio" + 5).src = "./assets/img/mediumImg.png";
        document.getElementById("prio" + 6).src = "./assets/img/lowImg.png";
    }
}


function ifSelectedUrgencyMedium(selectedUrgency) {
    if (selectedUrgency == 'medium') {
        document.getElementById("prio" + 5).src = "./assets/img/mediumOnclick.png"
        document.getElementById("prio" + 4).src = "./assets/img/urgentImg.png"
        document.getElementById("prio" + 6).src = "./assets/img/lowImg.png"
    }
}


function ifSelectedUrgencyLow(selectedUrgency) {
    if (selectedUrgency == 'low') {
        document.getElementById("prio" + 6).src = "./assets/img/lowOnclick.png"
        document.getElementById("prio" + 4).src = "./assets/img/urgentImg.png"
        document.getElementById("prio" + 5).src = "./assets/img/mediumImg.png"
    }
}


/**iterates through contacts checking if emails in contacts and assigned contacts match */
function checkIfContactNotDeleted(index) {
    tasks[index].assignedTo.forEach((assigned, i) => {
        let match = contacts.find(contact => { return assigned.email === contact.email })
        if (match) {
            return true
        } else {
            tasks[index].assignedTo.splice(i, 1)
        }
        if (!match) {
            setItem('tasks', JSON.stringify(tasks))
        }
    })
}