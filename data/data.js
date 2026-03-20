
export let trainsData = [];
fetch('./data/trains.json')
  .then((response) => response.json())
  .then((data) => {
    trainsData = data;   
    console.log("Success! Data stored in global 'trainsData' variable:", trainsData);  
  });