const link = window.location.href;
const url = new URL(link);
const searchParams = new URLSearchParams(url.search);
const train = searchParams.get("train");

console.log(link);
console.log(url);
console.log(searchParams);
console.log(train);