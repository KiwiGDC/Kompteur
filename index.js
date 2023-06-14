console.log("MKOUNTER");

Storage.prototype.setObjet = function(cle, objet)
{
 this.setItem(cle, JSON.stringify(objet));
}

Storage.prototype.getObject = function(cle)
{
    return JSON.parse(localStorage.getItem(cle));
}


if(localStorage.getObject('compteurs') == undefined)
{
    console.log("Initialisation des compteurs...");
    let local = {"compteurs": []};
    localStorage.clear();
    localStorage.setObjet('compteurs', local);
}


Storage.prototype.changeCompteur = function(json)
{
    let local = localStorage.getObject('compteurs');
    local.compteurs = local.compteurs.map(c => { if(c.title == json.title) {return json}else{return c}});
    localStorage.setObjet('compteurs', local);
}

function createJsonCompteur(data)
{
    let arr = [];
    data.controller.forEach(el => {
        arr.push({
            "label": el.label,
            "name": el.name,
            "action": {
                "command":"calcul",
                "calcul":el.calcul
            }})
    });
    return {
        "title": data.new_title,
        "type": "UNDEFINED",
        "date_created": (new Date().toLocaleDateString("fr") + " " +  new Date().toLocaleTimeString("fr")),
        "element": parseFloat(data.new_element),
        "suffix": data.new_suffix,
        "controllers": arr
    }
}

function reCreateAllCompteur() {
    let i = 0;
    compteurs.clearChildren();
    if(localStorage.getObject('compteurs') != undefined)
    {
        localStorage.getObject('compteurs').compteurs.forEach(compteur => {
        
            createCompteur(compteur, i);
            i++;
        });   
    }
  
}






Storage.prototype.deleteCompteur = function(json)
{
    let local = localStorage.getObject('compteurs');

    
    const removeById = (arr, id) => {
    let requiredIndex = -1;
    arr.forEach((el, k) => {
            if(el.title == id)
            {
                requiredIndex = k;
                
            }
    });
    if(requiredIndex >= 0)
    {
        if(arr.length == 1)
        {
            local.compteurs = [];
        }
        arr.splice(requiredIndex, 1);
    }


    };

    removeById(local.compteurs, json.title);
    
    localStorage.setObjet('compteurs', local);
    reCreateAllCompteur()

}







if( typeof Element.prototype.clearChildren === 'undefined' ) {
    Object.defineProperty(Element.prototype, 'clearChildren', {
      configurable: true,
      enumerable: false,
      value: function() {
        while(this.firstChild) this.removeChild(this.lastChild);
      }
    });
}




const templateModal = `
<div id="modal">
    <button id="close_modal">X</button>
    <h1>[MODAL_TITLE]</h1>
    <h2>[MODAL_SUBTITLE]</h2>
</div>
`



const template = `    
<div class="compteur">
    <div class="header">
    calcul
        <h1>[TITLE]</h1>
        <div class="mini-controller">
        </div>
        <span class="label">[CREATION]</span>
    </div>
    <div class="body">
    </div>
    <div class="controller">

    </div>
</div>`;




Document.prototype.createElementFromString = function(htmlString) {
    let div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}


const controllerModal = {"bg": document.getElementById('modal-background'), "modal": undefined}
controllerModal.hideModal = function(){
    this.bg.style.display = "none";
    this.modal.style.display = "none";
}



controllerModal.showModal = function(node){

    
    this.bg.style.display = "block";
    this.modal.style.display = "block";

}



let newBtn = document.getElementById('new');
let importBtn = document.getElementById('import');




importBtn.addEventListener('click', function(ev) {

    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => { 
        var file = e.target.files[0]; 
        var reader = new FileReader();
        reader.readAsText(file,'UTF-8');
     
        // here we tell the reader what to do when it's done reading...
        reader.onload = readerEvent => {
           var content = readerEvent.target.result; // this is the content!
           let jsonContent = JSON.parse(content);
           let local = localStorage.getObject('compteurs');
           local.compteurs.push(jsonContent);
           localStorage.setObjet('compteurs', local);
           reCreateAllCompteur();
        }
     
     }

    input.click();

});


