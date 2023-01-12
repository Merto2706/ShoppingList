function checkInputField() {
    var inputFieldValue = document.getElementById("werin").value;
    var table = document.getElementById('table');
    var buttons = document.getElementById("buttons");
    // Überprüfen ob Wert leer, null oder undefined
    if (inputFieldValue.trim() === '' || inputFieldValue.trim() === null || inputFieldValue.trim() === undefined) {
        console.log(table.classList);
    }
    else {
        table.classList.remove("table-unsichtbar");
        table.classList.add("table-sichtbar");
        buttons.classList.remove("buttons-un");
        buttons.classList.add("buttons-si");
        render_table();
    }
}
function render_table() {
    var table_body = document.getElementById("tbody");
    var html_list = "";
    // XMLHttpRequest aufsetzen
    var request = new XMLHttpRequest();
    // Eventhandler für das Lesen der aktuellen Tabelle vom Server definieren
    request.onload = function (event) {
        html_list = request.response;
        table_body.innerHTML = html_list;
    };
    // Request starten
    request.open('GET', 'read');
    request.send();
}
function newtr() {
    var name = document.getElementById("werin").value;
    var today = new Date().toLocaleDateString();
    var request = new XMLHttpRequest();
    request.open('Post', 'create');
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({
        "was": "",
        "wer": name,
        "wo": "",
        "wann": today
    }));
    render_table();
}
function edit() {
    var table = document.getElementById("table");
    var cells = table.getElementsByTagName("td");
    var _loop_1 = function (i) {
        if (cells[i].cellIndex % 4 != 0) {
            cells[i].onclick = function () {
                //Prüfen ob andere Td bearbeitet wird
                var currentCell = table.querySelector('[data-clicked="yes"]');
                if (currentCell) { //prüft ob eine andere zeile gerade bearbeitet wird
                    var ogText = currentCell.getAttribute('data-text');
                    //fixing error is no longer a child of this node
                    var ogHTML = currentCell.innerHTML;
                    currentCell.innerHTML = "";
                    currentCell.innerHTML = ogHTML;
                    currentCell.removeAttribute('data-clicked');
                    currentCell.removeAttribute('data-text');
                    currentCell.innerHTML = ogText;
                }
                cells[i].setAttribute('data-clicked', 'yes');
                cells[i].setAttribute('data-text', cells[i].innerHTML);
                var input = document.createElement('input');
                input.setAttribute('type', 'text');
                input.value = cells[i].innerHTML;
                input.style.backgroundColor = "White";
                input.onblur = function () {
                    var td = input.parentElement;
                    var og_text = input.parentElement.getAttribute('data-text');
                    var current_text = input.value;
                    if (og_text != current_text) { //es gibt änderungen
                        //hier speichern mit ajax
                        td.removeAttribute('data-clicked');
                        td.removeAttribute('data-text');
                        td.innerHTML = current_text;
                        console.log(og_text + " wurde zu " + current_text); // bei neuem feld wird leere string zu eingabe!
                    }
                    else { //debug
                        td.removeAttribute('data-clicked');
                        td.removeAttribute('data-text');
                        td.innerHTML = og_text;
                        console.log("es gibt keine änderungen");
                    }
                };
                input.addEventListener("keyup", function (event) {
                    if (event.keyCode === 13) {
                        input.blur();
                        console.log('Enter key pressed');
                    }
                });
                cells[i].innerHTML = "";
                cells[i].append(input);
                input.focus();
            };
        }
        else {
            return "continue";
        }
    };
    for (var i = 0; i < cells.length; i++) {
        _loop_1(i);
    }
}
function save() {
    var table = document.getElementById('tbody');
    var tableData = [];
    for (var i = 0; i < table.rows.length; i++) {
        var rowData = [];
        for (var j = 0; j < table.rows[i].cells.length; j++) {
            rowData.push(table.rows[i].cells[j].innerHTML);
        }
        tableData.push(rowData);
    }
    console.log(JSON.stringify(tableData));
    var request = new XMLHttpRequest();
    request.open('PUT', 'update');
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(tableData));
}
function deleteRow(event) {
    // Überprüfe, ob der Button, der geklickt wurde, tatsächlich der Löschen-Button ist
    if (event.target.className === 'delbutton') {
        // Hole das <tr>-Element, das zu der Zeile gehört, die gelöscht werden soll
        var row = event.target.closest('tr');
        // Lösche die Zeile aus dem DOM
        row.parentNode.removeChild(row);
        // Hole die Zellen in der Zeile
        var cells = row.getElementsByTagName('td');
        // Lese die Werte aus den Zellen aus
        var was = cells[0].innerHTML;
        var wer = cells[1].innerHTML;
        var wo = cells[2].innerHTML;
        var wann = cells[3].innerHTML;
        // Sende eine DELETE-Anforderung mit den Werten aus der Zeile
        var request = new XMLHttpRequest();
        request.open('DELETE', 'del');
        request.send(JSON.stringify({ was: was, wer: wer, wo: wo, wann: wann }));
    }
}
document.addEventListener('DOMContentLoaded', function (event) {
    document.getElementById('einabe-form').addEventListener("submit", function (event) {
        event.preventDefault();
        checkInputField();
    });
    document.getElementById('neu').addEventListener("click", function (event) {
        newtr();
    });
    document.getElementById("sichern").addEventListener("click", function (event) {
        save();
    });
    document.getElementById("tbody").addEventListener("click", function (event) {
        edit();
    });
    document.getElementById('tbody').addEventListener('click', deleteRow);
});
