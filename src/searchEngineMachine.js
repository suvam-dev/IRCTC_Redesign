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
    const validTrains = sTrains(source, destination, day);
    for (let i = 0; i < validTrains.length; i++) {
        result.innerHTML += UIcomponentsSearch(validTrains[i]);
    }
    console.log(validTrains);
};

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

function sTrains(start, dest, day) {
    console.log("Working seraching Trains");
    const availableTrains = [];

    for (let train of trains_df) {

        if (!doesTrainRunOnDay(train, day)) continue;

        const startStop = getStation(train, start);
        const destStop = getStation(train, dest);

        if (isValidJourney(startStop, destStop)) {
            availableTrains.push(formatTrainResponse(train, startStop, destStop));
        }
    }

    return availableTrains;
}


function sortByFastest(availableTrains) {
    for (let i = 0; i < availableTrains.length - 1; i++) {
        for (let j = 0; j < availableTrains.length - 1 - i; j++) {
            if (availableTrains[j].time > availableTrains[j + 1].time) {
                let temp = availableTrains[j];
                availableTrains[j] = availableTrains[j + 1];
                availableTrains[j + 1] = temp;
            }
        }
    }
    return availableTrains;
}

function sortByCheapest(availableTrains) {
    for (let i = 0; i < availableTrains.length - 1; i++) {
        for (let j = 0; j < availableTrains.length - 1 - i; j++) {
            if (availableTrains[j].price > availableTrains[j + 1].price) {
                let temp = availableTrains[j];
                availableTrains[j] = availableTrains[j + 1];
                availableTrains[j + 1] = temp;
            }
        }
    }
    return availableTrains;
}

//Linear Search to search the data using pnr
const pnrSearch = (pnr) => {
    pnr = pnr.trim();
    if (pnr.length != 4) {
        return "Invalid PNR";
    }
    pnr = pnr.toUpperCase();
    for (var x of trains_df) if (x.train_id == pnr) return x;
    return "Invalid PNR";
};

//searching the data using pnr
document.querySelector("#pnrSearch").addEventListener("click", () => {
    const pnr = document.querySelector("#pnr").value;
    const result = document.querySelector("#result");
    result.innerHTML = UIcomponentsPNR(pnrSearch(pnr));
});

//test case
console.log(pnrSearch("L001"));

//generating options for the pnr search
const generateOptions = () => {
    const pnrlist = document.querySelector("#pnrList");
    pnrlist.innerHTML = "";
    trains_df.forEach((element) => {
        pnrlist.innerHTML += `<option value="${element.train_id}">${element.train_name}</option>`;
    });
};
generateOptions();

//making the component for the pnr search
const UIcomponentsPNR = (train) => {
    return `
    <div class="flex flex-col bg-white shadow-lg w-full max-w-4xl p-6 rounded-2xl mx-auto border border-gray-100 text-gray-800 mb-6 transition-transform hover:scale-[1.01]">

      <div class="flex flex-row gap-3 items-center mb-6 w-full">
        <div class="bg-black text-white rounded-lg py-1 px-3 font-bold text-sm tracking-wide shadow-sm">
          ${train.train_id}
        </div>
        <div class="font-extrabold text-xl text-gray-900">
          ${train.train_name}
        </div>
      </div>

      <div class="relative flex flex-row justify-between items-center w-full py-2 mb-6">
        <hr class="absolute w-full h-[2px] bg-gray-200 border-0 top-1/2 -z-0">

        <div class="bg-white px-4 font-bold text-gray-800 z-10 flex flex-col items-center">
          <span class="text-sm text-gray-500 mb-1">Departure</span>
          <span class="text-lg">${train.schedule[0].time}</span>
          <span class="text-xs font-normal text-gray-400 mt-1">${train.schedule[0].station_code}</span>
        </div>

        <div class="bg-white px-4 text-sm font-bold text-gray-900 z-10 py-1 border border-gray-200 rounded-full shadow-sm">
           ${TimeDiff(train.schedule[0].time, train.schedule[train.schedule.length - 1].time)}
        </div>

        <div class="bg-white px-4 font-bold text-gray-800 z-10 flex flex-col items-center">
          <span class="text-sm text-gray-500 mb-1">Arrival</span>
          <span class="text-lg">${train.schedule[train.schedule.length - 1].time}</span>
          <span class="text-xs font-normal text-gray-400 mt-1">${train.schedule[train.schedule.length - 1].station_code}</span>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row sm:justify-between items-center gap-6 pt-4 border-t border-gray-50">

        <div class="flex gap-3 text-xs font-black tracking-widest">
          <span class=${train.runs_on.includes("Sun") ? "text-black" : "text-gray-300"}>S</span>
          <span class=${train.runs_on.includes("Mon") ? "text-black" : "text-gray-300"}>M</span>
          <span class=${train.runs_on.includes("Tue") ? "text-black" : "text-gray-300"}>T</span>
          <span class=${train.runs_on.includes("Wed") ? "text-black" : "text-gray-300"}>W</span>
          <span class=${train.runs_on.includes("Thu") ? "text-black" : "text-gray-300"}>T</span>
          <span class=${train.runs_on.includes("Fri") ? "text-black" : "text-gray-300"}>F</span>
          <span class=${train.runs_on.includes("Sat") ? "text-black" : "text-gray-300"}>S</span>
        </div>

        <button onclick="bookTrain('dummy-train-data')" class="bg-black hover:bg-gray-800 transition-all text-white px-10 py-3 rounded-xl font-bold text-md shadow-lg shadow-black/20 active:scale-95">
          Book Ticket
        </button>
      </div>
    </div>
  `;
};


