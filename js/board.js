tasks = []
assignedContacts = []
prios = []
categories = []
colorsCategory = []
prioImages = ['./assets/img/urgent.png', './assets/img/medium.png', './assets/img/low.png']
prioImagesFullCard = ['./assets/img/urgentOnclick.png', './assets/img/mediumOnclick.png', './assets/img/lowOnclick.png']
tasksToEdit = []
subtasksToSave = []
let currentDragged
let percentOfDone
let colorOfBar
let checkboxState;
let checkedInput
let statusOpen





async function initBoard() {
    await initScript();
    try {
        setURL("https://ihor-tsarkov.developerakademie.net/Join/smallest_backend_ever-master");
        await downloadFromServer();
        tasks = await JSON.parse(await backend.getItem('tasks')) || []
        contacts = JSON.parse(backend.getItem('contacts')) || [];
        renderTaskCards()

    } catch (er) {
        console.error(er)
    }
}


function renderTaskCards(i, j) {
    clearSubsections()

    let search = filterTasks()
    j = 0;
    for (i = 0; i < tasks.length; i++) {
        if (tasks[i].title.toLowerCase().includes(search)) {
            checkForReadiness(i, j)
            document.getElementById('progressBar' + i).style.background = tasks[i].colorOfBar
            renderAssignedContactsOnBoard(i)
            hideProgressSection(i)
            j++
        }
    }
}


function hideProgressSection(i) {
    if (tasks[i].subtasks.length == 0) {
        document.getElementById(`progressBarSection${i}`).classList.remove('progressBarSection');
        document.getElementById(`progressBarSection${i}`).classList.add('displayNone');
    }
}



function renderAssignedContactsOnBoard(i, contact, colorCircle) {
    colorCircle = 0
    if (tasks[i].assignedTo) {
        document.getElementById(`assignedToCircles${i}`).innerHTML = ''
        for (contact = 0; contact < tasks[i].assignedTo.length; contact++) {
            checkIfTheContactNameChanged(i, contact)
            HTMLforRenderAssignedContactsOnBoard(i, colorCircle, contact)
            colorCircle++
            if (colorCircle == 6) { colorCircle = 0 }
        }
    }
}


function renderAssignedContactsOnFullCard(i, contact, colorCircle) {
   
    colorCircle = 0
    if (tasks[i].assignedTo) {
        document.getElementById(`assignedToFullCard`).innerHTML = ''
        for (contact = 0; contact < tasks[i].assignedTo.length; contact++) {
            checkIfTheContactNameChanged(i, contact)
            HTMLforRenderAssignedContactsOnFullCard(i, contact, colorCircle)
            colorCircle++
            if (colorCircle == 6) { colorCircle = 0 }
        }
    }
}


function checkIfTheContactNameChanged(i, contact) {
    contacts.filter(maincontact => {
        if (maincontact.email === tasks[i].assignedTo[contact].email) {
            tasks[i].assignedTo[contact].firstNameLetter = maincontact.firstNameLetter;
            tasks[i].assignedTo[contact].lastNameLetter = maincontact.lastNameLetter;
        }
    })
}


function priorityImageForRenderTaskCards(i) {
    if (tasks[i].prio == 'urgent') { document.getElementById(`urgencyBoard${i}`).src = prioImages[0] }
    if (tasks[i].prio == 'medium') { document.getElementById(`urgencyBoard${i}`).src = prioImages[1] }
    if (tasks[i].prio == 'low') { document.getElementById(`urgencyBoard${i}`).src = prioImages[2] }

}


function priorityImageForRenderFullTaskCard(i) {
    if (tasks[i].prio == 'urgent') { document.getElementById(`urgencyFullCard${i}`).src = prioImagesFullCard[0] }
    if (tasks[i].prio == 'medium') { document.getElementById(`urgencyFullCard${i}`).src = prioImagesFullCard[1] }
    if (tasks[i].prio == 'low') { document.getElementById(`urgencyFullCard${i}`).src = prioImagesFullCard[2] }

}


