async function loadAndSearchTrains(pnr) {
  const response = await fetch('../data/trains.json');
  const data = await response.json();
  const trainsData = data.features; 
  console.log("Success! Data loaded. Total trains:", trainsData.length);

  let key = pnr;
  console.log("Searching for:", key);
  const cardGrid=document.querySelector("#result");
  for (let x of trainsData) {
      if (x.properties.number === key) {
        cardGrid.innerHTML=`
          <div class="flex flex-col bg-white shadow-xl w-full max-w-4xl p-5 md:p-6 rounded-xl mx-auto border border-gray-100 text-gray-800">
            <div class="flex flex-row gap-3 items-center mb-6 w-full">
              <div class="bg-blue-100 text-blue-800 rounded-md py-1 px-2 font-bold text-sm tracking-wide">
                ${x.properties.number}
              </div>
              <div class="font-bold text-lg md:text-xl text-gray-900">
                ${x.properties.name}
              </div>
            </div>
            <div class="relative flex flex-row justify-between items-center w-full py-2 mb-4">
              <hr class="absolute w-full h-[2px] bg-gray-300 border-0 top-1/2 z-0">
              <div class="bg-white px-3 font-semibold text-gray-700 z-10">${x.properties.departure}</div>
              <div class="bg-white px-3 text-sm font-medium text-gray-500 z-10">${x.properties.duration_h}h ${x.properties.duration_m}m</div>
              <div class="bg-white px-3 font-semibold text-gray-700 z-10">${x.properties.arrival} AM</div>
            </div>
            <div class="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mt-2">
              <div class="flex gap-2 text-sm font-bold text-gray-400">
                <span class="text-green-600">S</span>
                <span>M</span>
                <span class="text-green-600">T</span>
                <span>W</span>
                <span class="text-green-600">T</span>
                <span>F</span>
                <span class="text-green-600">S</span>
              </div>
              <button class="bg-green-500 hover:bg-green-600 transition-colors text-white flex justify-center items-center w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-lg shadow-lg shadow-green-200">
                Book ticket
              </button>
            </div>
          </div>
        `
          console.log("Found train:", x.properties);
          return;
      }
  }
  console.log("not found");
}
const search=document.querySelector("#search");
console.log(search);
const pnr=document.querySelector('#pnr')
console.log(pnr)
const find=document.querySelector("#Find");
console.log(find);
find.addEventListener('click',()=>loadAndSearchTrainsb());


async function loadAndSearchTrainsb(){
  const source=document.querySelector('#Source').value;
  const destination=document.querySelector('#Destination').value;
  console.log(source,destination);
  const response = await fetch('../data/trains.json');
  const data = await response.json();
  const trainsData = data.features; 
  console.log("Success! Data loaded. Total trains:", trainsData.length);
  for (let x of trainsData) {
    console.log(x.properties)
    if (x.properties.from_station_name=== source && x.properties.to_station_name === destination) {
      console.log("Found train:", x.properties);
     break;
    }
  }
}