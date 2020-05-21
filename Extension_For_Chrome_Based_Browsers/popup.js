document.getElementById("generate_new").addEventListener("click", function(){
    chrome.runtime.sendMessage("ncas_generate_new_identity", (response) => {
        console.log(response);
    });
});

document.getElementById("export_keys").addEventListener("click", function(){
    chrome.runtime.sendMessage("ncas_get_identity", (response) => {
        console.log(response);
    });
});

document.getElementById("load_keys").addEventListener("click", function(){
    var input = document.createElement('input');
input.type = 'file';

input.onchange = e => { 
   var file = e.target.files[0]; 
   var fileReader = new FileReader(); 
    fileReader.onload = function (e) { 
        chrome.runtime.sendMessage(fileReader.result, (response) => {
            if(response === "true")
                alert("Changed!");
        });
    } 
    fileReader.readAsText(file); 
}

input.click();
input.remove();
});