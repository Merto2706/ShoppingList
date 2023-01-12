var Eintrag = /** @class */ (function () {
    function Eintrag(wer, was, wo, wann) {
        this.wer = wer;
        this.was = was;
        this.wo = wo;
        this.wann = wann;
    }
    return Eintrag;
}());
var ShoppingList = /** @class */ (function () {
    function ShoppingList() {
        this.items = [];
    }
    ShoppingList.prototype.addItem = function (item) {
        this.items.unshift(item);
    };
    ShoppingList.prototype.deleteItem = function (item) {
        var index = this.items.indexOf(item);
        if (index > -1) {
            this.items.splice(index, 1);
        }
    };
    return ShoppingList;
}());
var list = new ShoppingList();
var express = require("express");
var app = express();
var path = require("path");
var port = 8080;
app.listen(port);
console.log("Server lissening on port " + port);
var fs = require('fs');
var content = fs.readFileSync('Logs.json', 'utf8');
var Logs;
if (Object.keys(content).length != 0) {
    Logs = JSON.parse(content);
    list.items = Logs.items;
}
else {
    Logs = {};
}
function createTableRows(list) {
    var rows = '';
    for (var i = 0; i < list.items.length; i++) {
        rows += "<tr>\n      <td>".concat(list.items[i].wer, "</td>\n      <td>").concat(list.items[i].was, "</td>\n      <td>").concat(list.items[i].wo, "</td>\n      <td>").concat(list.items[i].wann, "</td>\n      <td><button class=\"delbutton\">X</button></td>\n    </tr>");
    }
    //<td class="delbutton"><button class="delbutton">X</button></td>
    return rows;
}
//Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//READ
app.get("/", function (req, res) {
    console.log((path.join(__dirname + "/index.html")));
    res.sendFile(path.join(__dirname + "/index.html")); //Enables access to Index.html and everything in the folder public
});
app.get("/read", function (req, res) {
    console.log("Table is displayed");
    res.send(createTableRows(list));
});
//Create
app.post("/create", function (req, res) {
    var eintrag = new Eintrag(req.body.wer, "", "", req.body.wann);
    list.addItem(eintrag);
    res.send(createTableRows(list));
});
//UPDATE
app.put("/update", function (req, res) {
    list.items = [];
    for (var i = 0; i < req.body.length; i++) {
        var eintrag = new Eintrag(req.body[i][0], req.body[i][1], req.body[i][2], req.body[i][3]);
        if (req.body[i][0] === "" && req.body[i][1] === "" && req.body[i][2] === "" && req.body[i][3] === "")
            continue;
        list.addItem(eintrag);
    }
    console.log(list);
    fs.writeFileSync('Logs.json', JSON.stringify(list));
    res.send();
});
//DELETE
app.delete("/del", function (req, res) {
    var eintrag = new Eintrag(req.body.wer, req.body.was, req.body.wo, req.body.wann);
    for (var i = 0; i < req.body.length; i++) {
        if (eintrag.wer === req.body[i][0] && eintrag.was === req.body[i][1] && req.body.wo === req.body[i][2] && req.body.wann === req.body[i][3]) {
            list.deleteItem(eintrag);
            console.log("deleted");
        }
    }
    console.log(list);
    fs.writeFileSync('Logs.json', JSON.stringify(list));
    res.send();
});
