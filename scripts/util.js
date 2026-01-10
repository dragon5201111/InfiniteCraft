class DivFilter {
    #funcMap;

    constructor() {
        this.#funcMap = new Map();
    }

    attach(input, func) {
        if (this.#funcMap.has(input)) {
            return;
        }

        input.addEventListener("input", func, true);
        this.#funcMap.set(input, func);
    }

    detach(input) {
        const func = this.#funcMap.get(input);
        if (func) {
            input.removeEventListener("input", func, true);
            this.#funcMap.delete(input);
        }
    }
}

export {DivFilter};