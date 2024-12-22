import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect } from 'mongoose';
import { RoomDto } from '../src/room/dto/room.dto';
import { RoomTypes } from '../src/room/room.types';


let roomId: string;
const roomDto: RoomDto = {
    num: 2001,
    type: RoomTypes.ONE_ROOM,
    name: 'Однокомнатная',
    square: 25,
    description: 'Просто однокомнатная квартира',
    amenities: [ 'Чайник', 'Кофемашина', 'Холодильник' ]
};

describe('Room (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api');
        await app.init();
    });

    it('/api/room/create (Post): success', async () => {
        return request(app.getHttpServer())
            .post('/api/room/create')
            .send(roomDto)
            .expect(201)
            .then(({ body }: request.Response) => {
                roomId = body._id;
                expect(roomId).toBeDefined();
            })
    });

    it('/api/room/create (Post): num, fail',() => {
        return request(app.getHttpServer())
            .post('/api/room/create')
            .send({ ...roomDto, num: "12" })
            .expect(400);
    });

    it('/api/room/create (Post): type, fail',() => {
        return request(app.getHttpServer())
            .post('/api/room/create')
            .send({ ...roomDto, type: 5 })
            .expect(400);
    });

    it('/api/room/create (Post): square, fail',() => {
        return request(app.getHttpServer())
            .post('/api/room/create')
            .send({ ...roomDto, square: 5 })
            .expect(400);
    });

    it('/api/room/create (Post): amenities, fail',() => {
        return request(app.getHttpServer())
            .post('/api/room/create')
            .send({ ...roomDto, amenities: 5 })
            .expect(400);
    });

    it('/api/room/all (Get): success', async () => {
        return request(app.getHttpServer())
            .get(`/api/room/all`)
            .expect(200)
    });

    it('/api/room/:id (Get): success', async () => {
        return request(app.getHttpServer())
            .get(`/api/room/${roomId}`)
            .expect(200)
            .then(({ body }: request.Response) => {
                expect(body.name).toBe(roomDto.name);
            })
    });

    it('/api/room/:id (patch): update', async () => {
        return request(app.getHttpServer())
            .patch(`/api/room/${roomId}`)
            .send({ ...roomDto, name: 'Правка' })
            .expect(200)
            .then(({ body }: request.Response) => {
                expect(body.name).toBe('Правка');
            })
    });

    it('/api/room/:id (Delete): success', async () => {
        return request(app.getHttpServer())
            .delete(`/api/room/${roomId}`)
            .expect(200)
    });

    it('/api/room/:id (Get): fail', async () => {
        return request(app.getHttpServer())
            .get(`/api/room/${roomId}`)
            .expect(404)
    });

    it('/api/room/delete/:id (Hard Delete): success', async () => {
        return request(app.getHttpServer())
            .delete(`/api/room/delete/${roomId}`)
            .expect(200)
    });

    afterAll(async () => {
        return disconnect();
    });

});