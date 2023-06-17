import { describe, expect, it, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { execSync } from 'node:child_process';

describe('Meals routes e2e tests', () => {
    beforeAll(async () => {
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        execSync('npm run knex -- migrate:rollback --all');
        execSync('npm run knex -- migrate:latest');
    });

    it('should be able to create a meal', async () => {
        const response = await request(app.server)
            .post('/meals')
            .send({
                name: 'Pizza',
                description: 'A delicious pizza',
                is_on_diet: false,
            })
            .expect(201);
    });

    it('should be able to list all meals', async () => {
        const createMealResponse = await request(app.server)
            .post('/meals')
            .send({
                name: 'Pizza',
                description: 'A delicious pizza',
                is_on_diet: false,
            })
            .expect(201);

        const cookies = createMealResponse.get('Set-Cookie');

        const listMealsResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', cookies)
            .expect(200);

        expect(listMealsResponse.body.meals).toEqual([
            expect.objectContaining({
                name: 'Pizza',
                description: 'A delicious pizza',
                is_on_diet: 0,
            }),
        ]);

    })

    it('should be able to get one individual meal', async () => {
        const createMealResponse = await request(app.server)
            .post('/meals')
            .send({
                name: 'Pizza',
                description: 'A delicious pizza',
                is_on_diet: false,
            })
            .expect(201);

        const cookies = createMealResponse.get('Set-Cookie');

        const listMealsResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', cookies)
            .expect(200);

        const mealId = listMealsResponse.body.meals[0].id;

        const getMealResponse = await request(app.server)
            .get(`/meals/${mealId}`)
            .set('Cookie', cookies)
            .expect(200);

        expect(getMealResponse.body.meal).toEqual(
            expect.objectContaining({
                name: 'Pizza',
                description: 'A delicious pizza',
                is_on_diet: 0,
            }),
        );
    });

    it('should be able to update a meal', async () => {
        const createMealResponse = await request(app.server)
            .post('/meals')
            .send({
                name: 'Pizza',
                description: 'A delicious pizza',
                is_on_diet: false,
            })
            .expect(201);

        const cookies = createMealResponse.get('Set-Cookie');

        const listMealsResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', cookies)
            .expect(200);

        const mealId = listMealsResponse.body.meals[0].id;

        const updateMealResponse = await request(app.server)
            .patch(`/meals/${mealId}`)
            .set('Cookie', cookies)
            .send({
                name: 'Pizza',
                description: 'A delicious pizza',
                is_on_diet: true,
            })
            .expect(200);

        expect(updateMealResponse.body.meal).toEqual([
            expect.objectContaining({
                name: 'Pizza',
                description: 'A delicious pizza',
                is_on_diet: 1,
            }),
        ]
        );
    });

    it('should be able to delete a meal', async () => {
        const createMealResponse = await request(app.server)
            .post('/meals')
            .send({
                name: 'Pizza',
                description: 'A delicious pizza',
                is_on_diet: false,
            })
            .expect(201);

        const cookies = createMealResponse.get('Set-Cookie');

        const listMealsResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', cookies)
            .expect(200);

        const mealId = listMealsResponse.body.meals[0].id;

        const deleteMealResponse = await request(app.server)
            .delete(`/meals/${mealId}`)
            .set('Cookie', cookies)
            .expect(204);

        const listMealsResponseAfterDeletion = await request(app.server)
            .get('/meals')
            .set('Cookie', cookies)
            .expect(200);

        expect(listMealsResponseAfterDeletion.body.meals).toEqual([]);
    });

    it('should be able to get meals info', async () => {
        const createMealResponse = await request(app.server)
            .post('/meals')
            .send({
                name: 'Pizza',
                description: 'A delicious pizza',
                is_on_diet: false,
            })
            .expect(201);

        const cookies = createMealResponse.get('Set-Cookie');

        await request(app.server)
            .post('/meals')
            .set('Cookie', cookies)
            .send({
                name: 'Salad',
                description: 'A tasteless salad',
                is_on_diet: true,
            })
            .expect(201);

        await request(app.server)
            .post('/meals')
            .set('Cookie', cookies)
            .send({
                name: 'Donut',
                description: 'A delicious donut',
                is_on_diet: false,
            })
            .expect(201);
        
        await request(app.server)
            .post('/meals')
            .set('Cookie', cookies)
            .send({
                name: 'herbs',
                description: 'Why. God?',
                is_on_diet: true,
            })
            .expect(201);

        await request(app.server)
            .post('/meals')
            .set('Cookie', cookies)
            .send({
                name: 'Creatine',
                description: 'I feel... powerful',
                is_on_diet: true,
            })
            .expect(201);

        const getMealInfoResponse = await request(app.server)
            .get(`/meals/info`)
            .set('Cookie', cookies)
            .expect(200);

        expect(getMealInfoResponse.body).toEqual(
            {
                mealsCount: 5,
                mealsOnDietCount: 3,
                mealsOffDietCount: 2,
                bestSequenceOfMealsOnDiet: 2
            }
        );
    });

});

