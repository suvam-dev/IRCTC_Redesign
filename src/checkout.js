const link = window.location.href;
const url = new URL(link);
const searchParams = new URLSearchParams(url.search);
const train = searchParams.get("train");

const id = searchParams.get("id");
const name = searchParams.get("name");
const from = searchParams.get("start");
const to = searchParams.get("dest");
const date = searchParams.get("date");
const t1 = searchParams.get("t1");
const t2 = searchParams.get("t2");
const price = searchParams.get("price");
const durationValue = searchParams.get("time");

const trainName = document.getElementById("trainname");
trainName.innerHTML=` <i data-lucide="train" class="train-icon"></i> ${train}`;

const start = document.getElementById("start");
start.innerHTML=`${from}`;

const end = document.getElementById("end");
end.innerHTML=`${to}`;

const time1 = document.getElementById("t1");
time1.innerHTML=`${t1}`;

const time2 = document.getElementById("t2");
time2.innerHTML=`${t2}`;

const duration = document.getElementById("time");
duration.innerHTML=`Duration: ${durationValue}`;

const priceElement = document.getElementById("price");
priceElement.innerHTML=`Rs.${price}`;

const subtotal = document.getElementById("subtotal");
let num = parseInt(price, 10) + 21;
subtotal.innerHTML=`Rs.${num}`;

const taxElement = document.getElementById("tax");
let tax = 0.05 * num;
taxElement.innerHTML=`Rs.${tax.toFixed(2)}`;

const total = document.getElementById("total");
let numTotal = parseInt(num, 10) + tax + 8.50;
total.innerHTML=`Rs.${numTotal}`;