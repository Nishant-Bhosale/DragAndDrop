var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
//Project status enum
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
//Project Class
var Project = /** @class */ (function () {
    function Project(id, title, description, numOfPeople, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.numOfPeople = numOfPeople;
        this.status = status;
    }
    return Project;
}());
//Component Base class
var Component = /** @class */ (function () {
    function Component(templateId, hostElementId, insertAtStart, newElementId) {
        this.templateElement = document.getElementById(templateId);
        this.hostElement = document.getElementById(hostElementId);
        var importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
        // this.configure();
        // this.renderContent();
    }
    Component.prototype.attach = function (attachAtBeginning) {
        this.hostElement.insertAdjacentElement(attachAtBeginning ? "afterbegin" : "beforeend", this.element);
    };
    return Component;
}());
var State = /** @class */ (function () {
    function State() {
        this.listeners = [];
    }
    State.prototype.addListeners = function (listenerFn) {
        this.listeners.push(listenerFn);
    };
    return State;
}());
//Project State Management
var ProjectState = /** @class */ (function (_super) {
    __extends(ProjectState, _super);
    function ProjectState() {
        var _this = _super.call(this) || this;
        _this.projects = [];
        return _this;
    }
    ProjectState.getInstance = function () {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    };
    ProjectState.prototype.addProject = function (title, description, numOfPeople) {
        var newObject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active);
        this.projects.push(newObject);
        for (var _i = 0, _a = this.listeners; _i < _a.length; _i++) {
            var listener = _a[_i];
            listener(this.projects.slice());
        }
    };
    return ProjectState;
}(State));
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
//ProjectItem class
var ProjectItem = /** @class */ (function (_super) {
    __extends(ProjectItem, _super);
    function ProjectItem(hostID, project) {
        var _this = _super.call(this, "single-project", hostID, false, project.id) || this;
        _this.project = project;
        _this.configure();
        _this.renderContent();
        return _this;
    }
    ProjectItem.prototype.configure = function () { };
    ProjectItem.prototype.renderContent = function () {
        this.element.querySelector("h2").textContent = this.project.title;
        this.element.querySelector("h3").textContent =
            this.project.numOfPeople.toString();
        this.element.querySelector("p").textContent = this.project.description;
    };
    return ProjectItem;
}(Component));
//ProjectLists class
var ProjectList = /** @class */ (function (_super) {
    __extends(ProjectList, _super);
    function ProjectList(type) {
        var _this = _super.call(this, "project-list", "app", false, type + "-projects") || this;
        _this.type = type;
        _this.assignedProjects = [];
        _this.configure();
        _this.renderContent();
        return _this;
    }
    ProjectList.prototype.configure = function () {
        var _this = this;
        projectState.addListeners(function (projects) {
            var relevantProjects = projects.filter(function (project) {
                if (_this.type === "active") {
                    return project.status === ProjectStatus.Active;
                }
                return project.status === ProjectStatus.Finished;
            });
            console.log(relevantProjects);
            _this.assignedProjects = relevantProjects;
            _this.renderProjects();
        });
    };
    ProjectList.prototype.renderContent = function () {
        var listId = this.type + "-projects-list";
        this.element.querySelector("ul").id = listId;
        this.element.querySelector("h2").textContent = this.type.toUpperCase() + " PROJECTS";
    };
    ProjectList.prototype.renderProjects = function () {
        var listEl = document.getElementById(this.type + "-projects-list");
        console.log(listEl);
        listEl.innerHTML = "";
        for (var _i = 0, _a = this.assignedProjects; _i < _a.length; _i++) {
            var prjItem = _a[_i];
            new ProjectItem(this.element.querySelector("ul").id, prjItem);
        }
    };
    return ProjectList;
}(Component));
var ProjectInput = /** @class */ (function (_super) {
    __extends(ProjectInput, _super);
    function ProjectInput() {
        var _this = _super.call(this, "project-input", "app", true, "user-input") || this;
        _this.titleInputElement = _this.element.querySelector("#title");
        _this.descriptionInputElement = _this.element.querySelector("#description");
        _this.peopleInputElement = _this.element.querySelector("#people");
        _this.configure();
        return _this;
    }
    ProjectInput.prototype.configure = function () {
        this.element.addEventListener("submit", this.submitHandler.bind(this));
    };
    ProjectInput.prototype.renderContent = function () { };
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
            minLength: 3,
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
            alert("Invalid");
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
        }
        this.clearInputs();
    };
    ProjectInput.prototype.clearInputs = function () {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    };
    return ProjectInput;
}(Component));
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
