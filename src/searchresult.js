function getDataPath(filename) {
  const isPage = window.location.pathname.includes("/pages/");
  return (isPage ? "../data-2/" : "./data-2/") + filename;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function loadDataSets() {
  const [stationsRes, trainsRes] = await Promise.all([
    fetch(getDataPath("stations.json")),
    fetch(getDataPath("trains.json")),
  ]);

  if (!stationsRes.ok) {
    throw new Error(`stations.json -> HTTP ${stationsRes.status}`);
  }

  if (!trainsRes.ok) {
    throw new Error(`trains.json -> HTTP ${trainsRes.status}`);
  }

  const stationsJson = await stationsRes.json();
  const trainsJson = await trainsRes.json();

  return {
    stations: Array.isArray(stationsJson.stations) ? stationsJson.stations : [],
    trains: Array.isArray(trainsJson.trains) ? trainsJson.trains : [],
  };
}

function buildStationMap(stations) {
  return new Map(
    stations.map((station) => [
      String(station.code || "").toUpperCase(),
      station.name || String(station.code || "").toUpperCase(),
    ]),
  );
}

function normalizeTime(timeValue) {
  const raw = String(timeValue || "").trim();
  if (!raw.includes(":")) return raw || "--:--";

  const [hours, minutes] = raw.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

function timeToMinutes(timeValue) {
  const normalized = normalizeTime(timeValue);
  if (!normalized.includes(":")) return null;

  const [hours, minutes] = normalized.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  return hours * 60 + minutes;
}

function formatDuration(fromTime, toTime) {
  const fromMinutes = timeToMinutes(fromTime);
  const toMinutes = timeToMinutes(toTime);

  if (fromMinutes === null || toMinutes === null) return "N/A";

  let diff = toMinutes - fromMinutes;
  if (diff < 0) diff += 24 * 60;

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function resolveStationCode(inputValue, stations) {
  const query = String(inputValue || "").trim().toUpperCase();
  if (!query) return null;

  const exactCode = stations.find(
    (station) => String(station.code || "").toUpperCase() === query,
  );
  if (exactCode) return String(exactCode.code || "").toUpperCase();

  const exactName = stations.find(
    (station) => String(station.name || "").trim().toUpperCase() === query,
  );
  if (exactName) return String(exactName.code || "").toUpperCase();

  const partialName = stations.find((station) =>
    String(station.name || "").toUpperCase().includes(query),
  );
  if (partialName) return String(partialName.code || "").toUpperCase();

  return null;
}

function findStopIndex(schedule, code) {
  return schedule.findIndex(
    (stop) => String(stop.station_code || "").toUpperCase() === code,
  );
}

function buildScheduleModel(train, stationMap) {
  const schedule = Array.isArray(train.schedule) ? train.schedule : [];
  const stops = schedule.map((stop, index) => {
    const previousStop = index > 0 ? schedule[index - 1] : null;
    const stationCode = String(stop.station_code || "").toUpperCase();
    const distance = typeof stop.distance === "number" ? stop.distance : 0;
    const previousDistance =
      previousStop && typeof previousStop.distance === "number"
        ? previousStop.distance
        : distance;

    return {
      index,
      code: stationCode,
      name: stationMap.get(stationCode) || stationCode,
      time: normalizeTime(stop.time),
      distance,
      legDistance: index === 0 ? 0 : Math.max(distance - previousDistance, 0),
      legDuration:
        index === 0 ? "Origin" : formatDuration(previousStop.time, stop.time),
      type:
        index === 0
          ? "start"
          : index === schedule.length - 1
            ? "end"
            : "stop",
    };
  });

  const firstStop = stops[0] || null;
  const lastStop = stops[stops.length - 1] || null;
  const runDays = Array.isArray(train.runs_on) ? train.runs_on : [];

  return {
    id: train.train_id,
    name: train.train_name,
    totalStops: stops.length,
    totalDistance: lastStop ? `${lastStop.distance} km` : "N/A",
    totalDuration:
      firstStop && lastStop ? formatDuration(firstStop.time, lastStop.time) : "N/A",
    origin: firstStop ? firstStop.name : "Unknown",
    destination: lastStop ? lastStop.name : "Unknown",
    departure: firstStop ? firstStop.time : "--:--",
    arrival: lastStop ? lastStop.time : "--:--",
    runsOn: runDays,
    stops,
  };
}

function findTrainByQuery(query, trains) {
  const normalized = String(query || "").trim().toUpperCase();
  if (!normalized) return null;

  const exactId = trains.find(
    (train) => String(train.train_id || "").toUpperCase() === normalized,
  );
  if (exactId) return exactId;

  const exactName = trains.find(
    (train) => String(train.train_name || "").trim().toUpperCase() === normalized,
  );
  if (exactName) return exactName;

  return (
    trains.find((train) => {
      const id = String(train.train_id || "").toUpperCase();
      const name = String(train.train_name || "").toUpperCase();
      return id.includes(normalized) || name.includes(normalized);
    }) || null
  );
}

function getRouteMatches(source, destination, trains, stations, stationMap) {
  const srcCode = resolveStationCode(source, stations);
  const dstCode = resolveStationCode(destination, stations);
  if (!srcCode || !dstCode) return [];

  return trains
    .map((train) => {
      const schedule = Array.isArray(train.schedule) ? train.schedule : [];
      const sourceIndex = findStopIndex(schedule, srcCode);
      const destinationIndex = findStopIndex(schedule, dstCode);

      if (sourceIndex >= 0 && destinationIndex > sourceIndex) {
        const fullModel = buildScheduleModel(train, stationMap);
        const startStop = fullModel.stops[sourceIndex];
        const endStop = fullModel.stops[destinationIndex];

        return {
          id: fullModel.id,
          name: fullModel.name,
          departure: startStop.time,
          arrival: endStop.time,
          fromName: startStop.name,
          toName: endStop.name,
          totalStops: destinationIndex - sourceIndex + 1,
        };
      }

      return null;
    })
    .filter(Boolean);
}

function renderFeedback(message, type = "idle") {
  const feedback = document.querySelector("#feedback");
  if (!feedback) return;

  feedback.className = "feedback";
  if (type === "error") feedback.classList.add("is-error");
  if (type === "success") feedback.classList.add("is-success");
  feedback.textContent = message;
}

function renderRunDays(runDays) {
  const activeSet = new Set(runDays.map((day) => String(day).slice(0, 3)));
  const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return allDays
    .map((day) => {
      const activeClass = activeSet.has(day) ? "run-day active" : "run-day";
      return `<span class="${activeClass}">${escapeHtml(day)}</span>`;
    })
    .join("");
}

function renderSchedule(model) {
  const scheduleRoot = document.querySelector("#schedule-root");
  if (!scheduleRoot) return;

  const stopMarkup = model.stops
    .map((stop) => {
      const cardLabel =
        stop.type === "start"
          ? "Origin"
          : stop.type === "end"
            ? "Destination"
            : `${stop.legDistance} km from previous stop`;

      return `
        <article class="schedule-stop ${escapeHtml(stop.type)}">
          <div class="stop-rail">
            <span class="stop-node" aria-hidden="true"></span>
          </div>
          <div class="stop-card">
            <div class="stop-card-head">
              <div>
                <p class="stop-code">${escapeHtml(stop.code)}</p>
                <h3>${escapeHtml(stop.name)}</h3>
              </div>
              <div class="stop-time">${escapeHtml(stop.time)}</div>
            </div>
            <div class="stop-meta">
              <span>${escapeHtml(cardLabel)}</span>
              <span>${escapeHtml(stop.distance)} km from origin</span>
              <span>${escapeHtml(stop.legDuration)}</span>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  scheduleRoot.innerHTML = `
    <section class="schedule-card">
      <header class="schedule-header">
        <div class="schedule-title-row">
          <div>
            <span class="train-badge">${escapeHtml(model.id)}</span>
            <h2>${escapeHtml(model.name)}</h2>
            <p class="schedule-route">
              ${escapeHtml(model.origin)} to ${escapeHtml(model.destination)}
            </p>
          </div>
          <div class="run-days">
            ${renderRunDays(model.runsOn)}
          </div>
        </div>

        <div class="schedule-summary">
          <div class="summary-pill">
            <span>Departure</span>
            <strong>${escapeHtml(model.departure)}</strong>
          </div>
          <div class="summary-pill">
            <span>Arrival</span>
            <strong>${escapeHtml(model.arrival)}</strong>
          </div>
          <div class="summary-pill">
            <span>Total Duration</span>
            <strong>${escapeHtml(model.totalDuration)}</strong>
          </div>
          <div class="summary-pill">
            <span>Stops</span>
            <strong>${escapeHtml(model.totalStops)} stops • ${escapeHtml(model.totalDistance)}</strong>
          </div>
        </div>
      </header>

      <div class="schedule-timeline">
        ${stopMarkup}
      </div>
    </section>
  `;
}

function renderEmptySchedule() {
  const scheduleRoot = document.querySelector("#schedule-root");
  if (!scheduleRoot) return;

  scheduleRoot.innerHTML = `
    <div class="empty-state">
      The full schedule will appear here once you search for a train.
    </div>
  `;
}

function renderRouteContext(source, destination) {
  const routeContext = document.querySelector("#route-context");
  if (!routeContext) return;

  if (!source || !destination) {
    routeContext.hidden = true;
    routeContext.innerHTML = "";
    return;
  }

  routeContext.hidden = false;
  routeContext.innerHTML = `
    Route request detected from another page:
    <strong>${escapeHtml(source)}</strong> to
    <strong>${escapeHtml(destination)}</strong>.
    Pick a matching train below to load its full schedule.
  `;
}

function renderRouteResults(matches, source, destination) {
  const routeResults = document.querySelector("#route-results");
  if (!routeResults) return;

  if (!matches.length) {
    routeResults.hidden = false;
    routeResults.innerHTML = `
      <div class="route-results-header">
        <div>
          <h2>No matching trains</h2>
          <p>No direct trains were found for ${escapeHtml(source)} to ${escapeHtml(destination)}.</p>
        </div>
      </div>
    `;
    return;
  }

  routeResults.hidden = false;
  routeResults.innerHTML = `
    <div class="route-results-header">
      <div>
        <h2>Matching Trains</h2>
        <p>${escapeHtml(matches.length)} trains found for ${escapeHtml(source)} to ${escapeHtml(destination)}.</p>
      </div>
    </div>
    <div class="route-cards">
      ${matches
        .map(
          (match) => `
            <article class="route-card">
              <div>
                <span class="route-card-code">${escapeHtml(match.id)}</span>
                <h3>${escapeHtml(match.name)}</h3>
                <p class="route-card-route">${escapeHtml(match.fromName)} to ${escapeHtml(match.toName)}</p>
                <p class="route-card-meta">
                  ${escapeHtml(match.departure)} → ${escapeHtml(match.arrival)} • ${escapeHtml(match.totalStops)} stops
                </p>
              </div>
              <button type="button" data-train-id="${escapeHtml(match.id)}">View Schedule</button>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function attachRouteButtons(onViewSchedule) {
  document.querySelectorAll("[data-train-id]").forEach((button) => {
    button.addEventListener("click", () => {
      onViewSchedule(button.getAttribute("data-train-id") || "");
    });
  });
}

async function initRouteSearchPage() {
  const form = document.querySelector("#train-search-form");
  const queryInput = document.querySelector("#train-query");
  const routeResults = document.querySelector("#route-results");
  const scheduleRoot = document.querySelector("#schedule-root");

  if (!form || !queryInput || !routeResults || !scheduleRoot) return;

  renderEmptySchedule();

  let dataSets;
  try {
    dataSets = await loadDataSets();
  } catch (error) {
    console.error(error);
    renderFeedback("Unable to load train schedule data right now.", "error");
    return;
  }

  const { trains, stations } = dataSets;
  const stationMap = buildStationMap(stations);

  const renderTrainByQuery = (query, sourceLabel = "search") => {
    const train = findTrainByQuery(query, trains);

    if (!train) {
      renderFeedback(`No train found for "${query}".`, "error");
      return;
    }

    const model = buildScheduleModel(train, stationMap);
    renderSchedule(model);

    if (sourceLabel === "route") {
      renderFeedback(`Loaded full schedule for ${model.name}.`, "success");
    } else {
      renderFeedback(`Showing the full schedule for ${model.name}.`, "success");
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = queryInput.value.trim();

    if (!query) {
      renderFeedback("Enter a train number or train name first.", "error");
      return;
    }

    routeResults.hidden = true;
    renderRouteContext("", "");
    renderTrainByQuery(query);
  });

  const searchParams = new URLSearchParams(window.location.search);
  const queryTrain = searchParams.get("train");
  if (queryTrain) {
    queryInput.value = queryTrain;
    renderTrainByQuery(queryTrain);
    return;
  }

  const pendingSearchRaw = localStorage.getItem("pendingSearch");
  if (pendingSearchRaw) {
    try {
      const pendingSearch = JSON.parse(pendingSearchRaw);
      const source = pendingSearch.source || "";
      const destination = pendingSearch.destination || "";
      const matches = getRouteMatches(
        source,
        destination,
        trains,
        stations,
        stationMap,
      );

      renderRouteContext(source, destination);
      renderRouteResults(matches, source, destination);
      attachRouteButtons((trainId) => {
        queryInput.value = trainId;
        renderTrainByQuery(trainId, "route");
        scheduleRoot.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      if (matches.length) {
        renderFeedback(
          `Select a matching train to open its full schedule.`,
          "success",
        );
      } else {
        renderFeedback(
          `No direct trains found for the selected route. You can still search by train number.`,
          "error",
        );
      }
    } catch (error) {
      console.error("pendingSearch parse error:", error);
    } finally {
      localStorage.removeItem("pendingSearch");
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRouteSearchPage);
} else {
  initRouteSearchPage();
}
