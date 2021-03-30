// read in the data found in stations.txt
const fileSelector = document.getElementById("data");
let data;
fileSelector.addEventListener('change', (event) => {
    console.log(event.target.files[0])
    data = readFile(event.target.files[0])
})

// reads a file and logs the output
function readFile(file){
    let fr = new FileReader();

    var sats = Object();
    fr.onload = (e) => {
        let res = e.target.result;

        let lines = res.split("\n")

        for (let i = 0; i < lines.length; i +=3) {
            // TODO make this extract satellite position and orientation
            // first line is satellite name

            
            // if satellite is new, add it
            if (sats[lines[i]] == undefined) {
                // create a new set of satellite locations
                sats[lines[i]] = []
            }
            sats[lines[i]].push(parseData(lines[i+1], lines[i+2]))

            // second line is
        }
    }
    fr.readAsText(file);
    console.log(sats)
    return sats
}

function parseData(line1, line2) {

    return {
        'number':line1.substring(2, 7),
        'classification':line1.substring(7, 8),
        'international_designator':{
                'year':line1.substring(9,11),
                'number':line1.substring(11,14),
                'piece':line1.substring(14,17),
            },
        'epoch':{
                'year':line1.substring(18,20),
                'day':line1.substring(20,32),
            },
        'd_mean':{
                '1':line1.substring(33, 43),
                '2':"."+line1.substring(44, 52),
            },
        'bstar':"."+line1.substring(53, 61),
        'ephem_type':line1.substring(62,63),
        'el_num':line1.substring(64, 68),
        'check1':line1.substring(68, 69),
        'inclination':line2.substring(8,16),
        'r_ascension':line2.substring(17,25),
        'eccentricity':'.'+line2.substring(26,33),
        'perigee':line2.substring(34, 42),
        'm_anomaly':line2.substring(43,51),
        'm_motion':line2.substring(52,63),
        'rev_num':line2.substring(63,68),
        'check2':line2.substring(69),
    }
}

