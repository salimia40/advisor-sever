export default class Stack {

    constructor() {
        this.items = []
    }

    getItems = () => this.items

    push = item => this.items.push(item)

    pop = () => {
        if (this.items.length === 0)
            return "Underflow"
        return this.items.pop()
    }

    peek = () => {
        return this.items[--this.items.length]
    }

    isEmpty = () => this.items.length === 0

    printStack = () => {
        var str = "";
        for (var i = 0; i < this.items.length; i++)
            str += this.items[i] + " ";
        return str;
    }

    popTill = (int) => {
        if (--this.items.length > int) {
            // eslint-disable-next-line
            for (var i = --this.items.length; i > int, i--;) {
                this.items.pop()
            }
        }
    }

    empty = () => this.items = [];
}