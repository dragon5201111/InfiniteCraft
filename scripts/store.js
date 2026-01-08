export default class Storable{
    #keyName;

    constructor(keyName){
        this.#keyName = keyName;
    }

    loadValue(value){
        localStorage.setItem(this.getKey(), this.transformValue(value));
    }

    transformValue(value){
        throw new Error(`Cannot call abstract transformValue with ${value}`);
    }

    getValue(){
        return localStorage.getItem(this.getKey());
    }

    clearValue(){
        localStorage.removeItem(this.getKey());
    }

    getKey(){
        return this.#keyName;
    }
}