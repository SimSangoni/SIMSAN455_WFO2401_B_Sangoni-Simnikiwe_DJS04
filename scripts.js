import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'



// Creating a data object to store books, authors, genres, and the number of books per page
const data = {
    books,
    authors,
    genres,
    BOOKS_PER_PAGE
};

class BookPreview extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const container = document.createElement('div');
        container.classList.add('preview');

        const style = document.createElement('style');
        style.textContent = `
        .preview {
            border-width: 0;
            width: 100%;
            font-family: Roboto, sans-serif;
            padding: 0.5rem 1rem;
            display: flex;
            align-items: center;
            cursor: pointer;
            text-align: left;
            border-radius: 8px;
            border: 1px solid rgba(var(--color-dark), 0.15);
            background: rgba(var(--color-light), 1);
        }
          
        @media (min-width: 60rem) {
        .preview {
            padding: 1rem;
        }
        }
        
        .preview_hidden {
            display: none;
        }
        
        .preview:hover {
            background: rgba(var(--color-blue), 0.05);
        }
        
        .preview__image {
            width: 48px;
            height: 70px;
            object-fit: cover;
            background: grey;
            border-radius: 2px;
            box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2),
                0px 1px 1px 0px rgba(0, 0, 0, 0.1), 0px 1px 3px 0px rgba(0, 0, 0, 0.1);
        }
        
        .preview__info {
            padding: 1rem;
        }
        
        .preview__title {
            margin: 0 0 0.5rem;
            font-weight: bold;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;  
            overflow: hidden;
            color: rgba(var(--color-dark), 0.8)
        }
        
        .preview__author {
            color: rgba(var(--color-dark), 0.4);
        }
        `;

        const img = document.createElement('img');
        img.classList.add('preview__image');
        img.src = this.getAttribute('image');
        container.appendChild(img);

        const info = document.createElement('div');
        info.classList.add('preview__info');

        const title = document.createElement('h3');
        title.classList.add('preview__title');
        title.textContent = this.getAttribute('title');
        info.appendChild(title);

        const author = document.createElement('div');
        author.classList.add('preview__author');
        author.textContent = this.getAttribute('author');
        info.appendChild(author);

        container.appendChild(info);
        shadow.appendChild(style);
        shadow.appendChild(container);
    }
}

customElements.define('book-preview', BookPreview);


class BookList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const books = JSON.parse(this.getAttribute('books'));
        books.forEach(book => {
            const bookPreview = document.createElement('book-preview');
            bookPreview.setAttribute('image', book.image);
            bookPreview.setAttribute('title', book.title);
            bookPreview.setAttribute('author', book.author);
            this.shadowRoot.appendChild(bookPreview);
        });
    }
}

customElements.define('book-list', BookList);



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
