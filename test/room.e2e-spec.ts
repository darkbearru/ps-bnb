import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect } from 'mongoose';
import { CreateRoomDto } from '../src/room/dto/create-room.dto';
import { RoomTypes } from '../src/room/room.types';
import {
	ROOM_AMENITIES_ERROR,
	ROOM_DESCRIPTION_ERROR,
	ROOM_MAX_LENGTH_ERROR,
	ROOM_MAX_SQUARE_ERROR,
	ROOM_MIN_LENGTH_ERROR,
	ROOM_MIN_SQUARE_ERROR,
	ROOM_NAME_ERROR,
	ROOM_NUMBER_ERROR,
	ROOM_SQUARE_ERROR,
	ROOM_TYPE_ERROR,
} from '../src/room/room.constants';
import { adminUser, regularUser } from './auth-data';
import { JwtResponse } from '../src/types/jwt.types';
import { LoginUserDto } from '../src/auth/dto/login-user.dto';

let roomId: string;
const roomDto: CreateRoomDto = {
	num: 2001,
	type: RoomTypes.ONE_ROOM,
	name: 'Однокомнатная',
	square: 25,
	description: 'Просто однокомнатная квартира',
	amenities: ['Чайник', 'Кофемашина', 'Холодильник'],
};

describe('Room (e2e)', () => {
	let app: INestApplication;
	let admin: JwtResponse;
	let user: JwtResponse;

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

	it('/api/room/create (Post): success', async () => {
		return request(app.getHttpServer())
			.post('/api/room/create')
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send(roomDto)
			.expect(201)
			.then(({ body }: request.Response) => {
				roomId = body._id;
				expect(roomId).toBeDefined();
			});
	});

	it('/api/room/create (Post): wrong role', async () => {
		return request(app.getHttpServer())
			.post('/api/room/create')
			.set('Authorization', `Bearer ${user.accessToken}`)
			.send(roomDto)
			.expect(403);
	});

	it('/api/room/create (Post): fail, number', async () => {
		return request(app.getHttpServer())
			.post('/api/room/create')
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({ ...roomDto, num: '12' })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(ROOM_NUMBER_ERROR)).not.toBe(-1);
			});
	});

	it('/api/room/create (Post): fail, type', async () => {
		return request(app.getHttpServer())
			.post('/api/room/create')
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({ ...roomDto, type: 4 })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(ROOM_TYPE_ERROR)).not.toBe(-1);
			});
	});

	it('/api/room/create (Post): fail, name', async () => {
		return request(app.getHttpServer())
			.post('/api/room/create')
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({ ...roomDto, name: 4 })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(ROOM_NAME_ERROR)).not.toBe(-1);
			});
	});

	it('/api/room/create (Post): fail, name min length', async () => {
		return request(app.getHttpServer())
			.post('/api/room/create')
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({ ...roomDto, name: 'low' })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(ROOM_MIN_LENGTH_ERROR)).not.toBe(-1);
			});
	});

	it('/api/room/create (Post): fail, name max length', async () => {
		return request(app.getHttpServer())
			.post('/api/room/create')
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({ ...roomDto, name: String('low').repeat(20) })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(ROOM_MAX_LENGTH_ERROR)).not.toBe(-1);
			});
	});

	it('/api/room/create (Post): fail, bad square', async () => {
		return request(app.getHttpServer())
			.post('/api/room/create')
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({ ...roomDto, square: '5' })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(ROOM_SQUARE_ERROR)).not.toBe(-1);
			});
	});

	it('/api/room/create (Post): fail, square min', async () => {
		return request(app.getHttpServer())
			.post('/api/room/create')
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({ ...roomDto, square: 5 })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(ROOM_MIN_SQUARE_ERROR)).not.toBe(-1);
			});
	});

	it('/api/room/create (Post): fail, square max', async () => {
		return request(app.getHttpServer())
			.post('/api/room/create')
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({ ...roomDto, square: 3200 })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(ROOM_MAX_SQUARE_ERROR)).not.toBe(-1);
			});
	});

	it('/api/room/create (Post): fail, description', () => {
		return request(app.getHttpServer())
			.post('/api/room/create')
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({ ...roomDto, description: 5 })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(ROOM_DESCRIPTION_ERROR)).not.toBe(-1);
			});
	});

	it('/api/room/create (Post): fail, amenities', () => {
		return request(app.getHttpServer())
			.post('/api/room/create')
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({ ...roomDto, amenities: 5 })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(ROOM_AMENITIES_ERROR)).not.toBe(-1);
			});
	});

	it('/api/room/all (Get): success', async () => {
		return request(app.getHttpServer()).get(`/api/room/all`).expect(200);
	});

	it('/api/room/:id (Get): success', async () => {
		return request(app.getHttpServer())
			.get(`/api/room/${roomId}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body.name).toBe(roomDto.name);
			});
	});

	it('/api/room/:id (Get): fail, bad id format', async () => {
		return request(app.getHttpServer()).get(`/api/room/3213`).expect(404);
	});

	it('/api/room/:id (Patch): success', async () => {
		return request(app.getHttpServer())
			.patch(`/api/room/${roomId}`)
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({ name: 'Правка' })
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body.name).toBe('Правка');
			});
	});

	it('/api/room/:id (Patch): fail, number', async () => {
		return request(app.getHttpServer())
			.patch(`/api/room/${roomId}`)
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({ num: '5' })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(ROOM_NUMBER_ERROR)).not.toBe(-1);
			});
	});

	it('/api/room/:id (Patch): fail, type', async () => {
		return request(app.getHttpServer())
			.patch(`/api/room/${roomId}`)
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({ type: 5 })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(ROOM_TYPE_ERROR)).not.toBe(-1);
			});
	});

	it('/api/room/:id (Patch): fail, name', async () => {
		return request(app.getHttpServer())
			.patch(`/api/room/${roomId}`)
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({ name: 5 })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(ROOM_NAME_ERROR)).not.toBe(-1);
			});
	});

	it('/api/room/:id (Patch): fail, name min length', async () => {
		return request(app.getHttpServer())
			.patch(`/api/room/${roomId}`)
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({ name: 'low' })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(ROOM_MIN_LENGTH_ERROR)).not.toBe(-1);
			});
	});

	it('/api/room/:id (Patch): fail, name max length', async () => {
		return request(app.getHttpServer())
			.patch(`/api/room/${roomId}`)
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({ name: String('low').repeat(20) })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(ROOM_MAX_LENGTH_ERROR)).not.toBe(-1);
			});
	});

	it('/api/room/:id (Patch): fail, bad square', async () => {
		return request(app.getHttpServer())
			.patch(`/api/room/${roomId}`)
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({ ...roomDto, square: '5' })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(ROOM_SQUARE_ERROR)).not.toBe(-1);
			});
	});

	it('/api/room/:id (Patch): fail, square min', async () => {
		return request(app.getHttpServer())
			.patch(`/api/room/${roomId}`)
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({ square: 5 })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(ROOM_MIN_SQUARE_ERROR)).not.toBe(-1);
			});
	});

	it('/api/room/:id (Patch): fail, square max', async () => {
		return request(app.getHttpServer())
			.patch(`/api/room/${roomId}`)
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({ ...roomDto, square: 3200 })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(ROOM_MAX_SQUARE_ERROR)).not.toBe(-1);
			});
	});

	it('/api/room/:id (Patch): fail, description', () => {
		return request(app.getHttpServer())
			.patch(`/api/room/${roomId}`)
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({ ...roomDto, description: 5 })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(ROOM_DESCRIPTION_ERROR)).not.toBe(-1);
			});
	});

	it('/api/room/:id (Patch): fail, amenities', () => {
		return request(app.getHttpServer())
			.patch(`/api/room/${roomId}`)
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({ ...roomDto, amenities: 5 })
			.expect(400)
			.then(({ body }: request.Response) => {
				expect(body.message.indexOf(ROOM_AMENITIES_ERROR)).not.toBe(-1);
			});
	});

	it('/api/room/:id (Delete): success', async () => {
		return request(app.getHttpServer())
			.delete(`/api/room/${roomId}`)
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.expect(200);
	});

	it('/api/room/:id (Delete): wrong role', async () => {
		return request(app.getHttpServer())
			.delete(`/api/room/${roomId}`)
			.set('Authorization', `Bearer ${user.accessToken}`)
			.expect(403);
	});

	it('/api/room/:id (Get): fail', async () => {
		return request(app.getHttpServer()).get(`/api/room/${roomId}`).expect(404);
	});

	it('/api/room/delete/:id (Hard Delete): success', async () => {
		return request(app.getHttpServer())
			.delete(`/api/room/delete/${roomId}`)
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.expect(200);
	});

	it('/api/room/delete/:id (Hard Delete): wrong role', async () => {
		return request(app.getHttpServer())
			.delete(`/api/room/delete/${roomId}`)
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
