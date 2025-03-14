import { expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { test } from '../data/fixture/fixture';
import { newChallengeStatus, newGuid } from '../data/mocks/api.challenge'; 

let xAuthToken;
let todosDB;
let todosSet;
let inSystemXchallenger;
let allTodos;


test.describe('API challenge', ()=> {
   test.beforeAll(async ({ token }) => {
        console.log(token)
    });

    test.describe('First Real Challenge', ()=> {
        test('@GET /challenges (200)', async({ challenges, token }) => {
            const response = await challenges.get({
                headers: {
                'x-challenger' : token,
            }});
            const body = (await response.json()).challenges;
            expect(response.status()).toBe(200);
            expect(body).toHaveLength(59);
        });
    });

    test.describe('GET Challenges', ()=> {
        test('@GET /todos (200)', async({ todos, token }) => {
            const response = await todos.get({
                headers: {
                'x-challenger' : token,
            }});
            
            allTodos = (await response.json()).todos;
            expect(response.status()).toBe(200);
            expect(allTodos).toHaveLength(10);
            
        });

        test('@GET /todo (404) not plural', async({ todos, token }) => {
            const response = await todos.get404({
                headers: {
                'x-challenger' : token,
            }});
            const body = (await response.body()).data;
            expect(response.status()).toBe(404);
            expect(body).toBeFalsy();

        });

        test('@GET /todos/{id} (200)', async({ todos, token }) => {
            //при использовании params тест не засчитывается
                /*
                params: {
                    id: 11,
                }
                */
            const response = await todos.getId(5, {
                headers: {
                'x-challenger' : token,
            }});

            const body = (await response.json()).todos;
            expect(response.status()).toBe(200);
            expect(body).toContainEqual({
                id: 5,
                title: 'pay invoices',
                doneStatus: false,
                description: ''
            });
            
        });

        test('GET /todos/{id} (404)', async({ todos, token }) => {
            const response = await todos.getId(11, {
                headers: {
                'x-challenger' : token,
            }});
                //при использовании params тест не засчитывается
                /*
                params: {
                    id: 11,
                }
                */
            const body = (await response.body()).data;
            expect(response.status()).toBe(404);
            expect(body).toBeFalsy();
        });

        //тест из другого блока, нужен для выполнения следующего теста
        test('@POST /todos/{id} (200)', async({ todos, token }) => {
            const response = await todos.postId(5, {
                headers: {
                    'x-challenger' : token,
                },
                data: {
                    doneStatus: true,
                }
            })
            const body = await response.json();
            expect(response.status()).toBe(200);
            expect(body).toMatchObject({doneStatus: true});
        });

        
        test('@GET /todos (200) ?filter', async({ todos, token }) => {
            const response = await todos.get({
                headers: {
                    'x-challenger' : token,
                },
                params: {
                    doneStatus: true,
                }
            });
            const body = (await response.json()).todos
            expect(response.status()).toBe(200);
            expect(body).toContainEqual({
                id: 5, 
                title: 'pay invoices', 
                doneStatus: true, 
                description: ''
            })
            
            
        
        });
    });
    test.describe('HEAD Challenges', ()=> {
        test('@HEAD /todos (200)', async({ todos, token }) => {
            const response = await todos.head({
                headers: {
                'x-challenger' : token,
            }})
            const body = (await response.body()).data;
            expect(response.status()).toBe(200);
            expect(body).toBeFalsy();
        })
    })

    test.describe('Creation Challenges with POST', ()=> {
        test('@POST /todos (201)', async({ todos, token }) => {
            const response = await todos.post({
                headers: {
                    'x-challenger' : token,
                },
                data: {
                    title: 'new awesome todo',
                    doneStatus: true,
                    description: 'Do nothing, enjoy life!'
                }
            });
            const body = await response.json();
            expect(response.status()).toBe(201);
            expect(body).toHaveProperty('title', 'new awesome todo');
        });
        
        test('POST /todos (400) doneStatus', async({ todos, token }) => {
            const response = await todos.post({
                headers: {
                    'x-challenger' : token,
                },
                data: {
                    title: 'wrong todo',
                    doneStatus: 2,
                    description: ''
                }
            });
            const errorMessages = (await response.json()).errorMessages;
            expect(response.status()).toBe(400);
            expect(errorMessages).toContain('Failed Validation: doneStatus should be BOOLEAN but was NUMERIC');

        })
        
        test('@POST /todos (400) title too long', async({ todos, token }) => {
            const response = await todos.post({
                headers: {
                    'x-challenger' : token,
                },
                data: {
                    title: faker.string.alpha(51),
                    doneStatus: false,
                    description: 'too long title'
                }
            });
            const errorMessages = (await response.json()).errorMessages;
            expect(response.status()).toBe(400);
            expect(errorMessages).toContain('Failed Validation: Maximum allowable length exceeded for title - maximum allowed is 50');
        });
        
       test('@POST /todos (400) description too long', async({ todos, token }) => {
            const response = await todos.post({
                headers: {
                    'x-challenger' : token,
                },
                data: {
                    title: 'too long description',
                    doneStatus: false,
                    description: faker.string.alpha(201)
                }
            });
            const errorMessages = (await response.json()).errorMessages;
            expect(response.status()).toBe(400)
            expect(errorMessages).toContain('Failed Validation: Maximum allowable length exceeded for description - maximum allowed is 200');
        });
        
        test('@POST /todos (201) max out content', async({ todos, token }) => {
            const response = await todos.post({
                headers: {
                    'x-challenger' : token,
                },
                data: {
                    title: faker.string.alpha(50),
                    doneStatus: false,
                    description: faker.string.alpha(200),
                }
            });
            const title = (await response.json()).title;
            const description = (await response.json()).description;
            expect(response.status()).toBe(201);
            expect(title).toHaveLength(50);
            expect(description).toHaveLength(200);
        });

        test('@POST /todos (413) content too long', async({ todos, token }) => {
            const response = await todos.post({
                headers: {
                    'x-challenger' : token,
                },
                data: {
                    title: 'tooooo long description',
                    doneStatus: false,
                    description: faker.string.alpha(5000),
                }
            });
            const errorMessages = (await response.json()).errorMessages;
            expect(response.status()).toBe(413);
            expect(errorMessages).toContain('Error: Request body too large, max allowed is 5000 bytes');
        });

        test('@POST /todos (400) extra', async({ todos, token }) => {
            const response = await todos.post({
                headers: {
                    'x-challenger' : token,
                },
                data: {
                    title: 'unrecognised field',
                    doneStatus: false,
                    description: '',
                    color: 'red'
                }
            });
            const errorMessages = (await response.json()).errorMessages;
            expect(response.status()).toBe(400);
            expect(errorMessages).toContain('Could not find field: color');
        });
    });

    test.describe('Creation Challenges with PUT', () => {
        test('@PUT /todos/{id} (400)', async({ todos, token }) => {
            const response = await todos.putId(100, {
                headers: {
                    'x-challenger' : token,
                },
                data: {
                    title: 'put can not create',
                    doneStatus: false,
                    description: 'put can not create',
                    
                }
            });
            const errorMessages = (await response.json()).errorMessages;
            expect(response.status()).toBe(400);
            expect(errorMessages).toContain('Cannot create todo with PUT due to Auto fields id');
        });
    });

    test.describe('Update Challenges with POST', () => {
        //тест №17 уже сделан в блоке GET Challenges

        test('@POST /todos/{id} (404)', async({ todos, token }) => {
            const response = await todos.postId(100, {
                headers: {
                    'x-challenger' : token,
                },
                data: {
                    title: 'new title',
                }
            });
            const errorMessages = (await response.json()).errorMessages;
            expect(response.status()).toBe(404);
            expect(errorMessages).toContain('No such todo entity instance with id == 100 found');
        });
    });

    test.describe('Update Challenges with PUT', () => {
        test('@PUT /todos/{id} full (200)', async({ todos, token }) => {
            const response = await todos.putId(1, {
                headers: {
                    'x-challenger' : token,
                },
                data: {
                    title: 'this todo was changed',
                    doneStatus: true,
                    description: 'this todo was changed'
                }
            });
            const title = (await response.json()).title;
            expect(response.status()).toBe(200);
            expect(title).toContain('this todo was changed');
        })

        test('@PUT /todos/{id} partial (200)', async({ todos, token }) => {
            const response = await todos.putId(2, {
                headers: {
                    'x-challenger' : token,
                },
                data: {
                    title: 'this title was changed'
                }
            });
            const title = (await response.json()).title;
            expect(response.status()).toBe(200);
            expect(title).toContain('this title was changed');
        });
        
        test('@PUT /todos/{id} no title (400)', async({ todos, token }) => {
            const response = await todos.putId(3, {
                headers: {
                    'x-challenger' : token,
                },
                data: {
                    description: 'no title'
                },
            });
            const errorMessages = (await response.json()).errorMessages;
            expect(response.status()).toBe(400);
            expect(errorMessages).toContain('title : field is mandatory');
        });

        test('@PUT /todos/{id} no amend id (400)', async({ todos, token }) => {
            const response = await todos.putId(4, {
                headers: {
                    'x-challenger' : token,
                },
                data: {
                    id: 5,
                    title: 'no id in payload',
                    description: 'no id in payload',
                },
            });
            const errorMessages = (await response.json()).errorMessages;
            expect(response.status()).toBe(400);
            expect(errorMessages).toContain('Can not amend id from 4 to 5');
        });
    });

    test.describe('DELETE Challenges', () => {
        test('@DELETE /todos/{id} (200)', async({ todos, token }) => {
            const response = await todos.deleteId(5, {
                headers: {
                    'x-challenger' : token,
                }, 
            });
            const body = (await response.body()).data;
            expect(response.status()).toBe(200);
            expect(body).toBeFalsy();
        });
    });

    test.describe('Accept Challenges', () => {
        test('@GET /todos (200) XML', async({ todos, token }) => {
            const response = await todos.get({
                headers: {
                    'x-challenger' : token,
                    'Accept': 'application/xml',
                }
            });
            const contentType = await response.headers()['content-type'];
            expect(response.status()).toBe(200);
            expect(contentType).toContain('application/xml');
        });

        test('@GET /todos (200) JSON', async({ todos, token }) => {
            const response = await todos.get({
                headers: {
                    'x-challenger' : token,
                    'Accept': 'application/json',
                }
            });
            const contentType = await response.headers()['content-type'];
            expect(response.status()).toBe(200);
            expect(contentType).toContain('application/json');
        });

        test('GET /todos (200) ANY', async({ todos,  token }) => {
            const response = await todos.get({
                headers: {
                    'x-challenger' : token,
                    'Accept': '*/*',
                }
            });
            const contentType = await response.headers()['content-type'];
            expect(response.status()).toBe(200);
            expect(contentType).toContain('application/json');
        });

        test('@GET /todos (200) XML pref', async({ todos, token }) => {
            const response = await todos.get({
                headers: {
                    'x-challenger' : token,
                    'Accept': 'application/xml, application/json',
                }
            });
            const contentType = await response.headers()['content-type'];
            expect(response.status()).toBe(200);
            expect(contentType).toContain('application/xml');
        })
        /* todo пока непонятно как убрать заголовок
        test.only('@GET /todos (200) no accept', async({ playwright, token }) => {
            const apiRequest = await playwright.request.newContext();
            const todos = new Todos(apiRequest);
            const response = await todos.get({
                extraHTTPHeaders : {
                    'x-challenger' : token,
                    'Accept': undefined,
                },
            })
            expect(response.status()).toBe(200);
            expect(await response.headers()['content-type']).toContain('application/json');
        })
       */

        test('@GET /todos (406)', async({ todos, token }) => {
            const response = await todos.get({
                headers: {
                    'x-challenger' : token,
                    'Accept': 'application/gzip',
                }
            });
            const errorMessages = (await response.json()).errorMessages;
            expect(response.status()).toBe(406);
            expect(errorMessages).toContain('Unrecognised Accept Type');
        })
    })
    
    test.describe('Content-Type Challenges', () => {
        test('@POST /todos XML', async({ todos, token }) => {
            const response = await todos.post({
                headers: {
                    'x-challenger' : token,
                    'Accept': 'application/xml',
                    'Content-Type': 'application/xml',
                },
                data: `<todo>
                        <title>create new todo</title>
                        <description>xml in payload</description>
                       </todo>`
                });
                const body = (await response.text());
                const cleanBody = body.replace(/<id>\d+<\/id>/, '');
                expect(response.status()).toBe(201)
                expect(cleanBody).toContain(`<todo><doneStatus>false</doneStatus><description>xml in payload</description><title>create new todo</title></todo>`);
            });
        
        test('@POST /todos JSON', async({ todos, token }) => {
            const response = await todos.post({
                headers: {
                    'x-challenger' : token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                data: {
                    title: 'create new todo',
                    description: 'json in payload'
                }
            });
            const body = await response.json();
            expect(response.status()).toBe(201);
            expect(body).toMatchObject({
                title: 'create new todo',
                description: 'json in payload'
            });
        });

        test('@POST /todos (415)', async({ todos, token }) => {
            const response = await todos.post({
                headers: {
                'x-challenger' : token,
                'Content-Type': 'application/x-www-form-urlencoded',
                },
                form: {
                    title: 'create new todo',
                    description: 'form-urlencoded in payload'
                }
            });
            const errorMessages = (await response.json()).errorMessages;
            expect(response.status()).toBe(415);
            expect(errorMessages).toContain('Unsupported Content Type - application/x-www-form-urlencoded');
        });
    });

    test.describe('Fancy a Break? Restore your session', () => {
        test('@GET /challenger/guid (existing X-CHALLENGER)', async({ challenger, token }) => {
            const response = await challenger.getGuid(token, {
                headers:{
                    'x-challenger' : token,
                }
            })
            todosSet = await response.json();
            inSystemXchallenger = todosSet.xChallenger;
            expect(response.status()).toBe(200);
            expect(todosSet).toHaveProperty('challengeStatus')
        });
      
        test('@PUT /challenger/guid RESTORE', async({ challenger, token }) => {
            const response = await challenger.putGuid(inSystemXchallenger, {
                headers:{
                    'x-challenger' : token,
                },
                data: todosSet,
            })
            const body = await response.json()
            expect(response.status()).toBe(200);
            expect(body).toHaveProperty('challengeStatus')
        })
        
        test('@PUT /challenger/guid CREATE', async({ challenger }) => { 
            console.log(newGuid);
            todosSet['xAuthToken'] = '';
            todosSet['xChallenger'] = `${newGuid}`;
            const response = await challenger.putGuid(newGuid, {
                headers: {
                    'x-challenger' : newGuid,
                },
                data: todosSet,
            })
            const headers = (await response.headers())['x-challenger'];
            expect(response.status()).toBe(201);
            expect(headers).toContain(newGuid);
        });
        
        
        test('@GET /challenger/database/guid (200)', async({ challenger, token }) => {
            const response = await challenger.getDataBase(token, {
                headers: {
                    'x-challenger' : token,
                }
            })
            todosDB = await response.json();
            const todos = (await response.json()).todos;
            expect(response.status()).toBe(200);
            expect(todos).toHaveLength(13);
        })
        
        test('@PUT /challenger/database/guid (Update)', async({ challenger, token }) => {
            const response = await challenger.putDataBase(token, {
                headers: {
                    'x-challenger' : token,
                },
                data: todosDB,
                
            })
            const body = (await response.body()).data;
            expect(response.status()).toBe(204);
            expect(body).toBeFalsy()
        })
    })
    
    test.describe('Mix Accept and Content-Type Challenges', () => {
        test('@POST /todos XML to JSON', async({ todos, token }) => {
            const response = await todos.post({
                headers: {
                    'x-challenger' : token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/xml',
                },
                data:  `<todo>
                        <title>create new todo</title>
                        <description>xml in payload</description>
                       </todo>`
                    });
            const body = await response.json();
            expect(response.status()).toBe(201);
            expect(body).toMatchObject({
                title: 'create new todo',
                doneStatus: false,
                description: 'xml in payload'
            });
        });

        test('@POST /todos JSON to XML', async({ todos, token }) => {
            const response = await todos.post({
                headers: {
                    'x-challenger' : token,
                    'Accept': 'application/xml',
                    'Content-Type': 'application/json',
                },
                data: {
                    title: 'json to xml',
                    description: 'json to xml',
                },
            });
            const body = (await response.text());
            const cleanBody = body.replace(/<id>\d+<\/id>/, '');
            expect(response.status()).toBe(201);
            expect(cleanBody).toContain('<todo><doneStatus>false</doneStatus><description>json to xml</description><title>json to xml</title></todo>');
        })
    })
    test.describe('Status Code Challenges', () => {
        test('DELETE /heartbeat (405)', async({ heartbeat, token }) => {
            const response = await heartbeat.delete({
                headers: {
                    'x-challenger' : token,
                }
            });
            const body = (await response.body()).data;
            expect(response.status()).toBe(405)
            expect(body).toBeFalsy();
        });

        test('@PATCH /heartbeat (500)', async({ heartbeat, token }) => {
            const response = await heartbeat.patch({
                headers: {
                    'x-challenger' : token,
                },
                data: {
                    heartbeat: null,
                }
            });
            const body = (await response.body()).data
            expect(response.status()).toBe(500);
            expect(body).toBeFalsy();
        });

        test('@GET /heartbeat (204)', async({ heartbeat, token }) => {
            const response = await heartbeat.get({
                headers: {
                    'x-challenger' : token,
                },
            });
            const body = (await response.body()).data
            expect(response.status()).toBe(204);
            expect(body).toBeFalsy();
        });
    });
    
    test.describe('HTTP Method Override Challenges', () => {
        test('@POST /heartbeat as DELETE (405)', async({ heartbeat, token }) => {
            const response = await heartbeat.post({
                headers: {
                    'x-challenger' : token,
                    'X-HTTP-Method-Override' : 'delete',
                }
            });
            const body = (await response.body()).data
            expect(response.status()).toBe(405);
            expect(body).toBeFalsy();
        });

        test('@POST /heartbeat as PATCH (500)', async({ heartbeat, token }) => {
            const response = await heartbeat.post({
                headers: {
                    'x-challenger' : token,
                    'X-HTTP-Method-Override' : 'patch',
                },
                data: {
                    color: 'red',
                },
            });
            const body = (await response.body()).data;
            expect(response.status()).toBe(500);
            expect(body).toBeFalsy();
        });

        test('@POST /heartbeat as Trace (501)', async({ heartbeat, token }) => { 
            const response = await heartbeat.post({
                headers: {
                    'x-challenger' : token,
                    'X-HTTP-Method-Override' : 'trace',
                },
            });
            const body = (await response.body()).data;
            expect(response.status()).toBe(501);
            expect(body).toBeFalsy();
        });
    });

    test.describe('Authentication Challenges', () => {
        test('@POST /secret/token (401)', async({ secret, token }) => {
            const response = await secret.postToken({
                headers: {
                    'x-challenger': token,
                    'Authorization': `Basic ${btoa('admin1:password1')}`
                },
            });
            const body = (await response.body()).data;
            expect(response.status()).toBe(401);
            expect(body).toBeFalsy();
        });

        test('POST /secret/token (201)', async({ secret, token }) => {
            const response = await secret.postToken({
                headers: {
                    'x-challenger': token,
                    'Authorization': `Basic ${btoa('admin:password')}`
                }
            });
            xAuthToken = (await response.headers())['x-auth-token'];
            expect(response.status()).toBe(201);
            expect(await response.headers()).toHaveProperty('x-auth-token');
            
        });
    });

    test.describe('Authorization Challenges', () => {
        test('@GET /secret/note (403)', async({ secret, token }) => {
            const response = await secret.getNote({
                headers: {
                    'x-challenger': token,
                    'X-AUTH-TOKEN': token,
                }
            });
            const body = (await response.body()).data;
            expect(response.status()).toBe(403)
            expect(body).toBeFalsy();
        });

        test('@GET /secret/note (401)', async({ secret, token }) => {
            const response = await secret.getNote({
                headers: {
                    'x-challenger': token,
                }
            });
            const body = (await response.body()).data;
            expect(response.status()).toBe(401);
            expect(body).toBeFalsy();
        });
        
        test('@GET /secret/note (200)', async({ secret, token }) => {
            const response = await secret.getNote({
                headers: {
                    'x-challenger': token,
                    'X-AUTH-TOKEN': xAuthToken,
                }
            });
            expect(response.status()).toBe(200);
            expect(await response.json()).toHaveProperty('note');
        });

        test('@POST /secret/note (200)', async({ secret, token }) => {
            const response = await secret.postNote({
                headers: {
                    'x-challenger': token,
                    'X-AUTH-TOKEN': xAuthToken,
                },
                data: {
                    'note': 'my note for this challenge',
                }
            });
            const note = (await response.json()).note;
            expect(response.status()).toBe(200);
            expect(note).toMatch('my note for this challenge');
        });

        test('POST /secret/note (401)', async({ secret, token }) => {
            const response = await secret.postNote({
                headers: {
                    'x-challenger': token,
                },
                data: {
                    'note': 'no x-auth-token for this challenge'
                }
            });
            const body = (await response.body()).data;
            expect(response.status()).toBe(401);
            expect(body).toBeFalsy();
        });

        test('@POST /secret/note (403)', async({ secret, token }) => {
            const response = await secret.postNote({
                headers: {
                    'x-challenger': token,
                    'X-AUTH-TOKEN': token,
                },
                data: {
                    'note': 'false x-auth-token for this challenge'
                }
            });
            const body = (await response.body()).data;
            expect(response.status()).toBe(403);
            expect(body).toBeFalsy();
        });

        test('@GET /secret/note (Bearer)', async({ secret, token }) => {
            const response = await secret.getNote({
                headers: {
                    'x-challenger': token,
                    'Authorization': `Bearer ${xAuthToken}`,
                },

            })
            const body = await response.json();
            expect(response.status()).toBe(200);
            expect(body).toHaveProperty('note');
        })

        test('POST /secret/note (Bearer)', async({ secret, token }) => {
            const response = await secret.postNote({
                headers: {
                    'x-challenger': token,
                    'Authorization': `Bearer ${xAuthToken}`,
                },
                data: {
                    'note': 'my note for this challenge'
                }
            });
            const note = (await response.json()).note;
            expect(response.status()).toBe(200);
            expect(note).toMatch('my note for this challenge');
        });
    });
});
  


