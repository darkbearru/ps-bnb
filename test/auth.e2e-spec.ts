import { INestApplication } from '@nestjs/common';
import { JwtResponse } from '../src/types/jwt.types';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { disconnect } from 'mongoose';
import { RegisterUserDto } from '../src/auth/dto/register-user.dto';
import { adminUser } from './auth-data';
import {
	AUTH_NAME_ERROR,
	AUTH_PASSWORD_ERROR,
	AUTH_PASSWORD_MIN_ERROR,
	AUTH_PHONE_ERROR,
	AUTH_WRONG_EMAIL_ERROR,
	AUTH_WRONG_PASSWORD_ERROR,
} from '../src/auth/auth.constants';

const registerUser: RegisterUserDto = {
	email: 'test@test.ru',
	password: '123456',
	name: 'Super Test',
	phone: '+79145555555',
};

describe('Room (e2e)', () => {
	let app: INestApplication;
	let user: JwtResponse;
	let admin: JwtResponse;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.setGlobalPrefix('api');
		await app.init();

		const { body } = await request(app.getHttpServer()).post('/api/auth/login').send(adminUser);
		admin = body;
	});

	it('/api/auth/register (Post): success', async () => {
		return request(app.getHttpServer())
			.post('/api/auth/register')
			.send(registerUser)
			.expect(201)
			.then(({ body }: request.Response) => {
				user = body;
				expect(user.accessToken).toBeDefined();
			});
	});

	it('/api/auth/register (Post): email fail', async () => {
		return request(app.getHttpServer())
			.post('/api/auth/register')
			.send({ ...registerUser, email: 123 })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(AUTH_WRONG_EMAIL_ERROR)).not.toBe(-1);
			});
	});

	it('/api/auth/register (Post): fail, password ', async () => {
		return request(app.getHttpServer())
			.post('/api/auth/register')
			.send({ ...registerUser, password: 123 })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(AUTH_PASSWORD_ERROR)).not.toBe(-1);
			});
	});

	it('/api/auth/register (Post): fail, password min len ', async () => {
		return request(app.getHttpServer())
			.post('/api/auth/register')
			.send({ ...registerUser, password: '123' })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(AUTH_PASSWORD_MIN_ERROR)).not.toBe(-1);
			});
	});

	it('/api/auth/register (Post): fail, name ', async () => {
		return request(app.getHttpServer())
			.post('/api/auth/register')
			.send({ ...registerUser, name: 123 })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(AUTH_NAME_ERROR)).not.toBe(-1);
			});
	});

	it('/api/auth/register (Post): fail, phone ', async () => {
		return request(app.getHttpServer())
			.post('/api/auth/register')
			.send({ ...registerUser, phone: 123 })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(AUTH_PHONE_ERROR)).not.toBe(-1);
			});
	});

	it('/api/auth/login (Post): success ', async () => {
		return request(app.getHttpServer())
			.post('/api/auth/login')
			.send({ email: registerUser.email, password: registerUser.password })
			.expect(200)
			.then(({ body }: request.Response) => {
				user = body;
				expect(user.accessToken).toBeDefined();
			});
	});

	it('/api/auth/login (Post): fail, password format ', async () => {
		return request(app.getHttpServer())
			.post('/api/auth/login')
			.send({ email: registerUser.email, password: 123 })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(AUTH_PASSWORD_ERROR)).not.toBe(-1);
			});
	});

	it('/api/auth/login (Post): fail, password ', async () => {
		return request(app.getHttpServer())
			.post('/api/auth/login')
			.send({ email: registerUser.email, password: '7654567' })
			.expect(403)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(AUTH_WRONG_PASSWORD_ERROR)).not.toBe(-1);
			});
	});

	it('/api/auth/delete/:id (delete): success', async () => {
		return request(app.getHttpServer())
			.delete(`/api/auth/delete/${user?.user?.id}`)
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.expect(200);
	});

	it('/api/auth/delete/:id (delete): wrong role', async () => {
		return request(app.getHttpServer())
			.delete(`/api/auth/delete/${user?.user?.id}`)
			.set('Authorization', `Bearer ${user.accessToken}`)
			.expect(403);
	});

	afterAll(async () => {
		return disconnect();
	});
});
