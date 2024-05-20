import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'



// Creating a data object to store books, authors, genres, and the number of books per page
const data = {
    books,
    authors,
    genres,
    BOOKS_PER_PAGE
};



/**
 * Sets the theme of the application to either 'day' or 'night'.
  * @param {string} theme - The theme to set ('day' or 'night').
 */
function setTheme(theme) {
    if (theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
}


/**
 * Populates a select element with options from a given object.
 * @param {HTMLSelectElement} selectElement - The select element to populate.
 * @param {Object} options - The options to add to the select element.
 * @param {string} firstOptionText - The text for the first option.
 */
function populateSelectElement(selectElement, options, firstOptionText) {
    const fragment = document.createDocumentFragment();
    const firstOption = createElement('option', null, { value: 'any' }, firstOptionText);
    fragment.appendChild(firstOption);
    for (const [id, name] of Object.entries(options)) {
        const option = createElement('option', null, { value: id }, name);
        fragment.appendChild(option);
    }
    selectElement.appendChild(fragment);
}


// Initialize variables for page number and filtered matches
let page = 1;
let matches = data.books;

// Initial render of books
// This renders the initial set of book previews based on the first page.
document.querySelector('[data-list-items]').appendChild(renderBookList(matches, 0, data.BOOKS_PER_PAGE));

// Populate genres and authors select elements
// This fills the genre and author select elements with options from the data.
populateSelectElement(document.querySelector('[data-search-genres]'), data.genres, 'All Genres');
populateSelectElement(document.querySelector('[data-search-authors]'), data.authors, 'All Authors');

// Set theme based on user preference
// This checks the user's preferred color scheme and sets the theme accordingly.
const prefersDarkScheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = prefersDarkScheme ? 'night' : 'day';
setTheme(theme);
document.querySelector('[data-settings-theme]').value = theme;

// Update the show more button text
// This updates the 'Show more' button text and its disabled state.
const listButton = document.querySelector('[data-list-button]');
listButton.innerText = `Show more (${data.books.length - data.BOOKS_PER_PAGE})`;
listButton.disabled = matches.length - (page * data.BOOKS_PER_PAGE) > 0;

// Event listeners
// These event listeners handle various interactions in the application.


// Close the search overlay
document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false;
});


// Close the settings overlay
document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false;
});

// Open the search overlay
document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true;
    document.querySelector('[data-search-title]').focus();
});

// Open the settings overlay
document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true;
});


// Close the active book overlay
document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false;
});


// Handle settings form submission
// This applies the selected theme and closes the settings overlay.
document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    setTheme(theme);
    document.querySelector('[data-settings-overlay]').open = false;
});


// Handle search form submission
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

// Handle "Show more" button click
// This loads more book previews and appends them to the book list.
listButton.addEventListener('click', () => {
    const fragment = renderBookList(matches, page * data.BOOKS_PER_PAGE, (page + 1) * data.BOOKS_PER_PAGE);
    document.querySelector('[data-list-items]').appendChild(fragment);
    page += 1;
});

// Handle book preview click
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
