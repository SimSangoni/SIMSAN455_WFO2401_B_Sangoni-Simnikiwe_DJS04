import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'
import { initEventListeners } from './eventListeners.js';
import { renderBookList, setTheme, populateSelectElement } from './utils.js';
import './BookPreview.js'

initEventListeners();

// Creating a data object to store books, authors, genres, and the number of books per page
const data = {
    books,
    authors,
    genres,
    BOOKS_PER_PAGE
};


// Initialize variables for page number and filtered matches
let page = 1;
let matches = data.books;

// This renders the initial set of book previews based on the first page.
document.querySelector('[data-list-items]').appendChild(renderBookList(matches, 0, data.BOOKS_PER_PAGE));

// This fills the genre and author select elements with options from the data.
populateSelectElement(document.querySelector('[data-search-genres]'), data.genres, 'All Genres');
populateSelectElement(document.querySelector('[data-search-authors]'), data.authors, 'All Authors');

// This checks the user's preferred color scheme and sets the theme accordingly.
const prefersDarkScheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = prefersDarkScheme ? 'night' : 'day';
setTheme(theme);
document.querySelector('[data-settings-theme]').value = theme;


// This updates the 'Show more' button text and its disabled state.
const listButton = document.querySelector('[data-list-button]');
listButton.innerText = `Show more (${data.books.length - data.BOOKS_PER_PAGE})`;
listButton.disabled = matches.length - (page * data.BOOKS_PER_PAGE) > 0;



// This filters the books based on search criteria and updates the book list.
document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = [];

    for (const book of data.books) {
        let genreMatch = filters.genre === 'any';
        for (const singleGenre of book.genres) {
            if (genreMatch) break;
            if (singleGenre === filters.genre) genreMatch = true;
        }

        if (
            (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
            (filters.author === 'any' || book.author === filters.author) &&
            genreMatch
        ) {
            result.push(book);
        }
    }

    page = 1;
    matches = result;

    // Display or hide the "No results" message based on the search results.
    document.querySelector('[data-list-message]').classList.toggle('list__message_show', result.length < 1);

    // Update the book list with the search results.
    const listItems = document.querySelector('[data-list-items]');
    listItems.innerHTML = '';
    listItems.appendChild(renderBookList(result, 0, data.BOOKS_PER_PAGE));

    // Update the "Show more" button state and text.
    listButton.disabled = matches.length - (page * data.BOOKS_PER_PAGE) < 1;
    listButton.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${Math.max(matches.length - (page * data.BOOKS_PER_PAGE), 0)})</span>
    `;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('[data-search-overlay]').open = false;
});


// This loads more book previews and appends them to the book list.
listButton.addEventListener('click', () => {
    const fragment = renderBookList(matches, page * data.BOOKS_PER_PAGE, (page + 1) * data.BOOKS_PER_PAGE);
    document.querySelector('[data-list-items]').appendChild(fragment);
    page += 1;
});


// This opens the detailed view of the clicked book.
document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const pathArray = Array.from(event.path || event.composedPath());
    let active = null;

    for (const node of pathArray) {
        if (active) break;
        if (node?.dataset?.preview) {
            active = data.books.find(book => book.id === node.dataset.preview);
        }
    }

    if (active) {
        document.querySelector('[data-list-active]').open = true;
        document.querySelector('[data-list-blur]').src = active.image;
        document.querySelector('[data-list-image]').src = active.image;
        document.querySelector('[data-list-title]').innerText = active.title;
        document.querySelector('[data-list-subtitle]').innerText = `${data.authors[active.author]} (${new Date(active.published).getFullYear()})`;
        document.querySelector('[data-list-description]').innerText = active.description;
    }
});
