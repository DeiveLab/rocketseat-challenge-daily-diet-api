import { FastifyInstance } from "fastify/types/instance";
import { knex } from "../database";
import { z } from "zod";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import { randomUUID } from "node:crypto";

export async function mealsRoutes(app: FastifyInstance) {
    app.get(
        '/', 
        {
            preHandler: [checkSessionIdExists]
        },
        async (request, reply) => {
            const sessionId = request.cookies.session_id;
            const meals = await knex("meals").where({
                session_id: sessionId,
            });
    
            return { meals };
        }
    );
    
    app.get(
        "/:id",
        {
            preHandler: [checkSessionIdExists]
        },
        async (request, reply) => {
            const sessionId = request.cookies.session_id;
            const getMealParamsSchema = z.object({
                id: z.string(),
            });
    
            const { id } = getMealParamsSchema.parse(request.params);
    
            const meal = await knex("meals").where({
                id,
                session_id: sessionId,
            }).first();
    
            if(!meal) {
                return reply.status(404).send({
                    message: "Meal not found",
                });
            }
    
            return { meal };
        }
    );
    
    app.get(
        "/info",
        {
            preHandler: [checkSessionIdExists]
        },
        async (request, reply) => {
            const sessionId = request.cookies.session_id;
    
            const meals = await knex("meals").where({
                session_id: sessionId,
            }).orderBy("created_at", "asc");
    
            const mealsCount = meals.length;
            const mealsOnDietCount = meals.filter(meal => meal.is_on_diet).length;
            const mealsOffDietCount = mealsCount - mealsOnDietCount;
    
            let bestSequenceOfMealsOnDiet = 0;
            let currentSequenceOfMealsOnDiet = 0;
    
            for(const meal of meals) {
                if(meal.is_on_diet) {
                    currentSequenceOfMealsOnDiet++;
                    continue;
                } 
    
                if(currentSequenceOfMealsOnDiet > bestSequenceOfMealsOnDiet)
                    bestSequenceOfMealsOnDiet = currentSequenceOfMealsOnDiet;
    
                currentSequenceOfMealsOnDiet = 0;
            }
    
            if(currentSequenceOfMealsOnDiet > bestSequenceOfMealsOnDiet)
                bestSequenceOfMealsOnDiet = currentSequenceOfMealsOnDiet;
    
            return {
                mealsCount,
                mealsOnDietCount,
                mealsOffDietCount,
                bestSequenceOfMealsOnDiet,
            };
        }
    )

    app.post("/", async (request, reply) => {
        const createMealSchema = z.object({
            name: z.string(),
            description: z.string(),
            is_on_diet: z.boolean(),
            created_at: z.coerce.date().optional(),
        });
    
        const { name, description, is_on_diet, created_at } = createMealSchema.parse(request.body);
    
        let sessionId = request.cookies.session_id;
    
        if(!sessionId) {
            sessionId = randomUUID();
    
            reply.cookie("session_id", sessionId, {
                path: "/",
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });
        };
    
        const createdTimestamp = created_at || new Date();
    
        const meal = await knex("meals").insert({
            id: randomUUID(),
            name,
            description,
            is_on_diet,
            session_id: sessionId,
            created_at: createdTimestamp,
        }).returning("*");
    
        return reply.status(201).send({ meal });
    });
    
    app.patch(
        "/:id",
        {
            preHandler: [checkSessionIdExists]
        },
        async (request, reply) => {
            const sessionId = request.cookies.session_id;
    
            const updateMealBodySchema = z.object({
                name: z.string().optional(),
                description: z.string().optional(),
                is_on_diet: z.boolean().optional(),
                created_at: z.coerce.date().optional(),
            });
    
            const updateMealParamsSchema = z.object({
                id: z.string(),
            });
    
            const { name, description, is_on_diet, created_at } = updateMealBodySchema.parse(request.body);
            const { id } = updateMealParamsSchema.parse(request.params);
    
            const meal = await knex("meals").where({
                id,
                session_id: sessionId,
            }).update({
                name,
                description,
                is_on_diet,
                created_at,
            }).returning("*");
    
            return { meal };
        }
    );
    
    app.delete(
        "/:id",
        {
            preHandler: [checkSessionIdExists]
        },
        async (request, reply) => {
            const sessionId = request.cookies.session_id;
    
            const deleteMealParamsSchema = z.object({
                id: z.string(),
            });
    
            const { id } = deleteMealParamsSchema.parse(request.params);
    
            await knex("meals").where({
                id,
                session_id: sessionId,
            }).delete();
    
            return reply.status(204).send();
        }
    );
}