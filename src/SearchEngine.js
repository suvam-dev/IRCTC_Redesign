// Returns the correct data-2 path based on current page location.
function getDataPath(filename) {
  const isPage = window.location.pathname.includes("/pages/");
  return (isPage ? "../data-2/" : "./data-2/") + filename;
}

// Escapes HTML-sensitive characters for safe template rendering.
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Loads both station and train datasets from data-2.
async function loadDataSets() {
  const [stationsRes, trainsRes] = await Promise.all([
    fetch(getDataPath("stations.json")),
    fetch(getDataPath("trains.json")),
  ]);

  if (!stationsRes.ok) throw new Error(`stations.json -> HTTP ${stationsRes.status}`);
  if (!trainsRes.ok) throw new Error(`trains.json -> HTTP ${trainsRes.status}`);

  const stationsJson = await stationsRes.json();
  const trainsJson = await trainsRes.json();

  return {
    stations: Array.isArray(stationsJson.stations) ? stationsJson.stations : [],
    trains: Array.isArray(trainsJson.trains) ? trainsJson.trains : [],
  };
}

// Builds a station-code to station-name map.
function buildStationMap(stations) {
  return new Map(
    stations.map((s) => [String(s.code || "").toUpperCase(), s.name || ""]),
  );
}

// Populates station suggestions into the datalist in main form.
async function initStationOptionList() {
  const datalist = document.querySelector("#stations");
  const sourceInput = document.querySelector("#Source");
  const destinationInput = document.querySelector("#Destination");

  if (!datalist || !sourceInput || !destinationInput) return;

  try {
    const { stations } = await loadDataSets();

    datalist.innerHTML = stations
      .map((s) => {
        const name = escapeHtml(s.name || "");
        const code = escapeHtml(s.code || "");
        return `<option value="${name}" label="${name} (${code})"></option>`;
      })
      .join("");
  } catch (err) {
    console.error("Option list load error:", err);
  }
}

// Resolves user-entered station text to a station code, using code or name matching.
function resolveStationCode(inputValue, stations) {
  const query = String(inputValue || "").trim().toUpperCase();
  if (!query) return null;

  const exactCode = stations.find(
    (s) => String(s.code || "").toUpperCase() === query,
  );
  if (exactCode) return String(exactCode.code || "").toUpperCase();

  const exactName = stations.find(
    (s) => String(s.name || "").trim().toUpperCase() === query,
  );
  if (exactName) return String(exactName.code || "").toUpperCase();

  const partialName = stations.find((s) =>
    String(s.name || "").toUpperCase().includes(query),
  );
  if (partialName) return String(partialName.code || "").toUpperCase();

  return null;
}

// Finds stop index by station code in a train schedule.
function findStopIndex(schedule, code) {
  return schedule.findIndex(
    (stop) => String(stop.station_code || "").toUpperCase() === code,
  );
}

// Creates a view model for card rendering from data-2 train object.
function toCardModel(train, stationMap, fromIndex = null, toIndex = null) {
  const schedule = Array.isArray(train.schedule) ? train.schedule : [];
  const startIndex = Number.isInteger(fromIndex) && fromIndex >= 0 ? fromIndex : 0;
  const endIndex =
    Number.isInteger(toIndex) && toIndex >= 0 ? toIndex : Math.max(schedule.length - 1, 0);

  const fromStop = schedule[startIndex] || {};
  const toStop = schedule[endIndex] || {};

  const fromCode = String(fromStop.station_code || "").toUpperCase();
  const toCode = String(toStop.station_code || "").toUpperCase();

  const fromName = stationMap.get(fromCode) || fromCode || "-";
  const toName = stationMap.get(toCode) || toCode || "-";

  const fromDistance = typeof fromStop.distance === "number" ? fromStop.distance : null;
  const toDistance = typeof toStop.distance === "number" ? toStop.distance : null;

  const durationDistance =
    fromDistance !== null && toDistance !== null && toDistance >= fromDistance
      ? `${toDistance - fromDistance} km`
      : "N/A";

  return {
    id: train.train_id,
    name: train.train_name,
    departure: fromStop.time || "--:--",
    arrival: toStop.time || "--:--",
    fromName,
    toName,
    durationDistance,
    runsOn: Array.isArray(train.runs_on) ? train.runs_on : [],
  };
}

