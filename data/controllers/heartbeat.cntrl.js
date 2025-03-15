export class Heartbeat {
    constructor(request){
        this.request = request;
    }

    async delete(options){
        const response = await this.request.delete('./heartbeat', {...options});
        return response;
    }

    async patch(options){
        const response = await this.request.patch('./heartbeat', {...options});
        return response;
    }

    async get(options){
        const response = await this.request.get('./heartbeat', {...options});
        return response;
    }

    async post(options){
        const response = await this.request.post('./heartbeat', {...options});
        return response;
    }
}