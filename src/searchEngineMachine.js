//loading data from json files
import trains from "../data-2/trains.json" with { type: "json" };
import stations from "../data-2/stations.json" with { type: "json" };

console.log(stations)
console.log(trains)
console.log(typeof trains)

//main data frame we will work on....
const trainsData = trains.trains;
const stationsData = stations.stations;

//Making a new data frame Stations=['Station_code Stataion_name',... ]
const stations_df = stationsData.map(s => `${s.code} ${s.name}`);
console.log(stations_df);
console.log(typeof stations_df);

//making a new element in the trains data by updating station code with the stations_df
const station_code_map = ((code) => {
    for (let x of stations_df)
        if (x.includes(code))
            return x;
})
console.log(station_code_map("KGP"))
const trains_df = trainsData.map(t => {
    return {
        train_id: t.train_id,
        train_name: t.train_name,
        price_per_km: t.price_per_km,
        runs_on: t.runs_on,
        schedule: t.schedule.map(s => {
            return {
                station_code: station_code_map(s.station_code),
                time: s.time,
                distance: s.distance,
            }
        })
    }
});
//the final dataset for the trains
console.log(trains_df);
const list_container = document.querySelector("#list-container")
const options = (() => {
    list_container.innerHTML = ""
    stations_df.forEach(element => {
        const option = document.createElement("option")
        option.value = element
        list_container.appendChild(option)
        console.log(option);
    });
})
options();
//dataset Working


const SearchEngine = (() => {
    //date inputing logic
    const date = document.querySelector("#date").value;
    const a = new Date(date);
    let day = a.getDay();
    day = ["Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",][day];
    console.log(day);
    //getting souce and destination 
    const source = document.querySelector("#source").value;
    const destination = document.querySelector("#destination").value;
    console.log(source);
    console.log(destination);
    const result = document.querySelector("#result")
    if (source == destination || source == "" || destination == "" || day === undefined) {
        result.innerHTML = "<div class='flex justify-center text-red-500 font-bond'>Error in input,change the input</div>"
        return;
    }
    const validTrains = strains(source, destination, day);
    console.log(validTrains);
})

document.querySelector("#Search").addEventListener("click", SearchEngine);


function doesTrainRunOnDay(train, day) {
    return train.runs_on.includes(day);
}

function getStation(train, stationCode) {
    for (let stop of train.schedule) {
        if (stop.station_code.includes(stationCode)) {
            return stop; 
        }
    }
    
    return null; 
}

function isValidJourney(startStop, destStop) {
    if (startStop === null || destStop === null) return false;
    
    return startStop.distance < destStop.distance;
}

function strains(start, dest, day) {
    console.log("Working strains");
    const availableTrains = [];

    for (const train of trains_df) {

        if (!doesTrainRunOnDay(train, day)) continue;

        const startStop = getStation(train, start);
        const destStop = getStation(train, dest);

        if (isValidJourney(startStop, destStop)) {
            availableTrains.push(formatTrainResponse(train, startStop, destStop));
        }
    }

    return availableTrains;
}

function formatTrainResponse(train, startStop, destStop) {
    return {
        id: train.train_id,
        name: train.train_name,
        price: (destStop.distance - startStop.distance) * train.price_per_km,
        t1: startStop.time,
        t2: destStop.time,
        time: (destStop.time - startStop.time),
        start: startStop.station_code,
        dest: destStop.station_code,
        day: train.runs_on,       
    };
}

function sortByFastest(availableTrains){
    for(let i=0;i<availableTrains.length-1;i++){
        for(let j=0;j<availableTrains.length-1-i;j++){
            if(availableTrains[j].time > availableTrains[j+1].time){
                let temp = availableTrains[j];
                availableTrains[j] = availableTrains[j+1];
                availableTrains[j+1] = temp;
            }
        }   
    }
    return availableTrains;
}

function sortByCheapest(availableTrains){
    for(let i=0;i<availableTrains.length-1;i++){
        for(let j=0;j<availableTrains.length-1-i;j++){
            if(availableTrains[j].price > availableTrains[j+1].price){
                let temp = availableTrains[j];
                availableTrains[j] = availableTrains[j+1];
                availableTrains[j+1] = temp;
            }
        }   
    }
    return availableTrains;
}
