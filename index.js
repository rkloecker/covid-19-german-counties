const searchForm = document.getElementById("search-form");
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");
const header_table = document.getElementById("header_table");

const tname = document.getElementById("tname");
const state = document.getElementById("state");
const pop = document.getElementById("pop");
const cases = document.getElementById("cases");
const deaths = document.getElementById("deaths");
const inz = document.getElementById("inz");

let tname_clicked = false;
let state_clicked = false;
let pop_clicked = false;
let cases_clicked = false;
let deaths_clicked = false;
let inz_clicked = false;

const refresh = document.getElementById("refresh");
let searchTerm = "";
const URL = "https://api.corona-zahlen.org/districts";
const local_storage_key = "covid_districts";

refresh.addEventListener("click", (e) => {
  console.log("refresh");
  e.preventDefault();
  localStorage.setItem(local_storage_key, "");
});

searchInput.addEventListener("keyup", async (e) => {
  e.preventDefault();
  if (e.key == "Backspace") {
    searchTerm = searchTerm.slice(0, -1);
  } else {
    searchTerm += e.key;
  }
  console.log(searchTerm);
  let data = await fetchData(URL);
  data = JSON.parse(data);
  data = data.filter((s) => s.name.toLowerCase().includes(searchTerm));
  show(data);
});

async function sort(fn) {
  let data = await fetchData(URL);
  data = JSON.parse(data);
  return data.sort(fn);
}

tname.addEventListener("click", async (e) => {
  e.preventDefault();
  tname_clicked = !tname_clicked;
  show(
    await sort((a, b) => {
      if (tname_clicked) return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    })
  );
});

state.addEventListener("click", async (e) => {
  e.preventDefault();
  state_clicked = !state_clicked;
  show(
    await sort((a, b) => {
      if (state_clicked)
        return b.stateAbbreviation.localeCompare(a.stateAbbreviation);
      return a.stateAbbreviation.localeCompare(b.stateAbbreviation);
    })
  );
});

pop.addEventListener("click", async (e) => {
  e.preventDefault();
  pop_clicked = !pop_clicked;
  show(
    await sort((a, b) =>
      pop_clicked ? b.population - a.population : a.population - b.population
    )
  );
});

cases.addEventListener("click", async (e) => {
  e.preventDefault();
  cases_clicked = !cases_clicked;
  show(
    await sort((a, b) =>
      cases_clicked ? b.cases - a.cases : a.cases - b.cases
    )
  );
});

deaths.addEventListener("click", async (e) => {
  e.preventDefault();
  deaths_clicked = !deaths_clicked;
  show(
    await sort((a, b) =>
      deaths_clicked ? b.deaths - a.deaths : a.deaths - b.deaths
    )
  );
});

inz.addEventListener("click", async (e) => {
  e.preventDefault();
  inz_clicked = !inz_clicked;
  show(
    await sort((a, b) =>
      inz_clicked
        ? b.weekIncidence - a.weekIncidence
        : a.weekIncidence - b.weekIncidence
    )
  );
});

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  header_table.classList.remove("visible");
  const data = await fetchData(URL);
  show(JSON.parse(data));
});

async function fetchData(url) {
  if (localStorage.getItem(local_storage_key)) {
    console.log("data from ls!");
    return localStorage.getItem(local_storage_key);
  }
  try {
    let resp = await fetch(url);
    let data = await resp.json();

    console.log("fetched data!");
    //console.log(data.data);
    const obj = data.data;
    let arr = Object.values(obj).map(
      ({
        name,
        county,
        stateAbbreviation,
        population,
        cases,
        deaths,
        weekIncidence,
      }) => ({
        name,
        county,
        stateAbbreviation,
        population,
        cases,
        deaths,
        weekIncidence,
      })
    );
    localStorage.setItem(local_storage_key, JSON.stringify(arr));
    return JSON.stringify(arr);
  } catch (error) {
    console.log("failed fetching data");
    document.getElementById("results").innerHTML = `<p>No data available!</p>`;
  }
}

function show(data) {
  // console.log(data);
  let output = '<div class="">';
  output += `
    
      `;
  data.forEach(
    ({ name, stateAbbreviation, population, cases, deaths, weekIncidence }) => {
      output += `
    <div class="row">
     <div class="col-4">
      ${name}
     </div>  
     <div class="col-2">
      ${stateAbbreviation}
     </div>
      <div class="col-2 text-center">
      ${population.toLocaleString()}
     </div>
      <div class="col-2 text-center">
      ${cases.toLocaleString()}
     </div>
      <div class="col-1 text-center">
      ${deaths.toLocaleString()}
     </div>
      <div class="col-1 text-center">
      ${weekIncidence.toFixed(1)}
     </div>
    </div>  
      `;
    }
  );
  output += "</div>";
  document.getElementById("results").innerHTML = output;
}
