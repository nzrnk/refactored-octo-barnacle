import { test as base } from '@playwright/test';
import { Challenges, Todos, Challenger, Heartbeat, Secret, } from '../controllers';

export const test = base.extend({
    token: [async({ playwright }, use) => {
        const apiRequest = await playwright.request.newContext();
        const challenger = new Challenger(apiRequest);
        const response = await challenger.post();
        const headers = response.headers();
        const token = headers['x-challenger'];
        await use(token);
    }, {scope : 'worker' }],

    challenger: async({ request }, use) => {
        const challenger = new Challenger(request);
        await use(challenger);
    },

    challenges: async({ request }, use) => {
        const challenges = new Challenges(request);
        await use(challenges);
    },

    todos: async({ request }, use) => {
        const todos = new Todos(request);
        await use(todos);
    },

    heartbeat: async({ request }, use) => {
        const heartbeat = new Heartbeat(request);
        await use(heartbeat);
    },

    secret: async({ request }, use) => {
        const secret = new Secret(request);
        await use(secret);
    }

});