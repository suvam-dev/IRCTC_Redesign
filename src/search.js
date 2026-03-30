function getDataPath(filename) {
  const isPage = window.location.pathname.includes("/pages/");
  return (isPage ? "../data/" : "./data/") + filename;
}

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

async function searchByNumber(number) {
  const cardGrid = document.querySelector("#result");
  if (!cardGrid) return;

  cardGrid.innerHTML = `<div class="p-8 text-center font-semibold text-gray-500">Searching for Train #${number}...</div>`;

  try {
    const response = await fetch(getDataPath("trains.json"));
    const data = await response.json();
    const train = data.features.find((x) => x.properties.number === number);

    if (train) {
      cardGrid.innerHTML = renderTrainCard(train.properties);
    } else {
      cardGrid.innerHTML = `<div class="p-8 text-center text-gray-700 font-bold">Train #${number} not found.</div>`;
    }
  } catch (err) {
    console.error("Search error:", err);
    cardGrid.innerHTML = `<div class="p-8 text-center text-gray-700">Error loading train data.</div>`;
  }
}

async function performRouteSearch(source, destination) {
  const cardGrid = document.querySelector("#result");
  if (!cardGrid) return;

  cardGrid.innerHTML = `<div class="p-8 text-center font-semibold text-gray-500">Finding trains from ${source} to ${destination}...</div>`;

  try {
    const response = await fetch(getDataPath("trains.json"));
    const data = await response.json();
    const s = source.toUpperCase();
    const d = destination.toUpperCase();

    const results = data.features.filter((x) => {
      const props = x.properties;
      const from = (props.from_station_name || "").toUpperCase();
      const to = (props.to_station_name || "").toUpperCase();
      return from.includes(s) && to.includes(d);
    });

    if (results.length > 0) {
      cardGrid.innerHTML = results
        .map((r) => renderTrainCard(r.properties))
        .join("");
    } else {
      cardGrid.innerHTML = `<div class="p-8 text-center text-gray-700 font-bold">No trains found for this route.</div>`;
    }
  } catch (err) {
    console.error("Search error:", err);
    cardGrid.innerHTML = `<div class="p-8 text-center text-gray-700">Error loading train data.</div>`;
  }
}

function renderTrainCard(props) {
  const trainData = encodeURIComponent(
    JSON.stringify({
      name: props.name,
      number: props.number,
      departureTime: props.departure,
      arrivalTime: props.arrival,
      duration: `${props.duration_h}h ${props.duration_m}m`,
      source: props.from_station_name,
      destination: props.to_station_name,
      date: new Date().toLocaleDateString(),
    }),
  );

  return `
        <div class="flex flex-col bg-white shadow-lg w-full max-w-4xl p-6 rounded-2xl mx-auto border border-gray-100 text-gray-800 mb-6 transition-transform hover:scale-[1.01]">
            <div class="flex flex-row gap-3 items-center mb-6 w-full">
                <div class="bg-black text-white rounded-lg py-1 px-3 font-bold text-sm tracking-wide shadow-sm">
                    ${props.number}
                </div>
                <div class="font-extrabold text-xl text-gray-900">
                    ${props.name}
                </div>
            </div>
            <div class="relative flex flex-row justify-between items-center w-full py-2 mb-6">
                <hr class="absolute w-full h-[2px] bg-gray-200 border-0 top-1/2 -z-0">
                <div class="bg-white px-4 font-bold text-gray-800 z-10 flex flex-col items-center">
                    <span class="text-sm text-gray-500 mb-1">Departure</span>
                    <span class="text-lg">${props.departure}</span>
                    <span class="text-xs font-normal text-gray-400 mt-1">${props.from_station_name}</span>
                </div>
                <div class="bg-white px-4 text-sm font-bold text-gray-900 z-10 py-1 border border-gray-200 rounded-full shadow-sm">
                    ${props.duration_h}h ${props.duration_m}m
                </div>
                <div class="bg-white px-4 font-bold text-gray-800 z-10 flex flex-col items-center">
                    <span class="text-sm text-gray-500 mb-1">Arrival</span>
                    <span class="text-lg">${props.arrival}</span>
                    <span class="text-xs font-normal text-gray-400 mt-1">${props.to_station_name}</span>
                </div>
            </div>
            <div class="flex flex-col sm:flex-row sm:justify-between items-center gap-6 pt-4 border-t border-gray-50">
                <div class="flex gap-3 text-xs font-black text-gray-300 tracking-widest">
                    <span class="${props.runs_on_sun === "Y" ? "text-gray-800" : ""}">S</span>
                    <span class="${props.runs_on_mon === "Y" ? "text-gray-800" : ""}">M</span>
                    <span class="${props.runs_on_tue === "Y" ? "text-gray-800" : ""}">T</span>
                    <span class="${props.runs_on_wed === "Y" ? "text-gray-800" : ""}">W</span>
                    <span class="${props.runs_on_thu === "Y" ? "text-gray-800" : ""}">T</span>
                    <span class="${props.runs_on_fri === "Y" ? "text-gray-800" : ""}">F</span>
                    <span class="${props.runs_on_sat === "Y" ? "text-gray-800" : ""}">S</span>
                </div>
                <button onclick="bookTrain('${trainData}')" class="bg-black hover:bg-gray-800 transition-all text-white px-10 py-3 rounded-xl font-bold text-md shadow-lg shadow-black/20 active:scale-95">
                    Book Ticket
                </button>
            </div>
        </div>
    `;
}

window.bookTrain = function (encodedData) {
  localStorage.setItem("selectedTrain", decodeURIComponent(encodedData));
  const isPage = window.location.pathname.includes("/pages/");
  window.location.href = isPage ? "./checkout.html" : "./pages/checkout.html";
};

function initSearch() {
  const searchBtn = document.querySelector("#search");
  const pnrInput = document.querySelector("#pnr");
  const findBtn = document.querySelector("#Find");

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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSearch);
} else {
  initSearch();
}
