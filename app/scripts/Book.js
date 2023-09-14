// A class representing a book

// default means that the class is the only thing exported
export default class Book{

    // private fields denoted with #
    #reserved;
    #onLoan;
    title;
    author;

    constructor(title, author) {
        this.title = title;
        this.author = author;
        this.#reserved = false;
        this.#onLoan = false;
    }

    get available() {
        if(this.#onLoan === false && this.#reserved === false){
            return 'Available';
        } else {
            return 'Not Available';
        }
    }

    set reserve(status) {
        this.#reserved = status;
    }

    /**
     * @param {boolean} status
     */
    set loan(status) {
        this.#onLoan = status;
    }
}

export class ComicBook extends Book{

    illustrator;

    constructor(title, author, illustrator) {
        super(title, author);
        this.illustrator = illustrator;
    }

    get illustrator() {
        return this.illustrator;
    }
}