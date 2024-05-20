/**
 * Renders a list of book previews from the specified range of books.
 * @param {Array} books - The array of books to render previews for.
 * @param {number} start - The index to start rendering from.
 * @param {number} end - The index to end rendering at.
 * @returns {DocumentFragment} - The document fragment containing the book previews.
 */

export function renderBookList(books, start, end) {
    const fragment = document.createDocumentFragment();
    for (const { author, id, image, title } of books.slice(start, end)) {
        const bookPreview = document.createElement('book-preview');
        bookPreview.setAttribute('data-author', data.authors[author]);
        bookPreview.setAttribute('data-id', id);
        bookPreview.setAttribute('data-image', image);
        bookPreview.setAttribute('data-title', title)
        fragment.appendChild(bookPreview);
    }
    return fragment;
}


/**
 * Sets the theme of the application to either 'day' or 'night'.
 * @param {string} theme - The theme to set ('day' or 'night').
 */
export function setTheme(theme) {
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
 * @param {Object} options - The options object containing key-value pairs.
 * @param {string} firstOptionText - The text for the first option (default).
 */
export function populateSelectElement(selectElement, options, firstOptionText) {
    const fragment = document.createDocumentFragment();
    const firstOption = document.createElement('option');
    firstOption.value = 'any';
    firstOption.innerText = firstOptionText;
    fragment.appendChild(firstOption);
    for (const [id, name] of Object.entries(options)) {
        const option = document.createElement('option');
        option.value - id;
        option.innerText = name;
        fragment.appendChild(option);
    }
    selectElement.appendChild(fragment);
}