function formatTrainResponse(train, startStop, destStop) {
    return {
        id: train.train_id,
        name: train.train_name,
        price: (destStop.distance - startStop.distance) * train.price_per_km,
        t1: startStop.time,
        t2: destStop.time,
        time: TimeDiff(startStop.time, destStop.time),
        start: startStop.station_code,
        dest: destStop.station_code,
        day: train.runs_on,
    };
}

//main search ui component
const UIcomponentsSearch = (train) => {
    return `
       <div class="flex flex-col bg-white shadow-lg w-full max-w-4xl p-6 rounded-2xl mx-auto border border-gray-100 text-gray-800 mb-6 transition-transform hover:scale-[1.01]">

      <div class="flex flex-row gap-3 items-center mb-6 w-full">
        <div class="bg-black text-white rounded-lg py-1 px-3 font-bold text-sm tracking-wide shadow-sm">
          ${train.id}
        </div>
        <div class="font-extrabold text-xl text-gray-900">
          ${train.name}
        </div>
      </div>

      <div class="relative flex flex-row justify-between items-center w-full py-2 mb-6">
        <hr class="absolute w-full h-[2px] bg-gray-200 border-0 top-1/2 -z-0">

        <div class="bg-white px-4 font-bold text-gray-800 z-10 flex flex-col items-center">
          <span class="text-sm text-gray-500 mb-1">Departure</span>
          <span class="text-lg">${train.t1}</span>
          <span class="text-xs font-normal text-gray-400 mt-1">${train.start}</span>
        </div>

        <div class="bg-white px-4 text-sm font-bold text-gray-900 z-10 py-1 border border-gray-200 rounded-full shadow-sm">
          ${train.time}
        </div>

        <div class="bg-white px-4 font-bold text-gray-800 z-10 flex flex-col items-center">
          <span class="text-sm text-gray-500 mb-1">Arrival</span>
          <span class="text-lg">${train.t2}</span>
          <span class="text-xs font-normal text-gray-400 mt-1"></span>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row sm:justify-between items-center gap-6 pt-4 border-t border-gray-50">

        <div class="flex gap-3 text-xs font-black tracking-widest">
          <span class="${train.day.includes("Sun") ? "text-black" : "text-gray-300"}">S</span>
          <span class="${train.day.includes("Mon") ? "text-black" : "text-gray-300"}">M</span>
          <span class="${train.day.includes("Tue") ? "text-black" : "text-gray-300"}">T</span>
          <span class="${train.day.includes("Wed") ? "text-black" : "text-gray-300"}">W</span>
          <span class="${train.day.includes("Thu") ? "text-black" : "text-gray-300"}">T</span>
          <span class="${train.day.includes("Fri") ? "text-black" : "text-gray-300"}">F</span>
          <span class="text-gray-300">S</span>
        </div>

        <button onclick="bookTrain('dummy-train-data')" class="bg-black hover:bg-gray-800 transition-all text-white px-10 py-3 rounded-xl font-bold text-md shadow-lg shadow-black/20 active:scale-95">
          Book Ticket
        </button>
      </div>
    </div>`
}


const TimeDiff = (t1, t2) => {
    const [h1, m1] = t1.split(":");
    const [h2, m2] = t2.split(":");
    const t1InMinutes = parseInt(h1) * 60 + parseInt(m1);
    const t2InMinutes = parseInt(h2) * 60 + parseInt(m2);
    let diff = t2InMinutes - t1InMinutes;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}h ${minutes}m`;
}