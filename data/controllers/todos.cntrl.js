export class Todos {
    constructor(request) {
        this.request =  request;
    }
    
    async head(options){
        const response = await this.request.head('./todos', {...options});
        return response;
    }

    async get(options) {
        const response = await this.request.get('./todos', {...options});
        return response;
    }

    async get404(options) {
        const response = await this.request.get('./todo', {...options});
        return response;
    }

    async getId(id, options){
        const response = await this.request.get(`./todos/${id}`, {...options});
        return response;
    }
    

    async post(options){
        const response = await this.request.post(`./todos`, {...options});
        return response;
    }

    async postId(id, options){
        const response = await this.request.post(`./todos/${id}`, {...options});
        return response;
    }

    async putId(id, options) {
        const response = await this.request.put(`./todos/${id}`, {...options});
        return response;
    }

    async deleteId(id, options){
        const response = await this.request.delete(`./todos/${id}`, {...options});
        return response;
    }
}