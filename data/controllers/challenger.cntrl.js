export class Challenger {
    constructor(request) {
        this.request = request;
    }

    async post(){
        const response = await this.request.post('./challenger');
        return response;
    }

    async getGuid(guid, options){
        const response = await this.request.get(`./challenger/${guid}`, {...options});
        return response;
    }

    async putGuid(guid, options){
        const response = await this.request.put(`./challenger/${guid}`, {...options});
        return response;
    }
    async getDataBase(guid, options){
        const response = await this.request.get(`./challenger/database/${guid}`, {...options});
        return response;
    }

    async putDataBase(guid, options){
        const response = await this.request.put(`./challenger/database/${guid}`, {...options});
        return response;
    }

}