// Generates a train result card HTML.
function renderTrainCard(model) {
  const trainData = encodeURIComponent(
    JSON.stringify({
      name: model.name,
      number: model.id,
      departureTime: model.departure,
      arrivalTime: model.arrival,
      duration: model.durationDistance,
      source: model.fromName,
      destination: model.toName,
      date: new Date().toLocaleDateString(),
    }),
  );

  const runSet = new Set(model.runsOn.map((d) => String(d).slice(0, 3).toUpperCase()));
  const dayClass = (abbr) => (runSet.has(abbr) ? "text-gray-800" : "");

  return `
        <div class="flex flex-col bg-white shadow-lg w-full max-w-4xl p-6 rounded-2xl mx-auto border border-gray-100 text-gray-800 mb-6 transition-transform hover:scale-[1.01]">
            <div class="flex flex-row gap-3 items-center mb-6 w-full">
                <div class="bg-black text-white rounded-lg py-1 px-3 font-bold text-sm tracking-wide shadow-sm">
                    ${escapeHtml(model.id)}
                </div>
                <div class="font-extrabold text-xl text-gray-900">
                    ${escapeHtml(model.name)}
                </div>
            </div>
            <div class="relative flex flex-row justify-between items-center w-full py-2 mb-6">
                <hr class="absolute w-full h-[2px] bg-gray-200 border-0 top-1/2 -z-0">
                <div class="bg-white px-4 font-bold text-gray-800 z-10 flex flex-col items-center">
                    <span class="text-sm text-gray-500 mb-1">Departure</span>
                    <span class="text-lg">${escapeHtml(model.departure)}</span>
                    <span class="text-xs font-normal text-gray-400 mt-1">${escapeHtml(model.fromName)}</span>
                </div>
                <div class="bg-white px-4 text-sm font-bold text-gray-900 z-10 py-1 border border-gray-200 rounded-full shadow-sm">
                    ${escapeHtml(model.durationDistance)}
                </div>
                <div class="bg-white px-4 font-bold text-gray-800 z-10 flex flex-col items-center">
                    <span class="text-sm text-gray-500 mb-1">Arrival</span>
                    <span class="text-lg">${escapeHtml(model.arrival)}</span>
                    <span class="text-xs font-normal text-gray-400 mt-1">${escapeHtml(model.toName)}</span>
                </div>
            </div>
            <div class="flex flex-col sm:flex-row sm:justify-between items-center gap-6 pt-4 border-t border-gray-50">
                <div class="flex gap-3 text-xs font-black text-gray-300 tracking-widest">
                    <span class="${dayClass("SUN")}">S</span>
                    <span class="${dayClass("MON")}">M</span>
                    <span class="${dayClass("TUE")}">T</span>
                    <span class="${dayClass("WED")}">W</span>
                    <span class="${dayClass("THU")}">T</span>
                    <span class="${dayClass("FRI")}">F</span>
                    <span class="${dayClass("SAT")}">S</span>
                </div>
                <button onclick="bookTrain('${trainData}')" class="bg-black hover:bg-gray-800 transition-all text-white px-10 py-3 rounded-xl font-bold text-md shadow-lg shadow-black/20 active:scale-95">
                    Book Ticket
                </button>
            </div>
        </div>
    `;
}

// Triggers route search page navigation with preserved search intent.
window.triggerSearch = function () {
  const source =
    document.querySelector("#Source")?.value ||
    document.querySelector(".from .m")?.innerText;
  const destination =
    document.querySelector("#Destination")?.value ||
    document.querySelector(".to .m")?.innerText;

  if (!source || !destination) {
    alert("Please select both source and destination.");
    return;
  }

  localStorage.setItem(
    "pendingSearch",
    JSON.stringify({
      source: source.trim(),
      destination: destination.trim(),
      type: "route",
    }),
  );

  const isRoot = !window.location.pathname.includes("/pages/");
  window.location.href = isRoot
    ? "./pages/searchresult.html"
    : "./searchresult.html";
};

