import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect, Types } from 'mongoose';
import { CreateScheduleDto } from '../src/schedule/dto/create-schedule.dto';
import { SCHEDULE_CREATE_ERROR, SCHEDULE_NOT_DATE_ERROR } from '../src/schedule/schedule.constants';
import { adminUser, regularUser } from './auth-data';
import { LoginUserDto } from '../src/auth/dto/login-user.dto';
import { JwtResponse } from '../src/types/jwt.types';

const roomId: string = new Types.ObjectId().toHexString();
let scheduleId: string;

const scheduleDto: CreateScheduleDto = {
	startAt: '2025-02-16',
	endAt: '2025-02-25',
	roomId,
};

let admin: JwtResponse;
let user: JwtResponse;

describe('Schedule (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.setGlobalPrefix('api');
		await app.init();

		admin = await getUserData(app, adminUser);
		user = await getUserData(app, regularUser);
	});

	it('/api/schedule/create (Post): success', async () => {
		return request(app.getHttpServer())
			.post('/api/schedule/create')
			.set('Authorization', `Bearer ${user.accessToken}`)
			.send(scheduleDto)
			.expect(201)
			.then(({ body }: request.Response) => {
				scheduleId = body._id;
				expect(scheduleId).toBeDefined();
			});
	});

	it('/api/schedule/create (Post): fail user', async () => {
		return request(app.getHttpServer())
			.post('/api/schedule/create')
			.send(scheduleDto)
			.expect(401);
	});

	it('/api/schedule/create (Post): fail, startAt', async () => {
		return request(app.getHttpServer())
			.post('/api/schedule/create')
			.set('Authorization', `Bearer ${user.accessToken}`)
			.send({ ...scheduleDto, startAt: '252010' })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(SCHEDULE_NOT_DATE_ERROR)).not.toBe(-1);
			});
	});

	it('/api/schedule/create (Post): fail', async () => {
		return request(app.getHttpServer())
			.post('/api/schedule/create')
			.set('Authorization', `Bearer ${user.accessToken}`)
			.send({ ...scheduleDto, startAt: '2024-12-16' })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(SCHEDULE_CREATE_ERROR)).not.toBe(-1);
			});
	});

	it('/api/schedule/create (Post): fail', async () => {
		return request(app.getHttpServer())
			.post('/api/schedule/create')
			.set('Authorization', `Bearer ${user.accessToken}`)
			.send({ ...scheduleDto, startAt: '2025-02-16', endAt: '2025-02-18' })
			.expect(400);
	});

	it('/api/schedule/create (Post): fail', async () => {
		return request(app.getHttpServer())
			.post('/api/schedule/create')
			.set('Authorization', `Bearer ${user.accessToken}`)
			.send({ ...scheduleDto, startAt: '2025-02-18', endAt: '2025-02-28' })
			.expect(400);
	});

	it('/api/schedule/create (Post): fail', async () => {
		return request(app.getHttpServer())
			.post('/api/schedule/create')
			.set('Authorization', `Bearer ${user.accessToken}`)
			.send({ ...scheduleDto, startAt: '2025-02-01', endAt: '2025-02-18' })
			.expect(400);
	});

	it('/api/schedule/:id (Patch): success', async () => {
		return request(app.getHttpServer())
			.patch(`/api/schedule/${scheduleId}`)
			.set('Authorization', `Bearer ${user.accessToken}`)
			.send({ ...scheduleDto, endAt: '2025-02-20' })
			.expect(200);
	});

	it('/api/schedule/:id (Patch): fail', async () => {
		return request(app.getHttpServer())
			.patch(`/api/schedule/${scheduleId}`)
			.set('Authorization', `Bearer ${user.accessToken}`)
			.send({ ...scheduleDto, startAt: '2025-02-21', endAt: '2025-02-18' })
			.expect(400);
	});

	it('/api/schedule/updateStatus/:id/:status (Patch): success', async () => {
		return request(app.getHttpServer())
			.patch(`/api/schedule/updateStatus/${scheduleId}/1`)
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.expect(200);
	});

	it('/api/schedule/updateStatus/:id/:status (Patch): wrong role', async () => {
		return request(app.getHttpServer())
			.patch(`/api/schedule/updateStatus/${scheduleId}/1`)
			.set('Authorization', `Bearer ${user.accessToken}`)
			.expect(403);
	});

	it('/api/schedule/:id (Soft Delete): success', async () => {
		return request(app.getHttpServer())
			.delete(`/api/schedule/${scheduleId}`)
			.set('Authorization', `Bearer ${user.accessToken}`)
			.expect(200);
	});

	it('/api/schedule/:id (Soft Delete): fail user', async () => {
		return request(app.getHttpServer()).delete(`/api/schedule/${scheduleId}`).expect(401);
	});

	it('/api/schedule/delete/:id (Hard Delete): success', async () => {
		return request(app.getHttpServer())
			.delete(`/api/schedule/delete/${scheduleId}`)
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.expect(200);
	});

	it('/api/schedule/delete/:id (Hard Delete): wrong role', async () => {
		return request(app.getHttpServer())
			.delete(`/api/schedule/delete/${scheduleId}`)
			.set('Authorization', `Bearer ${user.accessToken}`)
			.expect(403);
	});

	afterAll(async () => {
		return disconnect();
	});
});

async function getUserData(app: INestApplication, user: LoginUserDto): Promise<JwtResponse> {
	const { body } = await request(app.getHttpServer()).post('/api/auth/login').send(user);
	return body;
}
