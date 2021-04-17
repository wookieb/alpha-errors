import {Domain} from "./Domain";

export class Registry {
	readonly domains = new Set<Domain>();

	createDomain(options: Partial<Domain.Options> = {}) {
		const domain = new Domain(options);
		this.domains.add(domain);
		return domain;
	}
}