async function renderDialogFullCard(i, colorCircle) {

    let counter = 0
    document.getElementById('dialogFullCard').classList.remove('displayNone')
    document.getElementById('dialogFullCard').innerHTML = HTMLrenderDialogFullCard(i)
    priorityImageForRenderFullTaskCard(i)
    tasks[i].subtasks.forEach(subtask => {
        document.getElementById('subtasksFullCard').innerHTML += HTMLrenderSubtasksDialogFullCard(i, subtask, counter)
        counter++
    })
    renderAssignedContactsOnFullCard(i)
    checkForChecked(i, `checkBox${counter}`)
    let changeStatus = document.getElementById(`dropdown-contentForMobileDevices${i}`);
    changeStatus.style.display = 'none'
}


function openEditTask(i) {
    let changeStatus = document.getElementById(`dropdown-contentForMobileDevices${i}`);
    changeStatus.style.display = 'none'
    document.getElementById('dialogEditCard').classList.remove('displayNone')
    document.getElementById('dialogEditCard').innerHTML = openEditTaskHTML(i)
    document.getElementById(`editedDate`).setAttribute("min", date.toISOString().split("T")[0]);
    listenToEvent(i)
}


async function editTask(i) {
    tasks = JSON.parse(await backend.getItem('tasks'))
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

    await backend.setItem('tasks', JSON.stringify(tasks))
    renderTaskCards();
    closeEditCard()
}


function closeEditCard() {
    document.getElementById('dialogFullCard').classList.add('displayNone')
    document.getElementById('dialogEditCard').classList.add('displayNone')
}


function startDragging(i) {
    currentDragged = i

}


async function moveTo(readinessState) {
    tasks = JSON.parse(await backend.getItem('tasks'))
    tasks[currentDragged].readinessState = readinessState
    await backend.setItem('tasks', JSON.stringify(tasks))
    renderTaskCards()
}


function allowDrop(ev) {
    ev.preventDefault();
}


function filterTasks() {
    let search = document.getElementById('findATask').value
    search = search.toLowerCase()
    return search
}


function clearSubsections() {
    document.getElementById('boardSubsectionToDo').innerHTML = ''
    document.getElementById('boardSubsectionInProgress').innerHTML = ''
    document.getElementById('boardSubsectionFeedback').innerHTML = ''
    document.getElementById('boardSubsectionDone').innerHTML = ''
}


function checkForReadiness(i, j) {
    if (tasks[i].readinessState == 'toDo') {
        document.getElementById('boardSubsectionToDo').innerHTML += HTMLrenderTaskCards(i, j)
        priorityImageForRenderTaskCards(i, j)
    }
    if (tasks[i].readinessState == 'inProgress') {
        document.getElementById('boardSubsectionInProgress').innerHTML += HTMLrenderTaskCards(i, j)
        priorityImageForRenderTaskCards(i, j)
    }
    if (tasks[i].readinessState == 'awaitingFeedback') {
        document.getElementById('boardSubsectionFeedback').innerHTML += HTMLrenderTaskCards(i, j)
        priorityImageForRenderTaskCards(i, j)
    }
    if (tasks[i].readinessState == 'done') {
        document.getElementById('boardSubsectionDone').innerHTML += HTMLrenderTaskCards(i, j)
        priorityImageForRenderTaskCards(i, j)
    }
}


function openTask() {
    document.getElementById('dialogFullCard').classList.remove('displayNone')

}


function closeTask() {
    document.getElementById('dialogFullCard').classList.add('displayNone')
    renderTaskCards();
}


