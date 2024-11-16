const API_KEY = '20d9edc97bc617d9c5df35a9263571ea'; // Substitua pela sua API Key do TMDB
const BASE_URL = 'https://api.themoviedb.org/3';
const imageBaseURL = 'https://image.tmdb.org/t/p/w500';

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const carousel = document.querySelector('.owl-carousel');

// Definindo a descrição de referência para contagem de caracteres
const maxDescriptionLength = 120;

// Selecionando os elementos do filme principal para atualização
const mainMovie = document.querySelector('.main-movie');
const movieTitleElement = document.querySelector('.title-movie'); // Título do filme principal
const movieDescription = document.querySelector('.description');

// Variável para armazenar o filme atual
let currentMovie = {}; // Variável que armazenará o filme atual

// Função para buscar filmes
async function searchMovies(query) {
    try {
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`);
        const data = await response.json();
        return data.results; // Array de filmes
    } catch (error) {
        console.error('Erro ao buscar filmes:', error);
        return [];
    }
}

// Função para atualizar o carrossel
function updateCarousel(movies) {
    carousel.innerHTML = ''; // Limpa o carrossel
    movies.forEach(movie => {
        const item = document.createElement('div');
        item.classList.add('item');
        item.innerHTML = `
        <img class="box-movie" src="${imageBaseURL}${movie.poster_path}" alt="${movie.title}" data-id="${movie.id}" />
    `;
    
        carousel.appendChild(item);
    });

    // Reinitialize o carrossel após atualizar
    $('.owl-carousel').owlCarousel('destroy'); // Remove a instância anterior
    $('.owl-carousel').owlCarousel({
        loop: true,
        margin: 10,
        nav: true,
        responsive: {
            0: { items: 1 },
            600: { items: 3 },
            1000: { items: 5 }
        }
    });
}

// Função para atualizar os dados do filme principal com limite de caracteres na descrição
function updateMainMovie(movie) {
    // Atualiza a variável currentMovie com o filme atual
    currentMovie = movie;

    // Atualiza o fundo com a imagem de capa
    mainMovie.style.backgroundImage = `url(${imageBaseURL}${movie.backdrop_path})`;
    
    // Atualiza o título
    movieTitleElement.textContent = movie.title;
    
    // Limita a descrição ao tamanho máximo e adiciona "..." se necessário
    let description = movie.overview || "Descrição não disponível";
    if (description.length > maxDescriptionLength) {
        description = description.slice(0, maxDescriptionLength) + "...";
    }
    
    // Atualiza a descrição
    movieDescription.textContent = description;
}

// Função para carregar configurações iniciais da página (Início)
async function loadDefaultPage() {
    const movies = await searchMovies("massacre da serra elétrica");
    updateCarousel(movies);

    if (movies.length > 0) {
        const randomMovie = movies[Math.floor(Math.random() * movies.length)];
        updateMainMovie(randomMovie);
    }
}

// Função para carregar os resultados com base no termo
async function loadCategory(term) {
    const movies = await searchMovies(term);
    updateCarousel(movies);

    if (movies.length > 0) {
        const randomMovie = movies[Math.floor(Math.random() * movies.length)];
        updateMainMovie(randomMovie);
    }
}

// Event listeners para os links do menu
document.getElementById('home-link').addEventListener('click', (e) => {
    e.preventDefault(); // Previne comportamento padrão do link
    loadDefaultPage(); // Volta para as configurações iniciais
});

document.getElementById('series-link').addEventListener('click', (e) => {
    e.preventDefault();
    loadCategory('séries'); // Busca por "séries"
});

document.getElementById('movies-link').addEventListener('click', (e) => {
    e.preventDefault();
    loadCategory('filmes'); // Busca por "filmes"
});

document.getElementById('documentaries-link').addEventListener('click', (e) => {
    e.preventDefault();
    loadCategory('documentários'); // Busca por "documentários"
});

// Função para carregar a página com o filme "Massacre da Serra Elétrica"
async function loadInitialMovie() {
    const movies = await searchMovies("massacre da serra elétrica");
    updateCarousel(movies);

    if (movies.length > 0) {
        const randomMovie = movies[Math.floor(Math.random() * movies.length)];
        updateMainMovie(randomMovie);
    }
}

// Seleção de elementos do popup
const popup = document.getElementById('movie-popup');
const closePopup = document.getElementById('close-popup');
const popupPoster = document.getElementById('popup-poster');
const popupTitle = document.getElementById('popup-title');
const popupOverview = document.getElementById('popup-overview');
const popupDetails = document.getElementById('popup-details');

// Função para abrir o popup
function openPopup(movie) {
    popupPoster.src = `${imageBaseURL}${movie.poster_path || ''}`;
    popupTitle.textContent = movie.title || "Título não disponível";
    popupOverview.textContent = movie.overview || "Descrição não disponível.";
    popupDetails.innerHTML = `
        <li><strong>Gêneros:</strong> ${movie.genres?.map(genre => genre.name).join(', ') || 'Não disponível'}</li>
        <li><strong>Data de Lançamento:</strong> ${movie.release_date || 'Não disponível'}</li>
        <li><strong>Duração:</strong> ${movie.runtime || 'N/A'} minutos</li>
        <li><strong>Média de Votos:</strong> ${movie.vote_average || 'N/A'} (${movie.vote_count || 0} votos)</li>
        <li><strong>Status:</strong> ${movie.status || 'Desconhecido'}</li>
    `;
    popup.classList.remove('hidden');
}

// Fechar o popup
closePopup.addEventListener('click', () => {
    popup.classList.add('hidden');
});

// Fechar o popup ao clicar fora do conteúdo
popup.addEventListener('click', (e) => {
    if (e.target === popup) {
        popup.classList.add('hidden');
    }
});

// Função para buscar detalhes do filme por ID
async function fetchMovieDetails(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=pt-BR`);
        const data = await response.json();
        openPopup(data); // Abre o popup com os detalhes
    } catch (error) {
        console.error('Erro ao buscar detalhes do filme:', error);
    }
}

