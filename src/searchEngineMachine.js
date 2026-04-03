//loading data from json files
import trains from "../data-2/trains.json" with { type: "json" };
import stations from "../data-2/stations.json" with { type: "json" };

console.log(stations);
console.log(trains);
console.log(typeof trains);

//main data frame we will work on....
const trainsData = trains.trains;
const stationsData = stations.stations;

//Making a new data frame Stations=['Station_code Stataion_name',... ]
const stations_df = stationsData.map((s) => `${s.code} ${s.name}`);
console.log(stations_df);
console.log(typeof stations_df);

//making a new element in the trains data by updating station code with the stations_df
const station_code_map = (code) => {
    for (let x of stations_df) if (x.includes(code)) return x;
};
console.log(station_code_map("KGP"));
const trains_df = trainsData.map((t) => {
    return {
        train_id: t.train_id,
        train_name: t.train_name,
        price_per_km: t.price_per_km,
        runs_on: t.runs_on,
        schedule: t.schedule.map((s) => {
            return {
                station_code: station_code_map(s.station_code),
                time: s.time,
                distance: s.distance,
            };
        }),
    };
});
//the final dataset for the trains
console.log(trains_df);
const list_container = document.querySelector("#list-container");
const options = () => {
    list_container.innerHTML = "";
    stations_df.forEach((element) => {
        const option = document.createElement("option");
        option.value = element;
        list_container.appendChild(option);
        console.log(option);
    });
};
options();
//dataset Working

const SearchEngine = () => {
    //date inputing logic
    const date = document.querySelector("#date").value;
    const a = new Date(date);
    let day = a.getDay();
    day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day];
    console.log(day);
    //getting souce and destination
    const source = document.querySelector("#source").value;
    const destination = document.querySelector("#destination").value;
    console.log(source);
    console.log(destination);
    const result = document.querySelector("#result");
    if (
        source == destination ||
        source == "" ||
        destination == "" ||
        day === undefined
    ) {
        result.innerHTML =
            "<div class='flex justify-center text-red-500 font-bond'>Error in input,change the input</div>";
        return;
    }
    const valiTrains = findTrains(source, destination, day);
    console.log(validTrains);
};

document.querySelector("#Search").addEventListener("click", SearchEngine);

