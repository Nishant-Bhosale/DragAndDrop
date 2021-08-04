"use strict";
//Project status enum
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
//Project Class
class Project {
    constructor(id, title, description, numOfPeople, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.numOfPeople = numOfPeople;
        this.status = status;
    }
}
//Component Base class
class Component {
    constructor(templateId, hostElementId, insertAtStart, newElementId) {
        this.templateElement = document.getElementById(templateId);
        this.hostElement = document.getElementById(hostElementId);
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
        this.configure();
        // this.renderContent();
    }
    attach(attachAtBeginning) {
        this.hostElement.insertAdjacentElement(attachAtBeginning ? "afterbegin" : "beforeend", this.element);
    }
}
//Project State Management
class ProjectState {
    constructor() {
        this.listeners = [];
        this.projects = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addProject(title, description, numOfPeople) {
        const newObject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active);
        this.projects.push(newObject);
        for (const listener of this.listeners) {
            listener(this.projects.slice());
        }
    }
    addListeners(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
const projectState = ProjectState.getInstance();
function validate(validatableObject) {
    let isValid = true;
    if (validatableObject.required) {
        isValid = isValid && validatableObject.value.toString().trim().length !== 0;
    }
    if (validatableObject.minLength != null &&
        typeof validatableObject.value === "string") {
        isValid =
            isValid && validatableObject.value.length >= validatableObject.minLength;
    }
    if (validatableObject.maxLength != null &&
        typeof validatableObject.value === "string") {
        isValid =
            isValid && validatableObject.value.length <= validatableObject.maxLength;
    }
    if (validatableObject.min != null &&
        typeof validatableObject.value === "number") {
        isValid = isValid && validatableObject.value >= validatableObject.min;
    }
    if (validatableObject.max != null &&
        typeof validatableObject.value === "number") {
        isValid = isValid && validatableObject.value <= validatableObject.max;
    }
    return isValid;
}
//ProjectLists class
class ProjectList extends Component {
    constructor(type) {
        super("project-list", "app", false, `${type}-projects`);
        this.type = type;
        this.assignedProjects = [];
        this.renderContent();
        this.renderProjects();
    }
    configure() {
        projectState.addListeners((projects) => {
            const relevantProjects = projects.filter((project) => {
                if (this.type === "active") {
                    return project.status === ProjectStatus.Active;
                }
                return project.status === ProjectStatus.Finished;
            });
            console.log(relevantProjects);
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul").id = listId;
        this.element.querySelector("h2").textContent = `${this.type.toUpperCase()} PROJECTS`;
    }
    renderProjects() {
        let listEl = document.getElementById(`${this.type}-projects-list`);
        console.log(listEl);
        listEl.innerHTML = "";
        for (const prjItem of this.assignedProjects) {
            const listItem = document.createElement("li");
            listItem.textContent = prjItem.title;
            listEl.appendChild(listItem);
        }
    }
}
class ProjectInput extends Component {
    constructor() {
        super("project-input", "app", true, "user-input");
        this.titleInputElement = this.element.querySelector("#title");
        this.descriptionInputElement = this.element.querySelector("#description");
        this.peopleInputElement = this.element.querySelector("#people");
        this.configure();
    }
    configure() {
        this.element.addEventListener("submit", this.submitHandler.bind(this));
    }
    renderContent() { }
    getInputs() {
        const titleInput = this.titleInputElement.value;
        const descriptionInput = this.descriptionInputElement.value;
        const peopleInput = this.peopleInputElement.value;
        const titleValidatable = {
            value: titleInput,
            required: true,
        };
        const descriptionValidatable = {
            value: descriptionInput,
            required: true,
            minLength: 3,
            maxLength: 100,
        };
        const peopleValidatable = {
            value: peopleInput,
            required: true,
            min: 1,
            max: 5,
        };
        if (!validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)) {
            return;
        }
        else {
            return [titleInput, descriptionInput, +peopleInput];
        }
    }
    // @autobind
    submitHandler(event) {
        event.preventDefault();
        const userInputs = this.getInputs();
        if (Array.isArray(userInputs)) {
            const [title, desc, people] = userInputs;
            projectState.addProject(title, desc, people);
        }
        this.clearInputs();
    }
    clearInputs() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }
}
const prjInput = new ProjectInput();
const activePrjs = new ProjectList("active");
const finishedPrjs = new ProjectList("finished");
// function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
// 	const originalDescriptor = descriptor.value;
// 	const adjDescriptor: PropertyDescriptor = {
// 		configurable: true,
// 		enumerable: false,
// 		get() {
// 			const boundFn = originalDescriptor.bind(this);
// 			return boundFn;
// 		},
// 	};
// 	return adjDescriptor;
// }
