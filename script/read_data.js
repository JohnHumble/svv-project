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

        // check to see what kind of data to use
        let mult_sat = lines[0].length == 69;
        let inc = 2 + mult_sat;

        for (let i = 0; i < lines.length; i += inc) {
            let sat = parseData(lines[i + mult_sat], lines[i + mult_sat])

            // if satellite is new, add it
            if (sats[sat.number] == undefined) {
                // create a new set of satellite locations
                sats[sat.number] = []
            }
            
            // add data object to the list
            sats[sat.number].push(sat);
        }
    }
    fr.readAsText(file);
    console.log(sats)
    worldMap.updateSatellites(sats)
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
                '2':"."+line1.substring(44, 52).split(" ").join(""),
            },
        'bstar':"."+line1.substring(53, 61).split(" ").join(""),
        'ephem_type':line1.substring(62,63),
        'el_num':line1.substring(64, 68),
        'check1':line1.substring(68, 69),
        'inclination':line2.substring(8,16),
        'r_ascension':line2.substring(17,25),
        'eccentricity':'.'+line2.substring(26,33).split(" ").join(""),
        'perigee':line2.substring(34, 42),
        'm_anomaly':line2.substring(43,51),
        'm_motion':line2.substring(52,63),
        'rev_num':line2.substring(63,68),
        'check2':line2.substring(69),
    }
}

function concatData(sats) {
    let sat_names = Object.getOwnPropertyNames(sats)

    let out = [];

    sat_names.forEach(sat_name => {
        out[sat_name] = concat(sats[sat_name]);
    });
    return out;
}

function concat(sat_data) {
    let names = Object.getOwnPropertyNames(sat_data[0])
    let sat = {};

    names.forEach(field => {
        sat[field] = createList(sat_data, field);
    });

    return sat;
}

function createList(data, field) {
    let list = [];
    data.forEach(el => {
        list.push(el[field]);
    });
    return list
}
