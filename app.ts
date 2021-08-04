//Project status enum
enum ProjectStatus {
	Active,
	Finished,
}

//Project Class
class Project {
	constructor(
		public id: string,
		public title: string,
		public description: string,
		public numOfPeople: number,
		public status: ProjectStatus,
	) {}
}

//Component Base class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
	templateElement: HTMLTemplateElement;
	hostElement: T;
	element: U;

	constructor(
		templateId: string,
		hostElementId: string,
		insertAtStart: boolean,
		newElementId?: string,
	) {
		this.templateElement = document.getElementById(
			templateId,
		)! as HTMLTemplateElement;
		this.hostElement = document.getElementById(hostElementId)! as T;

		const importedNode = document.importNode(
			this.templateElement.content,
			true,
		);

		this.element = importedNode.firstElementChild as U;

		if (newElementId) {
			this.element.id = newElementId;
		}

		this.attach(insertAtStart);
		this.configure();
		// this.renderContent();
	}

	private attach(attachAtBeginning: boolean) {
		this.hostElement.insertAdjacentElement(
			attachAtBeginning ? "afterbegin" : "beforeend",
			this.element,
		);
	}

	abstract configure(): void;
	abstract renderContent(): void;
}

//Custom Listener Type
type Listener = (items: Project[]) => void;

//Project State Management
class ProjectState {
	private listeners: Listener[] = [];
	private projects: any[] = [];
	private static instance: ProjectState;

	private constructor() {}

	static getInstance() {
		if (this.instance) {
			return this.instance;
		}
		this.instance = new ProjectState();
		return this.instance;
	}

	addProject(title: string, description: string, numOfPeople: number) {
		const newObject = new Project(
			Math.random().toString(),
			title,
			description,
			numOfPeople,
			ProjectStatus.Active,
		);

		this.projects.push(newObject);
		for (const listener of this.listeners) {
			listener(this.projects.slice());
		}
	}

	addListeners(listenerFn: Listener) {
		this.listeners.push(listenerFn);
	}
}

const projectState = ProjectState.getInstance();

interface validatable {
	value: string | number;
	required?: boolean;
	maxLength?: number;
	minLength?: number;
	min?: number;
	max?: number;
}

function validate(validatableObject: validatable) {
	let isValid = true;

	if (validatableObject.required) {
		isValid = isValid && validatableObject.value.toString().trim().length !== 0;
	}
	if (
		validatableObject.minLength != null &&
		typeof validatableObject.value === "string"
	) {
		isValid =
			isValid && validatableObject.value.length >= validatableObject.minLength;
	}
	if (
		validatableObject.maxLength != null &&
		typeof validatableObject.value === "string"
	) {
		isValid =
			isValid && validatableObject.value.length <= validatableObject.maxLength;
	}
	if (
		validatableObject.min != null &&
		typeof validatableObject.value === "number"
	) {
		isValid = isValid && validatableObject.value >= validatableObject.min;
	}
	if (
		validatableObject.max != null &&
		typeof validatableObject.value === "number"
	) {
		isValid = isValid && validatableObject.value <= validatableObject.max;
	}

	return isValid;
}

//ProjectLists class
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
	assignedProjects: Project[] = [];

	constructor(private type: "finished" | "active") {
		super("project-list", "app", false, `${type}-projects`);

		this.renderContent();
		this.renderProjects();
	}

	configure() {
		projectState.addListeners((projects: Project[]) => {
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
		const listId: string = `${this.type}-projects-list`;
		this.element.querySelector("ul")!.id = listId;
		this.element.querySelector(
			"h2",
		)!.textContent = `${this.type.toUpperCase()} PROJECTS`;
	}

	private renderProjects() {
		let listEl = document.getElementById(
			`${this.type}-projects-list`,
		)! as HTMLUListElement;

		console.log(listEl);
		listEl.innerHTML = "";
		for (const prjItem of this.assignedProjects) {
			const listItem = document.createElement("li");
			listItem.textContent = prjItem.title;
			listEl.appendChild(listItem);
		}
	}
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
	titleInputElement: HTMLInputElement;
	descriptionInputElement: HTMLInputElement;
	peopleInputElement: HTMLInputElement;

	constructor() {
		super("project-input", "app", true, "user-input");

		this.titleInputElement = this.element.querySelector(
			"#title",
		) as HTMLInputElement;
		this.descriptionInputElement = this.element.querySelector(
			"#description",
		) as HTMLInputElement;
		this.peopleInputElement = this.element.querySelector(
			"#people",
		) as HTMLInputElement;

		this.configure();
	}

	configure() {
		this.element.addEventListener("submit", this.submitHandler.bind(this));
	}

	renderContent() {}

	private getInputs(): [string, string, number] | void {
		const titleInput = this.titleInputElement.value;
		const descriptionInput = this.descriptionInputElement.value;
		const peopleInput = this.peopleInputElement.value;

		const titleValidatable: validatable = {
			value: titleInput,
			required: true,
		};

		const descriptionValidatable: validatable = {
			value: descriptionInput,
			required: true,
			minLength: 3,
			maxLength: 100,
		};

		const peopleValidatable: validatable = {
			value: peopleInput,
			required: true,
			min: 1,
			max: 5,
		};

		if (
			!validate(titleValidatable) ||
			!validate(descriptionValidatable) ||
			!validate(peopleValidatable)
		) {
			return;
		} else {
			return [titleInput, descriptionInput, +peopleInput];
		}
	}

	// @autobind
	private submitHandler(event: Event) {
		event.preventDefault();
		const userInputs = this.getInputs();
		if (Array.isArray(userInputs)) {
			const [title, desc, people] = userInputs;
			projectState.addProject(title, desc, people);
		}
		this.clearInputs();
	}

	private clearInputs() {
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
