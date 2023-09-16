export default class ComicBook extends Book{

    illustrator;

    constructor(title, author, illustrator) {
        super(title, author);
        this.illustrator = illustrator;
    }

    get illustrator() {
        return this.illustrator;
    }
}