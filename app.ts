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

		if (
			titleInput.trim().length === 0 ||
			descriptionInput.trim().length === 0 ||
			peopleInput.trim().length === 0
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
