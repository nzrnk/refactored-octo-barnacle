export class Challenges {
    constructor(request) {
        this.request = request;
    }

    async get(data) {
        const response = await this.request.get('./challenges', {...data})
        return response;
    }
}