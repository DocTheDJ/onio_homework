import request from "supertest";
import { app, server as outside } from "..";
import { ObjectId } from "mongodb";


describe("Contacts", () => {
    let contactId: string;
    const server = request(app)
    test("Create new contact", async () => {
        const newContact = {
            firstName: 'John',
            lastName: 'Doe',
            email: ['john.doe@example.com'],
            phone: ['+420774292679'],
            address: [{
                street: '123 Main St',
                city: 'New York',
                postalCode: '10001',
                description: 'Home address'
            }]
        };

        const response = await server
            .post("/api/add")
            .send(newContact);

        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        contactId = response.body;
    });

    test('should get all contacts', async () => {
        const response = await request(app).get('/api/all');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('should update a contact', async () => {
        const updatedContact = {
            firstName: 'Jane',
            lastName: 'Doe',
            email: ['jane.doe@example.com'],
            phone: ['+420774292679'],
            address: [{
                street: '456 Elm St',
                city: 'Los Angeles',
                postalCode: '90001',
                description: 'Work address'
            }]
        };

        const response = await request(app)
            .post('/api/update')
            .query({ id: contactId })
            .send(updatedContact);

        expect(response.status).toBe(200);
        expect(response.body.updated).toBe(1);
    });

    test('should delete a contact', async () => {
        const response = await request(app)
            .get('/api/delete')
            .query({ id: contactId });

        expect(response.status).toBe(200);
        expect(response.body.deleted).toBe(1);
    });

    test('should return 404 when updating a non-existent contact', async () => {
        const nonExistentId = new ObjectId().toHexString();
        const updatedContact = {
            firstName: 'Jane',
            lastName: 'Doe'
        };

        const response = await request(app)
            .post('/api/update')
            .query({ id: nonExistentId })
            .send(updatedContact);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('No item fits the filter');
    });

    test('should return 400 when creating a contact with invalid data', async () => {
        const invalidContact = {
            firstName: '', // Invalid: empty first name
            lastName: 'Doe',
            email: ['invalid-email'], // Invalid email
            phone: ['+1234567890'],
            address: [{
                street: '123 Main St',
                city: 'New York',
                postalCode: '10001',
                description: 'Home address'
            }]
        };

        const response = await request(app)
            .post('/api/add')
            .send(invalidContact);

        expect(response.status).toBe(400);
        expect(Array.isArray(response.body)).toBe(true);
    });

    outside.close();
});