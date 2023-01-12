class Eintrag {
    public wer: string;
    public was: string;
    public wo: string;
    public wann: Date;

    constructor(wer: string, was: string, wo: string, wann: Date) {
        this.wer = wer;
        this.was = was;
        this.wo = wo;
        this.wann = wann;
    }
}

class ShoppingList {
    items: Eintrag[];

    constructor() {
        this.items = [];
    }

    addItem(item: Eintrag) {
        this.items.unshift(item);
    }


    deleteItem(item: Eintrag) {
        let index = this.items.indexOf(item);
        if (index > -1) {
            this.items.splice(index, 1);
        }
    }
}

let list = new ShoppingList();


const express = require("express");
const app = express();
const path = require("path");
const port: number = 8080;

app.listen(port);
console.log("Server lissening on port " + port);

const fs = require('fs');
const content = fs.readFileSync('Logs.json', 'utf8');
let Logs;

if (Object.keys(content).length != 0) {
    Logs = JSON.parse(content);
    list.items = Logs.items;
} else {
    Logs = {}
}


function createTableRows(list) {
    let rows = '';
    for (let i = 0; i < list.items.length; i++) {

        rows += `<tr>
      <td>${list.items[i].wer}</td>
      <td>${list.items[i].was}</td>
      <td>${list.items[i].wo}</td>
      <td>${list.items[i].wann}</td>
      <td><button class="delbutton">X</button></td>
    </tr>`;
    }
//<td class="delbutton"><button class="delbutton">X</button></td>
    return rows;
}

//Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//READ
app.get("/", (req, res) => {
    console.log((path.join(__dirname + "/index.html")));
    res.sendFile(path.join(__dirname + "/index.html")); //Enables access to Index.html and everything in the folder public
});
app.get("/read", (req, res) => {
    console.log("Table is displayed");
    res.send(createTableRows(list));
});
//Create
app.post("/create", (req, res) => {
    let eintrag = new Eintrag(req.body.wer, "", "", req.body.wann);
    list.addItem(eintrag);

    res.send(createTableRows(list));
});
//UPDATE
app.put("/update", (req, res) => {
    list.items = [];

    for (let i = 0; i < req.body.length; i++) {
        let eintrag = new Eintrag(req.body[i][0], req.body[i][1], req.body[i][2], req.body[i][3]);
        if (req.body[i][0] === "" && req.body[i][1] === "" && req.body[i][2] === "" && req.body[i][3] === "")
            continue;
        list.addItem(eintrag);
    }
    console.log(list);
    fs.writeFileSync('Logs.json', JSON.stringify(list));
    res.send();
});
//DELETE
app.delete("/del", (req, res) => {
    let eintrag = new Eintrag(req.body.wer, req.body.was, req.body.wo, req.body.wann);
    for(let i = 0; i <req.body.length; i++){
        if (eintrag.wer === req.body[i][0] && eintrag.was === req.body[i][1] && req.body.wo === req.body[i][2]&& req.body.wann === req.body[i][3]){
            list.deleteItem(eintrag);
            console.log("deleted");
        }
    }
    console.log(list);
    fs.writeFileSync('Logs.json', JSON.stringify(list));
    res.send();
});