newBtn.addEventListener('click', function(ev) {



    let controllerHtml = `
    <div>
        <form>
            <label for="new_title">Titre :</label>
            <input type='text' name="new_title" placeholder="Title"/>

            <label for="element">Element :</label>
            <input type='text' name="new_element" placeholder="Default value"/>

            <label for="new_suffix">Suffix</label>
            <input type='text' name="new_suffix" placeholder="Suffix"/>




        </form>

    </div>`

    let htmlCreate = document.createElementFromString(templateModal.replace("[MODAL_TITLE]", "New counter :").replace("[MODAL_SUBTITLE]", "Controllers :"));
    controllerModal.modal = htmlCreate; 
    htmlCreate.appendChild(document.createElementFromString(controllerHtml));
    controllerModal.modal.querySelector('#close_modal').addEventListener('click', ev => controllerModal.hideModal());
    controllerModal.bg.appendChild(controllerModal.modal);

    let addController = document.createElementFromString('<input type="button" value="Add controller"/>');
    let i = 0;
    addController.addEventListener('click', ev => 
    {
        let controllerName = function(name){ return 'new_controller_' + i + '_' + name};
        let htmlController = `<div>
            <label for="`+ controllerName("label") +`">Label</label>
            <input type='text' name="`+ controllerName("label") +`" placeholder="Label"/>

            <label for="`+ controllerName("name") +`">Nom</label>
            <input type='text' name="`+ controllerName("name") +`" placeholder="Name"/>

            <label for="`+ controllerName("calcul") +`">Calcul</label>
            <input type='text' name="`+ controllerName("calcul") +`" placeholder="Calc"/>
            </div>
        `;

        htmlCreate.querySelector("form").appendChild(document.createElementFromString(htmlController));
        i++
    });

    htmlCreate.querySelector("form").appendChild(addController);
    htmlCreate.querySelector("form").appendChild(document.createElementFromString('<input type="submit" value="Add"/>'))

    htmlCreate.querySelector("form").addEventListener('submit', ev => 
    {
        ev.preventDefault();

        let data = new FormData(ev.target);
        let arr = {};
        data.forEach((el, k) => {
            if(k.split("_")[1] == "controller")
            {

                let s = k.split("_");
                arr["controller"] = arr["controller"] || [];
                arr["controller"][s[2]] = arr["controller"][s[2]] || {};
                arr["controller"][s[2]][s[3]] = el;
            }
            else 
            {
                arr[k] = (el)

            }
        });
        let compteur = localStorage.getObject('compteurs');
        compteur.compteurs.push(createJsonCompteur(arr));
        localStorage.setObjet('compteurs', compteur);

        reCreateAllCompteur();

        controllerModal.hideModal();

    });

    controllerModal.showModal("Settings");




});






