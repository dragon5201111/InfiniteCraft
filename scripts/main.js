import {ElementManager, Element, ElementHistory, ElementFuser} from "./element.js";
import {DivFilter} from './util.js';

const startingElements = [
    new Element("water"),
    new Element("fire"),
    new Element("earth"),
    new Element("air"),
]

const divFilter = new DivFilter();

const elementUnlocksDiv = document.getElementsByClassName("elementUnlocks")[0];
const elementUnlocksCounterDiv = document.getElementsByClassName("elementUnlocksCounter")[0];
const elementContainerDiv = document.getElementsByClassName("elementContainer")[0];
const elementClearDiv = document.getElementById("elementClear");

const elementSearchInput = document.getElementsByClassName("elementSearch")[0];
divFilter.attach(elementSearchInput, ()=> {
    const inputText = elementSearchInput.value.toLowerCase();
    const elementDivs = Array.from(elementUnlocksDiv.children);
    elementDivs.forEach((elementDiv) => {
        elementDiv.classList.remove("hidden");

        if (!elementDiv.textContent.toLowerCase().includes(inputText)){
            elementDiv.classList.add("hidden");
        }
    });
});

const elementHistory = new ElementHistory(elementUnlocksDiv, elementUnlocksCounterDiv);
const elementFuser = new ElementFuser();

const elementManager = new ElementManager(elementContainerDiv);

elementClearDiv.addEventListener("click", () => elementManager.removeAllElements());
elementManager.subscribe(elementHistory);
elementManager.subscribe(elementFuser);

startingElements.forEach((element) => elementManager.addElement(element));