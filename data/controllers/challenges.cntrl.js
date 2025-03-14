export class Challenges {
    constructor(request) {
        this.request = request;
    }

    async get(options) {
        const response = await this.request.get('./challenges', {...options})
        return response;
    }
}