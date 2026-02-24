import swaggerJSDoc from "swagger-jsdoc";

export function createSwaggerSpec() {
  return swaggerJSDoc({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Users API",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:8080",
        },
      ],
      paths: {
        "/users": {
          get: {
            summary: "List users",
            responses: {
              "200": {
                description: "OK",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
          },
          post: {
            summary: "Create user",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CreateUserInput" },
                },
              },
            },
            responses: {
              "201": {
                description: "Created",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/User" },
                  },
                },
              },
              "400": { description: "Validation error" },
              "409": { description: "Conflict" },
            },
          },
        },
        "/health": {
          get: {
            summary: "Health check",
            responses: {
              "200": {
                description: "OK",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Health" },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          User: {
            type: "object",
            properties: {
              id: { type: "integer", example: 1 },
              name: { type: "string", example: "Alice" },
              email: { type: "string", example: "alice@mail.com" },
              createdAt: { type: "string", format: "date-time" },
            },
            required: ["name", "email"],
          },
          CreateUserInput: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string" },
            },
            required: ["name", "email"],
          },
          Health: {
            type: "object",
            properties: {
              status: { type: "string", example: "ok" },
            },
            required: ["status"],
          },
        },
      },
    },
    apis: [],
  });
}
