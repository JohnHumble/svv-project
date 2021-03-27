// read in the data found in stations.txt
const fileSelector = document.getElementById("data");
fileSelector.addEventListener('change', (event) => {
    console.log(event.target.files[0])
    readFile(event.target.files[0])
})

// reads a file and logs the output
function readFile(file){
    var fr = new FileReader();
    fr.onload = function(e) {
        console.log(e.target.result);

        // TODO make this extract satellite position and orientation
    }
    fr.readAsText(file);
}
