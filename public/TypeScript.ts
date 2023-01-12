function checkInputField() {
    const inputFieldValue: string = (document.getElementById("werin") as HTMLInputElement).value;
    const table = document.getElementById('table') as HTMLElement;
    const buttons = document.getElementById("buttons") as HTMLElement;

    // Überprüfen ob Wert leer, null oder undefined
    if (inputFieldValue.trim() === '' || inputFieldValue.trim() === null || inputFieldValue.trim() === undefined) {
        console.log(table.classList);
    } else {
        table.classList.remove("table-unsichtbar");
        table.classList.add("table-sichtbar");
        buttons.classList.remove("buttons-un");
        buttons.classList.add("buttons-si");
        render_table();
    }
}

function render_table() {
    const table_body = document.getElementById("tbody") as HTMLElement;
    let html_list: string = "";

    // XMLHttpRequest aufsetzen
    const request = new XMLHttpRequest();

    // Eventhandler für das Lesen der aktuellen Tabelle vom Server definieren
    request.onload = (event) => {
        html_list = request.response;
        table_body.innerHTML = html_list;
    };

    // Request starten
    request.open('GET', 'read');
    request.send();
}

function newtr() {

    const name: string = (document.getElementById("werin") as HTMLInputElement).value;
    let today = new Date().toLocaleDateString();
    const request = new XMLHttpRequest();
    request.open('Post', 'create');

    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(
        {
            "was": "",
            "wer": name,
            "wo": "",
            "wann": today
        }));
    render_table();
}


function edit() {
    let table = document.getElementById("table");
    let cells = table.getElementsByTagName("td");
    for (let i = 0; i < cells.length; i++) {

        if (cells[i].cellIndex % 4 != 0) {
            cells[i].onclick = function () {
                //Prüfen ob andere Td bearbeitet wird
                let currentCell = table.querySelector('[data-clicked="yes"]');
                if (currentCell) { //prüft ob eine andere zeile gerade bearbeitet wird
                    let ogText = currentCell.getAttribute('data-text');
                    //fixing error is no longer a child of this node
                    let ogHTML = currentCell.innerHTML;
                    currentCell.innerHTML = "";
                    currentCell.innerHTML = ogHTML;

                    currentCell.removeAttribute('data-clicked');
                    currentCell.removeAttribute('data-text');
                    currentCell.innerHTML = ogText;
                }
                cells[i].setAttribute('data-clicked', 'yes');
                cells[i].setAttribute('data-text', cells[i].innerHTML);
                let input = document.createElement('input');
                input.setAttribute('type', 'text');
                input.value = cells[i].innerHTML;
                input.style.backgroundColor = "White";
                input.onblur = function () {
                    let td = input.parentElement;
                    let og_text = input.parentElement.getAttribute('data-text');
                    let current_text = input.value;
                    if (og_text != current_text) {  //es gibt änderungen
                        //hier speichern mit ajax
                        td.removeAttribute('data-clicked');
                        td.removeAttribute('data-text');
                        td.innerHTML = current_text;
                        console.log(og_text + " wurde zu " + current_text); // bei neuem feld wird leere string zu eingabe!
                    } else { //debug
                        td.removeAttribute('data-clicked');
                        td.removeAttribute('data-text');
                        td.innerHTML = og_text;
                        console.log("es gibt keine änderungen")
                    }
                }
                input.addEventListener("keyup", (event) => {
                    if (event.keyCode === 13) {
                        input.blur();
                        console.log('Enter key pressed')
                    }
                });
                cells[i].innerHTML = "";
                cells[i].append(input);
                input.focus();
            }
        } else {
            continue;
        }
    }
}


function save() {

    let table: HTMLTableElement = document.getElementById('tbody') as HTMLTableElement;
    let tableData: any[][] = [];

    for (let i = 0; i < table.rows.length; i++) {
        let rowData: any[] = [];
        for (let j = 0; j < table.rows[i].cells.length; j++) {
            rowData.push(table.rows[i].cells[j].innerHTML);
        }
        tableData.push(rowData);
    }


    console.log(JSON.stringify(tableData));
    const request = new XMLHttpRequest();
    request.open('PUT', 'update');
    request.setRequestHeader('Content-Type', 'application/json');

    request.send(JSON.stringify(tableData));
}

function deleteRow(event) {

    // Überprüfe, ob der Button, der geklickt wurde, tatsächlich der Löschen-Button ist
    if (event.target.className === 'delbutton') {
        // Hole das <tr>-Element, das zu der Zeile gehört, die gelöscht werden soll
        const row = event.target.closest('tr');

        // Lösche die Zeile aus dem DOM
        row.parentNode.removeChild(row);

        // Hole die Zellen in der Zeile
        const cells = row.getElementsByTagName('td');

        // Lese die Werte aus den Zellen aus
        const was = cells[0].innerHTML;
        const wer = cells[1].innerHTML;
        const wo = cells[2].innerHTML;
        const wann = cells[3].innerHTML;

        // Sende eine DELETE-Anforderung mit den Werten aus der Zeile
        const request = new XMLHttpRequest();
        request.open('DELETE', 'del');
        request.send(JSON.stringify({was, wer, wo, wann}));
    }

}


document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('einabe-form').addEventListener("submit", (event) => {
        event.preventDefault();
        checkInputField();
    });
    document.getElementById('neu').addEventListener("click", (event) => {
        newtr();
    });
    document.getElementById("sichern").addEventListener("click", (event) => {
        save();
    });
    document.getElementById("tbody").addEventListener("click", (event) => {
        edit();
    });

    document.getElementById('tbody').addEventListener('click', deleteRow);

});