async function countSubtasks(i, j) {
    tasks = JSON.parse(await backend.getItem('tasks'))
    let addedSubtaskCheckboxes = document.getElementsByClassName('addedSubtaskOnEdit')

    if (tasks[i].subtasks[j].checkedValue == 0 && tasks[i].pace < tasks[i].subtasks.length) {
        tasks[i].pace++
        percentOfDone = tasks[i].pace / addedSubtaskCheckboxes.length * 100
        tasks[i].subtasks[j].checkedValue = 1
    } else {
        if (tasks[i].pace > 0)
            tasks[i].pace--
        percentOfDone = tasks[i].pace / addedSubtaskCheckboxes.length * 100
        tasks[i].subtasks[j].checkedValue = 0
    }
    colorOfBar = document.getElementById('progressBar' + i).style.background = `linear-gradient(to right, #29ABE2 ${percentOfDone}%, #e9e7e7 ${percentOfDone}%)`;
    tasks[i].colorOfBar = colorOfBar
    tasks[i].percentOfDone = percentOfDone
    await backend.setItem('tasks', JSON.stringify(tasks))
}



function listenToEvent(i) {
    var entireEditTaskCard = document.getElementById('entireEditTaskCard');
    if (entireEditTaskCard) {
        entireEditTaskCard.addEventListener('mouseenter', function () {
            let contactList = document.getElementById('reassignContacts');
            let dropdownAddContact = document.getElementById('editedDropdownAddContact');
            contactList.addEventListener('mouseenter', function () {
                dropdownAddContact.innerHTML = ''
                contacts.forEach((contact, index) => {
                    dropdownAddContact.innerHTML += `<div class="droppedContacts"><a>${contact.name}</a><input onclick="addDeleteReassignedContacts(${i},${index})" id="checkboxAssigned${index}"  type="checkbox"></div>`;
                });
                checkForCheckedAssigned(i)
            });
        });
    }
}


function checkForChecked(i, checkedbox) {
    for (let counter = 0; counter < tasks[i].subtasks.length; counter++) {
        checkedbox = document.getElementById(`checkBox${counter}`)

        if (tasks[i].subtasks[counter].checkedValue == 0) {
            checkedbox.checked = false
        } else { checkedbox.checked = true }
    }
}


function checkForCheckedAssigned(i) {
    let checkedbox

    contacts.forEach((contact, index) => {

        tasks[i].assignedTo.forEach(assigned => {
            checkedbox = document.getElementById(`checkboxAssigned${index}`)
            if (contact.email === assigned.email) {
                checkedbox.checked = true;
            }
        });
    });
}


async function addDeleteReassignedContacts(i, index) {
    let checkedbox = document.getElementById(`checkboxAssigned${index}`)
    if (checkedbox.checked == true) { addReassigned(i, index) }
    if (checkedbox.checked == false) { deleteReassigned(i, index) }
    await backend.setItem('tasks', JSON.stringify(tasks));
}


function deleteReassigned(i, index) {
    const emailToDelete = contacts[index].email;
    const assignedTo = tasks[i].assignedTo;

    for (let j = assignedTo.length - 1; j >= 0; j--) {
        if (assignedTo[j].email === emailToDelete) {
            assignedTo.splice(j, 1);
        }
    }
}


function addReassigned(i, index) {
    tasks[i].assignedTo.push(contacts[index])
}


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


function openChangeStatusContent(i) {
    ifStatusToDoForMobile(i)
    ifStatusInProgressForMobile(i)
    ifStatusAwaitingFeedbackForMobile(i)
    ifStatusDoneForMobile(i)
}


async function statusInProgress(i) {
    tasks[i].readinessState = "inProgress"
    await backend.setItem('tasks', JSON.stringify(tasks))
    renderTaskCards(i)
}

async function statusAwaitingFeedback(i) {
    tasks[i].readinessState = "awaitingFeedback"
    await backend.setItem('tasks', JSON.stringify(tasks))
    renderTaskCards(i)
}

async function statusDone(i) {
    tasks[i].readinessState = "done"
    await backend.setItem('tasks', JSON.stringify(tasks))
    renderTaskCards(i)
}

async function statusToDo(i) {
    tasks[i].readinessState = "toDo"
    await backend.setItem('tasks', JSON.stringify(tasks))
    renderTaskCards(i)
}







