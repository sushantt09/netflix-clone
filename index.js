//consts
const apikey = "6207fd22f6d24fdebd715564703e356f";
const apiEndpoint = "https://api.themoviedb.org/3";
const imgPath = "https://image.tmdb.org/t/p/original";
const youtubekey = "AIzaSyB177vIwI9jt_mqrPxS-PbjxstqSc8RoTs";

const apiPaths = {
    fetchAllCategories: `${apiEndpoint}/genre/movie/list?api_key=${apikey}`,
    fetchMovieList: (id) => `${apiEndpoint}/discover/movie?api_key=${apikey}&with_genres=${id}`,
    fetchTrending: `${apiEndpoint}/trending/all/day?api_key=${apikey}&language=en-US`,
    searchOnYoutube: (query) => `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${youtubekey}`,
}

//Boots up the app
function init() {
    fetchTrendingMovies();
    fetchAndBuildAllSections();
}

function fetchTrendingMovies(){
    fetchAndBuildMovieSection(apiPaths.fetchTrending, 'Trending Now')
    .then(list => {
        const randomIndex = parseInt(Math.random()*list.length);
        buildbannerSection(list[randomIndex]);
    }).catch(err =>{
        console.error(err)
    });
}

function buildbannerSection(movie){
    const bannerCont = document.getElementById('banner-section');
    bannerCont.style.backgroundImage = `url(${imgPath}${movie.backdrop_path})`;

    const div = document.createElement('div');
    div.innerHTML = `
    <h2 class="banner-title">${movie.title}</h2>
    <p class="banner-info">Trending in Movies | Released - ${movie.release_date} </p>
    <p class="banner-overview">${movie.overview && movie.overview.length > 200 ? movie.overview.slice(0,200).trim()+ '...' : movie.overview}</p>
    <div class="action-button-cont">
        <button class="action-button"><img width="22" height="20" src="https://www.svgrepo.com/show/6905/play-button.svg">&nbsp;</img>Play</button>
        <button class="action-button"><img width="22" height="20" src="https://cdn.iconscout.com/icon/free/png-512/info-93-433771.png?f=avif" />&nbsp;&nbsp; More Info</button>
    </div>
    `;
    div.className = "banner-content";

    bannerCont.append(div);
}   

function fetchAndBuildAllSections(){
     fetch(apiPaths.fetchAllCategories)
    .then(res => res.json())
    .then(res => {
     const categories = res.genres;
     if (Array.isArray(categories) && categories.length) {
        categories.forEach(category => {
            fetchAndBuildMovieSection(
                apiPaths.fetchMovieList(category.id), category.name)
        })
     }
     })
    .catch(err => console.error(err));
}

function fetchAndBuildMovieSection(fetchUrl, categoryName){
    console.log(fetchUrl, categoryName);
    return fetch(fetchUrl)
    .then(res => res.json())
    .then(res => {
        const movies = res.results;
        if (Array.isArray(movies) && movies.length){
            buildMoviesSection(movies, categoryName);
        }
        return movies;
    })
    .catch(err => console.error(err))
}

function buildMoviesSection(list, categoryName){
    const moviesCont = document.getElementById('movies-cont');
    const moviesListHtml = list.map(item => {
        return `
        <div class="movie-item" onclick="searchMovieTrailer('${item.title}','yt${item.id}')">
          <img class="movie-item-img" src="${imgPath}${item.backdrop_path}" alt="${item.title}">
          <div class="iframe-wrap" 
            id="yt${item.id}">
          </div>
        </div>
        `;
    }).join('');

    const moviesSectionHtml = `
    <div class="movies-section">
        <h2 class="movie-section-heading">${categoryName} <span class="explore-nudge">Explore All</span></h2>
        <div class="movies-row">
            ${moviesListHtml}
        </div>
    </div>
    `
    console.log(moviesSectionHtml);

    const div = document.createElement('div');
    div.className = "movies.section"
    div.innerHTML = moviesSectionHtml;

    //append html into movies container
    moviesCont.append(div);
}

function searchMovieTrailer(movieName, iframeId) {
    if (!movieName) return;

    fetch(apiPaths.searchOnYoutube(movieName))
    .then(res => res.json())
    .then(res => {
        console.log(res.items[0]);
        const bestResult = res.items[0];

        // const youtubeUrl = `https://www.youtube.com/watch?v=${bestResult.id.videoId}`;
        // console.log(youtubeUrl);
        // window.open(youtubeUrl, '_blank');
        const elements = document.getElementById(iframeId);
        console.log(elements, iframeId);
        const div = document.createElement('div');
        div.innerHTML = `<iframe width="245px" height="150px" src="https://www.youtube.com/embed/${bestResult.id.videoId}?autoplay=1&controls=0"></iframe>`
        elements.append(div);
    })
    .catch(err => console.log(err));
}

window.addEventListener('load',function() {
    init();
    window.addEventListener('scroll', function(){
        //header ui update
        const header = document.getElementById('header');
        if (window.scrollY > 5) header.classList.add('black-bg')
        else header.classList.remove('black-bg')
    })
})