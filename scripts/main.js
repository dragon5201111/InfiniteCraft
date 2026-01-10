import {ElementManager, Element, ElementHistory, ElementFuser} from "./element.js";

const startingElements = [
    new Element("water"),
    new Element("fire"),
    new Element("earth"),
    new Element("air"),
]

const elementUnlocksDiv = document.getElementsByClassName("elementUnlocks")[0];
const elementUnlocksCounterDiv = document.getElementsByClassName("elementUnlocksCounter")[0];
const elementContainerDiv = document.getElementsByClassName("elementContainer")[0];
const elementClearDiv = document.getElementById("elementClear");

const elementHistory = new ElementHistory(elementUnlocksDiv, elementUnlocksCounterDiv);
const elementFuser = new ElementFuser();

const elementSearchInput = document.getElementsByClassName("elementSearch")[0];
elementSearchInput.addEventListener("input", () => elementHistory.filterElementUnlocksDiv(elementSearchInput.value.toLowerCase()));


const elementManager = new ElementManager(elementContainerDiv);

elementClearDiv.addEventListener("click", () => elementManager.removeAllElements());
elementManager.subscribe(elementHistory);
elementManager.subscribe(elementFuser);

startingElements.forEach((element) => elementManager.addElement(element));