function download(content, fileName, contentType) {
    let a = document.createElement("a");
    let file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

let compteurs = document.getElementsByClassName('compteurs')[0];



Document.prototype.createminiController = function(type, json)
{
    let kode_minicontroller_export = '<button class="setting"><i class="bi bi-cloud-arrow-down"></i></button>';
    let kode_minicontroller_setting = '<button class="setting"><i class="bi bi-gear"></i></button>';
    switch (type) {
        case "export":
            var html = document.createElementFromString(kode_minicontroller_export);
            html.addEventListener('click', function(ev){
                download(JSON.stringify(json, null, "\t"), "export.json", "text/json");
            });
            return html;
            break;
        case "setting":
            var html = document.createElementFromString(kode_minicontroller_setting);
            html.addEventListener('click', function(ev)
            {
                let htmlController = createSettingsModifier(json); 
                controllerModal.modal = htmlController; 
                controllerModal.modal.querySelector('#close_modal').addEventListener('click', ev => controllerModal.hideModal());
                controllerModal.bg.appendChild(controllerModal.modal);
                controllerModal.showModal("Settings");
            });
            return html;
            break;
        default:
            break;
    }
}


Document.prototype.createController = function(body, title, id, classsup, cmd, json)
{
    let kode_controller = '<button id="[CONTROLLER_ID]">[CONTROLLER_NAME]</button>';
    let html = document.createElementFromString(kode_controller.replace("[CONTROLLER_NAME]", title).replace("[CONTROLLER_ID]", id));
    if(classsup != undefined){
        html.classList.add(classsup);

    }
    if(cmd.command == "calcul")
    {
        html.addEventListener('click', function(ev){
            let t = ev.target;
            while(t && !t.id) t = t.parentNode;
            let text = body.childNodes[1];
            let nEl = eval(json.element + cmd.calcul);
            text.innerHTML = nEl.toFixed(2) + json.suffix;
            json.element = nEl;
            localStorage.changeCompteur(json);
        });
    }
    else if(cmd.command == "action")
    {
        html.addEventListener('click', function(ev){
            switch (cmd.action) {
                case "delete":
                    localStorage.deleteCompteur(json);
                    break;
                case "set":
                    alert("Soon...");
                default:
                    break;
            }
        });
    }

    return html;

  
}

Document.prototype.createCountIndex = function(into)
{
    let kode_element = '<p>[INTO]</p>';
    return document.createElementFromString(kode_element.replace("[INTO]", into));
}





function createSettingsModifier(json)
{
    // Controllers, 
    // Value,

    let htmlString = templateModal
    .replace("[MODAL_TITLE]", "Modification du compteur :")
    .replace("[MODAL_SUBTITLE]", json.title);
    let html = document.createElementFromString(htmlString);
    let element = document.createElementFromString('<p style="text-align: center;"></p>');
    let type = document.createElement("p");

    type.innerHTML = "";
    element.innerHTML = json.element;
    html.appendChild(element);
    html.appendChild(type);
    let i = 0;
    let htmlController = document.createElementFromString("<div></div>");
    html.appendChild(htmlController);
    htmlController.appendChild(document.createElement("form"));
    json.controllers.forEach(controller => {
        let controllerID = function(name){return i + "_" + name};
        let controllerHtml = `<div>
            <label for="` + controllerID("name") + `">Controller name :</label>
            <input type='text' name="` +  controllerID("name") + `" value="` + controller.name + `" />

            <label for="` + controllerID("label") + `">Controller label :</label>
            <input type='text' name="` +  controllerID("label") + `" value="` + controller.label + `" />

            <label for="` + controllerID("calcul") + `">Controller calcul :</label>
            <input type='text' name="` +  controllerID("calcul") + `" value="` + controller.action.calcul + `" />
        </form></div>`;
        htmlController.querySelector("form").appendChild(document.createElementFromString(controllerHtml));
        i++;
    });

    let submitModifier = document.createElementFromString('<input type="submit"/>');
    htmlController.querySelector("form").appendChild(submitModifier);
    htmlController.querySelector("form").addEventListener('submit', ev => 
    {
        ev.preventDefault();

        let data = new FormData(ev.target);
        let arrayValue = {controllers:[]};
        data.forEach((v, k) => {
            let n = k.split("_");
            var valueKey = n[1];
            if(valueKey == "calcul")
            {
                arrayValue.controllers[n[0]] = arrayValue.controllers[n[0]] || {};
                arrayValue.controllers[n[0]]["action"] = {command: "calcul"};
                arrayValue.controllers[n[0]]["action"]["calcul"] = v;
            }
            else 
            {
                arrayValue.controllers[n[0]] = arrayValue.controllers[n[0]] || {};
                arrayValue.controllers[n[0]][valueKey] = v;
            }

        });
        json.controllers = arrayValue.controllers;
        localStorage.changeCompteur(json);
        controllerModal.hideModal();
        reCreateAllCompteur();
    });
    
    return html;



    
}


function createCompteur(compteur, i)
{
    let htmlT;
    htmlT = template.replace("[TITLE]", compteur.title);
    htmlT = htmlT.replace("[CREATION]", compteur.date_created);
    let html = document.createElementFromString(htmlT);

    let controllerminiHtml = html.getElementsByClassName("mini-controller")[0];
    let controllerHtml = html.getElementsByClassName("controller")[0];
    let body = html.getElementsByClassName("body")[0];

    controllerminiHtml.appendChild(document.createminiController("export", compteur));
    controllerminiHtml.appendChild(document.createminiController("setting", compteur));
    compteur.controllers.forEach(controller => {

        controllerHtml.appendChild(document.createController(body, controller.label, i + "_" + controller.name, undefined, controller.action, compteur));
    });

    body.appendChild(document.createCountIndex(compteur.element.toFixed(2) + compteur.suffix));
    controllerHtml.appendChild(document.createController(body, '<i class="bi bi-arrow-clockwise"></i>', i + "_reset", undefined, {"command": "calcul", "calcul":"*0"}, compteur));
    controllerHtml.appendChild(document.createController(body, '<i class="bi bi-trash3-fill"></i>', i + "_trash", "reset", {"command": "action", "action": "delete"}, compteur));
    controllerHtml.appendChild(document.createController(body, '<i class="bi bi-x-diamond"></i>', i + "_set", "success", {"command": "action", "action": "set", compteur}));

    compteurs.appendChild(html);

}







reCreateAllCompteur();


// localStorage.clear();
// fetch('./test.json')
//     .then((response) => response.json())
//     .then((json) => {

//         localStorage.setObjet('compteurs', json);
    

//         let i = 0;
//         localStorage.getObject('compteurs').compteurs.forEach(compteur => {
            
//             createCompteur(compteur, i);
//             i++;
//         });    

//     });