// Adicionar evento de clique aos itens do carrossel
carousel.addEventListener('click', async (e) => {
    const movieElement = e.target.closest('img'); // Captura o clique na imagem
    if (movieElement) {
        const movieId = movieElement.getAttribute('data-id'); // Extrai a ID do filme
        if (movieId) {
            const movieDetails = await fetchMovieDetails(movieId); // Busca os detalhes do filme
            updateMainMovie(movieDetails); // Atualiza o filme principal
        }
    }
});

// Função para abrir a pesquisa no Google
function searchOnGoogle(movieTitle) {
    const searchQuery = `netflix ${movieTitle}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(url, '_blank'); // Abre em uma nova janela
}

// Função para adicionar os eventos aos botões
document.querySelector('.buttons .button:first-child').addEventListener('click', () => {
    const movieTitle = movieTitleElement.textContent; // Pega o título do filme principal
    searchOnGoogle(movieTitle); // Chama a função para abrir a pesquisa no Google
});

document.querySelector('.buttons .button:last-child').addEventListener('click', () => {
    openPopup(currentMovie); // Exibe o popup com os detalhes do filme atual
});

// Função para buscar filmes ao clicar no botão de busca
document.querySelector('#search-btn').addEventListener('click', async function(event) {
    event.preventDefault(); // Previne o envio do formulário
    const searchTerm = document.getElementById('search-input').value.trim(); // Pega o valor da pesquisa
    if (searchTerm) {
        const movies = await searchMovies(searchTerm); // Chama a função de busca
        updateCarousel(movies); // Atualiza o carrossel com os filmes encontrados

        // Atualiza o filme principal com o primeiro filme da busca
        if (movies.length > 0) {
            updateMainMovie(movies[0]);
        }
    } else {
        alert("Por favor, insira um termo para busca.");
    }
});

// Evento para pressionamento da tecla "Enter" no campo de pesquisa
document.getElementById('search-input').addEventListener('keypress', async function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Previne o comportamento padrão do "Enter"
        const searchTerm = document.getElementById('search-input').value.trim(); // Pega o valor da pesquisa
        if (searchTerm) {
            const movies = await searchMovies(searchTerm); // Chama a função de busca
            updateCarousel(movies); // Atualiza o carrossel com os filmes encontrados

            // Atualiza o filme principal com o primeiro filme da busca
            if (movies.length > 0) {
                updateMainMovie(movies[0]);
            }
        } else {
            alert("Por favor, insira um termo para busca.");
        }
    }
});

// Inicialização
loadDefaultPage(); // Carrega a página inicial com filmes

