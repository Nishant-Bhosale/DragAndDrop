//Project State Management
class ProjectState {
	private projects: any[] = [];
	private static instance: ProjectState;
	private listeners: any[] = [];

	private constructor() {}

	static getInstance() {
		if (this.instance) {
			return this.instance;
		}
		this.instance = new ProjectState();
		return this.instance;
	}

	addProject(title: string, description: string, numOfPeople: number) {
		const newObject = {
			id: Math.random().toString(),
			title,
			description,
			people: numOfPeople,
		};

		this.projects.push(newObject);
		for (const listener of this.listeners) {
			listener(this.projects.slice());
		}
	}

	addListeners(listenerFn: Function) {
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

class ProjectList {
	templateElement: HTMLTemplateElement;
	hostElement: HTMLDivElement;
	element: HTMLElement;
	assignedProjects: any[] = [];

	constructor(private type: "finished" | "active") {
		this.templateElement = document.getElementById(
			"project-list",
		)! as HTMLTemplateElement;
		this.hostElement = document.getElementById("app")! as HTMLDivElement;

		const importedNode = document.importNode(
			this.templateElement.content,
			true,
		);

		this.element = importedNode.firstElementChild as HTMLElement;
		this.element.id = `${this.type}-projects`;

		projectState.addListeners((projects: any[]) => {
			this.assignedProjects = projects;
			this.renderProjects();
		});

		this.attach();
		this.renderContent();
	}

	private renderProjects() {
		const listEl = document.getElementById(
			`${this.type}-projects-list`,
		)! as HTMLUListElement;

		for (const prjItem of this.assignedProjects) {
			const listItem = document.createElement("li");
			listItem.textContent = prjItem.title;

			listEl.appendChild(listItem);
		}
	}

	private renderContent() {
		const listId: string = `${this.type}-projects-list`;
		this.element.querySelector("ul")!.id = listId;
		this.element.querySelector(
			"h2",
		)!.textContent = `${this.type.toUpperCase()} PROJECTS`;
	}

	private attach() {
		this.hostElement.insertAdjacentElement("beforeend", this.element);
	}
}

class ProjectInput {
	templateElement: HTMLTemplateElement;
	hostElement: HTMLDivElement;
	element: HTMLFormElement;
	titleInputElement: HTMLInputElement;
	descriptionInputElement: HTMLInputElement;
	peopleInputElement: HTMLInputElement;

	constructor() {
		this.templateElement = document.getElementById(
			"project-input",
		)! as HTMLTemplateElement;
		this.hostElement = document.getElementById("app")! as HTMLDivElement;

		const importedNode = document.importNode(
			this.templateElement.content,
			true,
		);

		this.element = importedNode.firstElementChild as HTMLFormElement;
		this.element.id = "user-input";

		this.titleInputElement = this.element.querySelector(
			"#title",
		) as HTMLInputElement;
		this.descriptionInputElement = this.element.querySelector(
			"#description",
		) as HTMLInputElement;
		this.peopleInputElement = this.element.querySelector(
			"#people",
		) as HTMLInputElement;

		this.attach();
		this.configure();
	}

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
			minLength: 5,
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
			alert("Enter valid details");
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
			console.log(title, desc, people);
		}
		this.clearInputs();
	}

	private clearInputs() {
		this.titleInputElement.value = "";
		this.descriptionInputElement.value = "";
		this.peopleInputElement.value = "";
	}

	private configure() {
		this.element.addEventListener("submit", this.submitHandler.bind(this));
	}

	private attach() {
		this.hostElement.insertAdjacentElement("afterbegin", this.element);
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
