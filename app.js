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
        // this.configure();
        // this.renderContent();
    }
    attach(attachAtBeginning) {
        this.hostElement.insertAdjacentElement(attachAtBeginning ? "afterbegin" : "beforeend", this.element);
    }
}
class State {
    constructor() {
        this.listeners = [];
    }
    addListeners(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
//Project State Management
class ProjectState extends State {
    constructor() {
        super();
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
//ProjectItem class
class ProjectItem extends Component {
    constructor(hostID, project) {
        super("single-project", hostID, false, project.id);
        this.project = project;
        this.configure();
        this.renderContent();
    }
    get persons() {
        if (this.project.numOfPeople === 1) {
            return "1 person assigned";
        }
        else {
            return `${this.project.numOfPeople} persons assigned`;
        }
    }
    dragStartHandler(event) {
        console.log(event);
    }
    dragEndHandler(_) {
        console.log("drag end");
    }
    configure() {
        this.element.addEventListener("dragstart", this.dragStartHandler.bind(this));
        this.element.addEventListener("dragend", this.dragEndHandler.bind(this));
    }
    renderContent() {
        this.element.querySelector("h2").textContent = this.project.title;
        this.element.querySelector("h3").textContent = this.persons;
        this.element.querySelector("p").textContent = this.project.description;
    }
}
//ProjectLists class
class ProjectList extends Component {
    constructor(type) {
        super("project-list", "app", false, `${type}-projects`);
        this.type = type;
        this.assignedProjects = [];
        this.configure();
        this.renderContent();
    }
    dragOverHandler(_) {
        const listEl = this.element.querySelector("ul");
        listEl.classList.add("droppable");
    }
    dragLeaveHandler(_) {
        const listEl = this.element.querySelector("ul");
        listEl.classList.remove("droppable");
    }
    dropHandler(_) { }
    configure() {
        this.element.addEventListener("dragover", this.dragOverHandler.bind(this));
        this.element.addEventListener("dragleave", this.dragLeaveHandler.bind(this));
        projectState.addListeners((projects) => {
            const relevantProjects = projects.filter((project) => {
                if (this.type === "active") {
                    return project.status === ProjectStatus.Active;
                }
                return project.status === ProjectStatus.Finished;
            });
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
        listEl.innerHTML = "";
        for (const prjItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector("ul").id, prjItem);
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
            alert("Invalid");
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