// Searches train list by train id or train name.
async function searchByNumber(number) {
  const cardGrid = document.querySelector("#result");
  if (!cardGrid) return;

  cardGrid.innerHTML = `<div class="p-8 text-center font-semibold text-gray-500">Searching for Train #${escapeHtml(number)}...</div>`;

  try {
    const { trains, stations } = await loadDataSets();
    const stationMap = buildStationMap(stations);
    const query = String(number || "").trim().toUpperCase();

    const train = trains.find((t) => {
      const id = String(t.train_id || "").toUpperCase();
      const name = String(t.train_name || "").toUpperCase();
      return id === query || name.includes(query);
    });

    if (train) {
      cardGrid.innerHTML = renderTrainCard(toCardModel(train, stationMap));
    } else {
      cardGrid.innerHTML = `<div class="p-8 text-center text-gray-700 font-bold">Train #${escapeHtml(number)} not found.</div>`;
    }
  } catch (err) {
    console.error("Search error:", err);
    cardGrid.innerHTML = `<div class="p-8 text-center text-gray-700">Error loading train data.</div>`;
  }
}

// Searches trains that contain source and destination stops in order.
async function performRouteSearch(source, destination) {
  const cardGrid = document.querySelector("#result");
  if (!cardGrid) return;

  cardGrid.innerHTML = `<div class="p-8 text-center font-semibold text-gray-500">Finding trains from ${escapeHtml(source)} to ${escapeHtml(destination)}...</div>`;

  try {
    const { trains, stations } = await loadDataSets();
    const stationMap = buildStationMap(stations);

    const srcCode = resolveStationCode(source, stations);
    const dstCode = resolveStationCode(destination, stations);

    if (!srcCode || !dstCode) {
      cardGrid.innerHTML = `<div class="p-8 text-center text-gray-700 font-bold">No trains found for this route.</div>`;
      return;
    }

    const results = trains
      .map((train) => {
        const schedule = Array.isArray(train.schedule) ? train.schedule : [];
        const sIdx = findStopIndex(schedule, srcCode);
        const dIdx = findStopIndex(schedule, dstCode);
        if (sIdx >= 0 && dIdx > sIdx) {
          return toCardModel(train, stationMap, sIdx, dIdx);
        }
        return null;
      })
      .filter(Boolean);

    if (results.length > 0) {
      cardGrid.innerHTML = results.map((r) => renderTrainCard(r)).join("");
    } else {
      cardGrid.innerHTML = `<div class="p-8 text-center text-gray-700 font-bold">No trains found for this route.</div>`;
    }
  } catch (err) {
    console.error("Search error:", err);
    cardGrid.innerHTML = `<div class="p-8 text-center text-gray-700">Error loading train data.</div>`;
  }
}

// Saves selected train and routes to checkout page.
window.bookTrain = function (encodedData) {
  localStorage.setItem("selectedTrain", decodeURIComponent(encodedData));
  const isPage = window.location.pathname.includes("/pages/");
  window.location.href = isPage ? "./checkout.html" : "./pages/checkout.html";
};

// Wires all search handlers and pending search replay.
function initSearchEngine() {
  const searchBtn = document.querySelector("#search");
  const pnrInput = document.querySelector("#pnr");
  const findBtn = document.querySelector("#Find");

  initStationOptionList();

  if (searchBtn && pnrInput) {
    searchBtn.onclick = () => {
      const val = pnrInput.value.trim();
      if (val) searchByNumber(val);
    };

    pnrInput.onkeypress = (e) => {
      if (e.key === "Enter") searchBtn.onclick();
    };
  }

  if (findBtn) {
    findBtn.onclick = () => {
      const s = document.querySelector("#Source")?.value;
      const d = document.querySelector("#Destination")?.value;
      if (s && d) performRouteSearch(s, d);
    };
  }

  const pendingSearch = localStorage.getItem("pendingSearch");
  if (pendingSearch && window.location.pathname.includes("searchresult.html")) {
    const { source, destination } = JSON.parse(pendingSearch);
    localStorage.removeItem("pendingSearch");
    performRouteSearch(source, destination);
  }
}

// Starts search engine initialization on DOM readiness.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSearchEngine);
} else {
  initSearchEngine();
}
