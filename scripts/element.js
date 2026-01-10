import fusions from "./fusions.js";
import Storable from "./store.js";

const ELEMENT_EVENTS = Object.freeze({
    ADDED : 0,
    CLICKED : 1,
    INITIALIZED: 2
});

const ELEMENT_ICON_MAP =  new Map();
for (const [element,,] of fusions){
    if (!ELEMENT_ICON_MAP.has(element)){
        ELEMENT_ICON_MAP.set(element, `../icons/${element}.png`);
    }
}

const TOTAL_ELEMENTS = ELEMENT_ICON_MAP.size;

class Element{
    constructor(name){
        this.name = name;
        this.div = this.#createDiv();
    }

    #createDiv() {
        const div = document.createElement("div");
        div.className = "elementContainerItem textFormat";
        div.innerHTML = `
            <img src="${ELEMENT_ICON_MAP.get(this.name)}">
            <p>${this.name}</p>
        `;
        return div;
    }

    getDiv(){
        return this.div;
    }

    getClone(){
        return new Element(this.getName());
    }

    getName(){
        return this.name;
    }

    addClass(className){
        this.div.classList.add(className);
    }

    removeClass(className){
        this.div.classList.remove(className);
    }
}

class ElementSubject{
    constructor(){
        this.observers = [];
    }

    notify(element, eventType){
        this.observers.forEach((observer) => observer.update(this, element, eventType));
    }

    subscribe(observer){
        // Inform subject of subscription
        this.notify(null, ELEMENT_EVENTS.INITIALIZED);
        this.observers.push(observer);
    }

    unsubscribe(observer){
        this.observers = this.observers.filter((ob) => ob != observer);
    }
}

// Container for elements; Concrete Subject
class ElementManager extends ElementSubject{
    #elementContainerDiv;
    #elements;

    constructor(elementContainerDiv){
        super();
        this.#elementContainerDiv = elementContainerDiv;
        this.#elements = [];
        this.notify(null, ELEMENT_EVENTS.INITIALIZED);
    }

    addElement(element){
        this.#elementContainerDiv.appendChild(element.getDiv());
        this.#elements.push(element);
        element.getDiv().addEventListener("click", () => this.notify(element, ELEMENT_EVENTS.CLICKED));
        this.notify(element, ELEMENT_EVENTS.ADDED);
    }

    removeElement(element) {
        const index = this.#elements.indexOf(element);
        if (index === -1){
            return false;
        }

        element.getDiv().remove();
        this.#elements.splice(index, 1);
        return true;
    }

    removeAllElements(){
        this.#elements.length = 0;
        this.#elementContainerDiv.innerHTML = "";
    }


    getElements(){
        return this.#elements;
    }
}

class ElementHistory extends Storable{
    #seenElements;
    #elementUnlocksDiv;
    #elementUnlocksCounterDiv;

    constructor(elementUnlocksDiv, elementUnlocksCounterDiv){
        super("elementHistory");
        this.#elementUnlocksDiv = elementUnlocksDiv;
        this.#elementUnlocksCounterDiv = elementUnlocksCounterDiv;
        this.#seenElements = new Set(JSON.parse(this.getValue()));
    }
    // Observer method
    update(subject, element, eventType){
        if(eventType === ELEMENT_EVENTS.INITIALIZED){
            this.#initializeUnlocksDiv(subject);
            this.#updateUnlocksCounterDiv();
            return;
        }

        if (eventType != ELEMENT_EVENTS.ADDED){
            return;
        }

        const elementName = element.getName();
        if (this.#seenElements.has(elementName)){
            return;
        }

        this.#seenElements.add(elementName);
        this.#addElementToUnlocksDiv(subject, element);
        this.#updateUnlocksCounterDiv();
        this.loadValue(this.#seenElements);
    }
    
    #initializeUnlocksDiv(subject) {
        for (const elementName of this.#seenElements) {
            const element = new Element(elementName);
            this.#addElementToUnlocksDiv(subject, element);
        }
    }

    #addElementToUnlocksDiv(subject, element){
        const elementDiv = element.getClone().getDiv();
        this.#elementUnlocksDiv.appendChild(elementDiv);
        elementDiv.addEventListener("click", () => {subject.addElement(element.getClone())});
    }

    #updateUnlocksCounterDiv(){
        this.#elementUnlocksCounterDiv.innerHTML = `${this.getNumElementsSeen()}/${TOTAL_ELEMENTS}`;
    }

    getNumElementsSeen(){
        return this.#seenElements.size;
    }

    transformValue(){
        return JSON.stringify([...this.#seenElements]);
    }
}

class ElementFuser {
    #fusionMap;
    #lastClickedElement;

    constructor() {
        this.#fusionMap = new Map();
        this.#initializeFusionMap();
        this.#lastClickedElement = null;
    }

    #addFusion(elementOneName, elementTwoName, result) {
        this.#addElementIfAbsent(elementOneName).set(elementTwoName, result);
        this.#addElementIfAbsent(elementTwoName).set(elementOneName, result);
    }

    #addElementIfAbsent(elementName) {
        if (!this.#fusionMap.has(elementName)) {
            this.#fusionMap.set(elementName, new Map());
        }
        return this.#fusionMap.get(elementName);
    }

    #initializeFusionMap() {
        fusions.forEach(([result, elementOneName, elementTwoName]) => this.#addFusion(elementOneName, elementTwoName, result));
    }

    getFusionResult(elementOne, elementTwo) {
        const resultName = this.#fusionMap.get(elementOne.getName())?.get(elementTwo.getName());
        return resultName ? new Element(resultName) : null;
    }

    // Observer method
    update(subject, element, eventType){
        if (eventType != ELEMENT_EVENTS.CLICKED){
            return;
        }
        
        if (!this.#lastClickedElement){
            element.addClass("selected");
            this.#lastClickedElement = element;
            return;
        }

        const fusionResult = this.getFusionResult(element, this.#lastClickedElement);
        if (fusionResult){
            subject.removeElement(element);
            subject.removeElement(this.#lastClickedElement);
            subject.addElement(fusionResult);
        }

        this.#lastClickedElement.removeClass("selected");
        this.#lastClickedElement = null;
    }
}

export {ElementManager, Element, ElementHistory, ElementFuser};