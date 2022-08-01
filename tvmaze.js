"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $episodesList = $("#episodes-list");
const $searchForm = $("#search-form");
const $searchQuery = $("#search-query");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const shows = await axios.get(`https://api.tvmaze.com/search/shows?q=${term}`);
  let showsArr = [];
  for (let showElement of shows.data) {
    const {id, name, summary} = showElement.show;
    const image = showElement.show.image ? showElement.show.image.original : 'http://tinyurl.com/missing-tv';
    showsArr.push({id, name, summary, image});
  }
  return showsArr;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="${show.name}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes" id="${show.id}"">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

$showsList.on("click", async function (evt) {
  if (evt.target.nodeName === 'BUTTON') {
    console.log('Clicked button');
    await searchForEpisodeAndDisplay(evt.target.id);
  }
});

/** Handle search upon button click for respective show. Use API to get epsiodes and display */

async function searchForEpisodeAndDisplay(id) {
  const episodes = await getEpisodesOfShow(id);
  populateEpisodes(episodes);
  $episodesArea.show();
}

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) { 
  const episodes = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  let episodesArr = [];
  for (let epElement of episodes.data) {
    const {id, name, season, number} = epElement;
    episodesArr.push({id, name, season, number});
  }
  return episodesArr;
}

/** Given a list of episodes, create markup for each and to DOM */

function populateEpisodes(episodes) { 
  for (let episode of episodes) {
    const $episode = $(
        `<li>${episode.name} (season ${episode.season}, episode ${episode.number})</li>
      `);

    $episodesList.append($episode);  }
}
