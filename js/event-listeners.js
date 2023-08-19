/**If edit task card open, listenes to clicks on reassign contacts div to open it */
function listenToEvent(i) {
    let entireEditTaskCard = document.getElementById('entireEditTaskCard');
    if (entireEditTaskCard) {
        entireEditTaskCard.addEventListener('mouseenter', function () {
            let contactList = document.getElementById('reassignContacts');
            let dropdownAddContact = document.getElementById('editedDropdownAddContact');
            contactList.addEventListener('mouseenter', function () {
                dropdownAddContact.innerHTML = ''
                contacts.forEach((contact, index) => {
                    dropdownAddContact.innerHTML += `<div class="droppedContacts"><a>${contact.name}</a><input onclick="addDeleteReassignedContacts(${i},${index})" id="checkboxAssigned${index}"  type="checkbox"></div>`;
                });
                checkForCheckedAssignedOnEdit(i)
            });
        });
    }
}


function listenFullCard() {
    let dialogFullCard = document.getElementById('dialogFullCard')
    let dialogFullCardContent = document.getElementById('dialogFullCardContent')
    if (dialogFullCard) {
        dialogFullCard.addEventListener('click', function (event) {
            if (event.target === this) {
                closeTask()
            }
            dialogFullCardContent.addEventListener('click', function (event) {
                event.stopPropagation()
            })
        })
    }
}


function listenEditCard() {
    let dialogEditCard = document.getElementById('dialogEditCard')
    let entireEditTaskCard = document.getElementById(' entireEditTaskCard')
    if (dialogEditCard) {
        dialogEditCard.addEventListener('click', function (event) {
            if (event.target === this) {
                closeEditCard()
            }
            entireEditTaskCard.addEventListener('click', function (event) {
                event.stopPropagation()
            })
        })
    }


}