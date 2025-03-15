export class Secret {
    constructor(request){
        this.request = request;
    }

    async postToken(options){
        const response = await this.request.post('./secret/token', {...options});
        return response;
    }

    async getNote(options){
        const response = await this.request.get('./secret/note', {...options});
        return response;
    }

    async postNote(options){
        const response = await this.request.post('./secret/note', {...options});
        return response;
    }
}