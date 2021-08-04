//Project State Management
var ProjectState = /** @class */ (function () {
    function ProjectState() {
        this.projects = [];
        this.listeners = [];
    }
    ProjectState.getInstance = function () {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    };
    ProjectState.prototype.addProject = function (title, description, numOfPeople) {
        var newObject = {
            id: Math.random().toString(),
            title: title,
            description: description,
            people: numOfPeople
        };
        this.projects.push(newObject);
        for (var _i = 0, _a = this.listeners; _i < _a.length; _i++) {
            var listener = _a[_i];
            listener(this.projects.slice());
        }
    };
    ProjectState.prototype.addListeners = function (listenerFn) {
        this.listeners.push(listenerFn);
    };
    return ProjectState;
}());
var projectState = ProjectState.getInstance();
function validate(validatableObject) {
    var isValid = true;
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
var ProjectList = /** @class */ (function () {
    function ProjectList(type) {
        var _this = this;
        this.type = type;
        this.assignedProjects = [];
        this.templateElement = document.getElementById("project-list");
        this.hostElement = document.getElementById("app");
        var importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = this.type + "-projects";
        projectState.addListeners(function (projects) {
            _this.assignedProjects = projects;
            _this.renderProjects();
        });
        this.attach();
        this.renderContent();
    }
    ProjectList.prototype.renderProjects = function () {
        var listEl = document.getElementById(this.type + "-projects-list");
        for (var _i = 0, _a = this.assignedProjects; _i < _a.length; _i++) {
            var prjItem = _a[_i];
            var listItem = document.createElement("li");
            listItem.textContent = prjItem.title;
            listEl.appendChild(listItem);
        }
    };
    ProjectList.prototype.renderContent = function () {
        var listId = this.type + "-projects-list";
        this.element.querySelector("ul").id = listId;
        this.element.querySelector("h2").textContent = this.type.toUpperCase() + " PROJECTS";
    };
    ProjectList.prototype.attach = function () {
        this.hostElement.insertAdjacentElement("beforeend", this.element);
    };
    return ProjectList;
}());
var ProjectInput = /** @class */ (function () {
    function ProjectInput() {
        this.templateElement = document.getElementById("project-input");
        this.hostElement = document.getElementById("app");
        var importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = "user-input";
        this.titleInputElement = this.element.querySelector("#title");
        this.descriptionInputElement = this.element.querySelector("#description");
        this.peopleInputElement = this.element.querySelector("#people");
        this.attach();
        this.configure();
    }
    ProjectInput.prototype.getInputs = function () {
        var titleInput = this.titleInputElement.value;
        var descriptionInput = this.descriptionInputElement.value;
        var peopleInput = this.peopleInputElement.value;
        var titleValidatable = {
            value: titleInput,
            required: true
        };
        var descriptionValidatable = {
            value: descriptionInput,
            required: true,
            minLength: 5,
            maxLength: 100
        };
        var peopleValidatable = {
            value: peopleInput,
            required: true,
            min: 1,
            max: 5
        };
        if (!validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)) {
            alert("Enter valid details");
            return;
        }
        else {
            return [titleInput, descriptionInput, +peopleInput];
        }
    };
    // @autobind
    ProjectInput.prototype.submitHandler = function (event) {
        event.preventDefault();
        var userInputs = this.getInputs();
        if (Array.isArray(userInputs)) {
            var title = userInputs[0], desc = userInputs[1], people = userInputs[2];
            projectState.addProject(title, desc, people);
            console.log(title, desc, people);
        }
        this.clearInputs();
    };
    ProjectInput.prototype.clearInputs = function () {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    };
    ProjectInput.prototype.configure = function () {
        this.element.addEventListener("submit", this.submitHandler.bind(this));
    };
    ProjectInput.prototype.attach = function () {
        this.hostElement.insertAdjacentElement("afterbegin", this.element);
    };
    return ProjectInput;
}());
var prjInput = new ProjectInput();
var activePrjs = new ProjectList("active");
var finishedPrjs = new ProjectList("finished");
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
